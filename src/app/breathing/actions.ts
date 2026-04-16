'use server';

import { z } from 'zod';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  Timestamp,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DEFAULT_BREATHING_PROGRAMS } from '@/lib/breathing-programs';
import { calculateCompletionRate, calculateStreak, daysSinceLastSession } from '@/lib/breathing-analytics';
import { canAssignProgram, roleGroupForUser, shouldAnonymizeRecord } from '@/lib/breathing-policy';

async function getUserDoc(userId: string) {
  const snap = await getDoc(doc(db, 'users', userId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as any;
}

async function assertRole(userId: string, required: 'clinician' | 'patient') {
  const user = await getUserDoc(userId);
  if (!user) throw new Error('User not found.');
  const group = roleGroupForUser(user.role);
  if (group !== required) throw new Error('Unauthorized role for this action.');
  return user;
}

async function audit(actorUserId: string, action: string, targetUserId?: string, metadata?: Record<string, unknown>) {
  await addDoc(collection(db, 'breathingAuditLogs'), {
    actorUserId,
    action,
    targetUserId: targetUserId || null,
    metadata: metadata || {},
    createdAt: serverTimestamp(),
  });
}

export async function seedBreathingPrograms(actorUserId: string) {
  await assertRole(actorUserId, 'clinician');
  const writes = DEFAULT_BREATHING_PROGRAMS.map((program) =>
    setDoc(doc(db, 'breathingPrograms', program.id), {
      ...program,
      updatedAt: serverTimestamp(),
    }, { merge: true })
  );
  await Promise.all(writes);
  await audit(actorUserId, 'seed_program_library');
  return { success: true, count: DEFAULT_BREATHING_PROGRAMS.length };
}

const inviteSchema = z.object({
  actorUserId: z.string().min(1),
  email: z.string().email(),
  fullName: z.string().min(1),
});

export async function createPatientInvite(input: z.infer<typeof inviteSchema>) {
  const validated = inviteSchema.parse(input);
  await assertRole(validated.actorUserId, 'clinician');
  const token = `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  const ref = await addDoc(collection(db, 'patientInvites'), {
    token,
    email: validated.email.toLowerCase(),
    fullName: validated.fullName,
    clinicianId: validated.actorUserId,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
  await audit(validated.actorUserId, 'patient_invite_created', undefined, { inviteId: ref.id });
  return { success: true, token, inviteLink: `/patient/enroll?token=${token}` };
}

const acceptInviteSchema = z.object({
  token: z.string().min(8),
  password: z.string().min(6),
  phone: z.string().min(10),
});

export async function acceptPatientInvite(input: z.infer<typeof acceptInviteSchema>) {
  const validated = acceptInviteSchema.parse(input);
  const q = query(collection(db, 'patientInvites'), where('token', '==', validated.token), limit(1));
  const inviteSnap = await getDocs(q);
  if (inviteSnap.empty) return { success: false, error: 'Invite not found.' };
  const invite = inviteSnap.docs[0];
  const inviteData = invite.data() as any;
  if (inviteData.status !== 'pending') return { success: false, error: 'Invite already used.' };

  const existingUserQuery = query(collection(db, 'users'), where('email', '==', inviteData.email));
  const existingUser = await getDocs(existingUserQuery);
  let userId = existingUser.empty ? `user_${Date.now()}` : existingUser.docs[0].id;

  await setDoc(doc(db, 'users', userId), {
    email: inviteData.email,
    name: inviteData.fullName,
    phone: validated.phone,
    password: validated.password,
    role: 'patient',
    clinicianId: inviteData.clinicianId,
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  }, { merge: true });

  await updateDoc(invite.ref, { status: 'accepted', acceptedAt: serverTimestamp(), patientId: userId });
  await setDoc(doc(db, 'patients', userId), {
    userId,
    clinicianId: inviteData.clinicianId,
    email: inviteData.email,
    fullName: inviteData.fullName,
    createdAt: serverTimestamp(),
  }, { merge: true });
  await audit(inviteData.clinicianId, 'patient_enrolled', userId);
  return { success: true, userId };
}

export async function getBreathingPrograms() {
  const snapshot = await getDocs(collection(db, 'breathingPrograms'));
  if (!snapshot.empty) return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  return DEFAULT_BREATHING_PROGRAMS;
}

const assignSchema = z.object({
  actorUserId: z.string().min(1),
  patientId: z.string().min(1),
  programId: z.string().min(1),
  startDate: z.string().min(1),
  scheduleType: z.enum(['daily', 'custom']),
  customDays: z.array(z.number().min(0).max(6)).optional(),
  reminderEnabled: z.boolean().optional(),
  reminderTime: z.string().optional(),
  customizedPattern: z.object({
    inhale: z.number().optional(),
    exhale: z.number().optional(),
    hold: z.number().optional(),
    cycles: z.number().optional(),
    disableHolds: z.boolean().optional(),
  }).optional(),
  enableAdvancedHolds: z.boolean().optional(),
});

export async function assignBreathingProgram(input: z.infer<typeof assignSchema>) {
  const validated = assignSchema.parse(input);
  await assertRole(validated.actorUserId, 'clinician');

  const patient = await getUserDoc(validated.patientId);
  if (!patient || roleGroupForUser(patient.role) !== 'patient') {
    return { success: false, error: 'Target user is not a patient.' };
  }

  const programSnap = await getDoc(doc(db, 'breathingPrograms', validated.programId));
  const program = programSnap.exists() ? (programSnap.data() as any) : DEFAULT_BREATHING_PROGRAMS.find((p) => p.id === validated.programId);
  if (!program) return { success: false, error: 'Program not found.' };
  if (!canAssignProgram(!!program.requiresBreathHoldGating, validated.enableAdvancedHolds)) {
    return { success: false, error: 'Advanced holds are clinician-gated and currently disabled.' };
  }

  const assignment = await addDoc(collection(db, 'breathingAssignments'), {
    ...validated,
    status: 'active',
    clinicianId: validated.actorUserId,
    createdAt: serverTimestamp(),
  });
  await audit(validated.actorUserId, 'program_assigned', validated.patientId, { assignmentId: assignment.id, programId: validated.programId });
  return { success: true, assignmentId: assignment.id };
}

export async function getClinicianPatients(actorUserId: string) {
  await assertRole(actorUserId, 'clinician');
  const assignmentSnap = await getDocs(query(collection(db, 'breathingAssignments'), where('clinicianId', '==', actorUserId)));
  const assignedPatientIds = new Set(assignmentSnap.docs.map((d) => (d.data() as any).patientId).filter(Boolean));
  const users = await getDocs(collection(db, 'users'));
  const list = users.docs
    .map((d) => ({ id: d.id, ...d.data() } as any))
    .filter((u) => roleGroupForUser(u.role) === 'patient' && (u.clinicianId === actorUserId || assignedPatientIds.has(u.id)));
  await audit(actorUserId, 'patient_list_accessed');
  return list;
}

export async function getPatientAssignments(patientUserId: string) {
  await assertRole(patientUserId, 'patient');
  const q = query(collection(db, 'breathingAssignments'), where('patientId', '==', patientUserId), where('status', '==', 'active'));
  const snapshot = await getDocs(q);
  const rows = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as any));
  return rows;
}

export async function getPatientTimeline(patientUserId: string) {
  const assignments = await getPatientAssignments(patientUserId);
  const completions = await getDocs(query(collection(db, 'breathingSessionCompletions'), where('patientId', '==', patientUserId)));
  const completedByAssignment = completions.docs.reduce((acc, d) => {
    const row = d.data() as any;
    const key = row.assignmentId;
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const programSnap = await getDocs(collection(db, 'breathingPrograms'));
  const programs = Object.fromEntries(programSnap.docs.map((d) => [d.id, d.data()])) as Record<string, any>;

  return assignments.map((assignment: any) => {
    const program = programs[assignment.programId] || DEFAULT_BREATHING_PROGRAMS.find((p) => p.id === assignment.programId);
    const completedCount = completedByAssignment[assignment.id] || 0;
    const nextModule = program?.modules?.[Math.min(completedCount, (program?.modules?.length || 1) - 1)] || null;
    return {
      ...assignment,
      completedCount,
      totalModules: program?.modules?.length || 0,
      nextModuleId: nextModule?.id || null,
    };
  });
}

export async function acknowledgePatientSafety(patientUserId: string) {
  await assertRole(patientUserId, 'patient');
  await updateDoc(doc(db, 'users', patientUserId), {
    breathingSafetyAcknowledgedAt: serverTimestamp(),
  });
  return { success: true };
}

export async function getPatientSafetyStatus(patientUserId: string) {
  const user = await assertRole(patientUserId, 'patient');
  return { acknowledged: !!user.breathingSafetyAcknowledgedAt };
}

const completionSchema = z.object({
  patientUserId: z.string().min(1),
  assignmentId: z.string().min(1),
  moduleId: z.string().min(1),
  durationSeconds: z.number().min(1),
  notes: z.string().max(1500).optional(),
  preCheckin: z.object({ anxiety: z.number().min(0).max(10).optional(), breathlessness: z.number().min(0).max(10).optional(), sleepQuality: z.number().min(1).max(5).optional() }).optional(),
  postCheckin: z.object({ anxiety: z.number().min(0).max(10).optional(), breathlessness: z.number().min(0).max(10).optional(), sleepQuality: z.number().min(1).max(5).optional() }).optional(),
});

export async function completeBreathingSession(input: z.infer<typeof completionSchema>) {
  const validated = completionSchema.parse(input);
  await assertRole(validated.patientUserId, 'patient');

  const assignment = await getDoc(doc(db, 'breathingAssignments', validated.assignmentId));
  if (!assignment.exists()) return { success: false, error: 'Assignment not found.' };
  const a = assignment.data() as any;
  if (a.patientId !== validated.patientUserId) return { success: false, error: 'Unauthorized assignment access.' };

  const completionRef = await addDoc(collection(db, 'breathingSessionCompletions'), {
    patientId: validated.patientUserId,
    clinicianId: a.clinicianId,
    assignmentId: validated.assignmentId,
    programId: a.programId,
    moduleId: validated.moduleId,
    durationSeconds: validated.durationSeconds,
    notes: validated.notes || null,
    completedAt: serverTimestamp(),
  });

  await addDoc(collection(db, 'breathingOutcomes'), {
    completionId: completionRef.id,
    patientId: validated.patientUserId,
    assignmentId: validated.assignmentId,
    preCheckin: validated.preCheckin || null,
    postCheckin: validated.postCheckin || null,
    createdAt: serverTimestamp(),
  });

  await audit(validated.patientUserId, 'session_completed', validated.patientUserId, { assignmentId: validated.assignmentId, moduleId: validated.moduleId });
  return { success: true };
}

const toDate = (v: any): Date | null => {
  if (!v) return null;
  if (v instanceof Timestamp) return v.toDate();
  const d = new Date(v);
  return Number.isNaN(d.valueOf()) ? null : d;
};

export async function getPatientProgressSummary(patientUserId: string) {
  await assertRole(patientUserId, 'patient');
  const q = query(collection(db, 'breathingSessionCompletions'), where('patientId', '==', patientUserId));
  const snap = await getDocs(q);
  const dates = snap.docs
    .map((d) => toDate((d.data() as any).completedAt))
    .filter((d): d is Date => !!d);

  return {
    completion7: calculateCompletionRate(dates, 7),
    completion14: calculateCompletionRate(dates, 14),
    completion30: calculateCompletionRate(dates, 30),
    streak: calculateStreak(dates),
    lastSessionDaysAgo: daysSinceLastSession(dates),
    totalSessions: dates.length,
  };
}

export async function getClinicianDashboardData(actorUserId: string, atRiskDays = 3) {
  await assertRole(actorUserId, 'clinician');
  const patients = await getClinicianPatients(actorUserId);
  const rows = await Promise.all(
    patients.map(async (p: any) => {
      const q = query(collection(db, 'breathingSessionCompletions'), where('patientId', '==', p.id));
      const snap = await getDocs(q);
      const dates = snap.docs.map((d) => toDate((d.data() as any).completedAt)).filter((d): d is Date => !!d);
      return {
        patientId: p.id,
        patientName: p.name || p.email || 'Patient',
        completion7: calculateCompletionRate(dates, 7),
        completion14: calculateCompletionRate(dates, 14),
        completion30: calculateCompletionRate(dates, 30),
        streak: calculateStreak(dates),
        atRisk: daysSinceLastSession(dates) >= atRiskDays,
      };
    })
  );
  return rows;
}

export async function getRetentionConfig(actorUserId: string) {
  await assertRole(actorUserId, 'clinician');
  const retention = await getDoc(doc(db, 'breathingRetentionConfig', 'default'));
  if (!retention.exists()) return { retentionMonths: 24 };
  return retention.data() as { retentionMonths: number };
}

export async function setRetentionConfig(actorUserId: string, retentionMonths: number) {
  await assertRole(actorUserId, 'clinician');
  await setDoc(doc(db, 'breathingRetentionConfig', 'default'), { retentionMonths, updatedAt: serverTimestamp(), updatedBy: actorUserId }, { merge: true });
  await audit(actorUserId, 'retention_config_updated', undefined, { retentionMonths });
  return { success: true };
}

export async function runBreathingRetentionJob(actorUserId: string) {
  await assertRole(actorUserId, 'clinician');
  const config = await getRetentionConfig(actorUserId);
  const completionSnap = await getDocs(collection(db, 'breathingSessionCompletions'));
  let anonymized = 0;

  await Promise.all(completionSnap.docs.map(async (d) => {
    const data = d.data() as any;
    const completedAt = toDate(data.completedAt);
    if (completedAt && shouldAnonymizeRecord(completedAt, config.retentionMonths || 24)) {
      anonymized += 1;
      await updateDoc(d.ref, {
        patientId: 'anonymized',
        notes: null,
        anonymizedAt: serverTimestamp(),
      });
    }
  }));

  const outcomesSnap = await getDocs(collection(db, 'breathingOutcomes'));
  await Promise.all(outcomesSnap.docs.map(async (d) => {
    const data = d.data() as any;
    const createdAt = toDate(data.createdAt);
    if (createdAt && shouldAnonymizeRecord(createdAt, config.retentionMonths || 24)) {
      await updateDoc(d.ref, {
        patientId: 'anonymized',
        preCheckin: null,
        postCheckin: null,
        anonymizedAt: serverTimestamp(),
      });
    }
  }));

  await audit(actorUserId, 'retention_job_run', undefined, { anonymized });
  return { success: true, anonymized };
}
