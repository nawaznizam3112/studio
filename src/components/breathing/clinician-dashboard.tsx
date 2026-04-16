'use client';

import { useEffect, useState, useTransition } from 'react';
import { useSession } from '@/hooks/use-session';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  assignBreathingProgram,
  createPatientInvite,
  getBreathingPrograms,
  getClinicianDashboardData,
  getClinicianPatients,
  getRetentionConfig,
  runBreathingRetentionJob,
  seedBreathingPrograms,
  setRetentionConfig,
} from '@/app/breathing/actions';

export function ClinicianDashboard() {
  const { session, loading } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [patients, setPatients] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [patientId, setPatientId] = useState('');
  const [programId, setProgramId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [enableHolds, setEnableHolds] = useState(false);
  const [retentionMonths, setRetentionMonths] = useState(24);

  const refresh = async (actorId: string) => {
    const [p, pr, d, r] = await Promise.all([
      getClinicianPatients(actorId),
      getBreathingPrograms(),
      getClinicianDashboardData(actorId),
      getRetentionConfig(actorId),
    ]);
    setPatients(p);
    setPrograms(pr);
    setProgress(d);
    setRetentionMonths(r.retentionMonths || 24);
  };

  useEffect(() => {
    if (loading) return;
    if (!session || !['clinician', 'business', 'admin'].includes(session.role)) {
      router.push('/login?audience=clinician');
      return;
    }
    refresh(session.userId);
  }, [session, loading, router]);

  if (!session) return null;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Clinician Breathing Dashboard</h1>
        <p className="text-sm text-muted-foreground">HIPAA-conscious controls: least privilege, assignment audit logging, PHI-safe operational logging.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Program Library</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={() => startTransition(async () => { await seedBreathingPrograms(session.userId); await refresh(session.userId); })} disabled={isPending}>Seed default breathing programs</Button>
          <ul className="list-disc pl-6 text-sm">
            {programs.map((p: any) => <li key={p.id}>{p.name} ({p.days} days){p.advanced ? ' • advanced' : ''}</li>)}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Enroll Patient (Invite)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Label>Patient full name</Label>
          <Input value={inviteName} onChange={(e) => setInviteName(e.target.value)} />
          <Label>Patient email</Label>
          <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
          <Button onClick={() => startTransition(async () => {
            const res = await createPatientInvite({ actorUserId: session.userId, fullName: inviteName, email: inviteEmail });
            if (res.success) setInviteLink(res.inviteLink);
            await refresh(session.userId);
          })} disabled={isPending || !inviteEmail || !inviteName}>Create invite</Button>
          {inviteLink ? <p className="text-sm">Invite link: <code>{inviteLink}</code></p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Assign Program</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Label>Patient</Label>
          <select className="w-full rounded border p-2" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
            <option value="">Select patient</option>
            {patients.map((p: any) => <option key={p.id} value={p.id}>{p.name || p.email || p.id}</option>)}
          </select>
          <Label>Program</Label>
          <select className="w-full rounded border p-2" value={programId} onChange={(e) => setProgramId(e.target.value)}>
            <option value="">Select program</option>
            {programs.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <Label>Start date</Label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <div className="flex items-center gap-2">
            <Checkbox checked={enableHolds} onCheckedChange={(v) => setEnableHolds(Boolean(v))} id="holds" />
            <Label htmlFor="holds">Enable advanced breath-holds (clinician gated)</Label>
          </div>
          <Button onClick={() => startTransition(async () => {
            await assignBreathingProgram({ actorUserId: session.userId, patientId, programId, startDate, scheduleType: 'daily', enableAdvancedHolds: enableHolds });
            await refresh(session.userId);
          })} disabled={isPending || !patientId || !programId}>Assign</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Progress + Risk</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {progress.map((row: any) => (
              <li key={row.patientId} className="rounded border p-2">
                <strong>{row.patientName}</strong> • 7d: {row.completion7}% • 14d: {row.completion14}% • 30d: {row.completion30}% • streak: {row.streak} {row.atRisk ? '• AT RISK' : ''}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Data Retention (India aware)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Label>Retention in months</Label>
          <Input type="number" min={1} value={retentionMonths} onChange={(e) => setRetentionMonths(Number(e.target.value || 1))} />
          <div className="flex gap-2">
            <Button onClick={() => startTransition(async () => { await setRetentionConfig(session.userId, retentionMonths); })} disabled={isPending}>Save retention</Button>
            <Button variant="outline" onClick={() => startTransition(async () => { await runBreathingRetentionJob(session.userId); await refresh(session.userId); })} disabled={isPending}>Run retention job now</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
