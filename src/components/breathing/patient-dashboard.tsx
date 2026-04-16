'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GuidedSession } from './guided-session';
import type { BreathingProgram } from '@/types/breathing';
import {
  acknowledgePatientSafety,
  completeBreathingSession,
  getBreathingPrograms,
  getPatientProgressSummary,
  getPatientSafetyStatus,
  getPatientTimeline,
} from '@/app/breathing/actions';

export function PatientDashboard() {
  const { session, loading } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [acknowledged, setAcknowledged] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [programMap, setProgramMap] = useState<Record<string, BreathingProgram>>({});
  const [summary, setSummary] = useState<any>(null);
  const [anxietyPre, setAnxietyPre] = useState(0);
  const [anxietyPost, setAnxietyPost] = useState(0);
  const [breathPre, setBreathPre] = useState(0);
  const [breathPost, setBreathPost] = useState(0);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [notes, setNotes] = useState('');

  const refresh = async (patientUserId: string) => {
    const [s, a, p, progr] = await Promise.all([
      getPatientSafetyStatus(patientUserId),
      getPatientTimeline(patientUserId),
      getPatientProgressSummary(patientUserId),
      getBreathingPrograms() as Promise<BreathingProgram[]>,
    ]);
    setAcknowledged(s.acknowledged);
    setAssignments(a);
    setSummary(p);
    setProgramMap(Object.fromEntries(progr.map((item) => [item.id, item])));
  };

  useEffect(() => {
    if (loading) return;
    if (!session || !['patient', 'customer'].includes(session.role)) {
      router.push('/login?audience=patient');
      return;
    }
    refresh(session.userId);
  }, [session, loading, router]);

  const nextSession = useMemo(() => {
    if (!assignments.length) return null;
    const assignment = assignments[0];
    const program = programMap[assignment.programId];
    if (!program?.modules?.length) return null;
    const module = program.modules.find((m: any) => m.id === assignment.nextModuleId) || program.modules[0];
    return { assignment, module, program };
  }, [assignments, programMap]);

  if (!session) return null;

  if (!acknowledged) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader><CardTitle>Safety Acknowledgment Required</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>Stop the session if you feel dizzy, chest pain, severe shortness of breath, or distress.</p>
            <p>This app is educational support and does not replace emergency care.</p>
            <Button onClick={() => startTransition(async () => {
              await acknowledgePatientSafety(session.userId);
              await refresh(session.userId);
            })} disabled={isPending}>I acknowledge patient safety guidance</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Patient Breathing Timeline</h1>
        <p className="text-sm text-muted-foreground">Your next due session and progress metrics.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Progress</CardTitle></CardHeader>
        <CardContent className="text-sm">
          <p>Completion rate: 7d {summary?.completion7 || 0}% • 14d {summary?.completion14 || 0}% • 30d {summary?.completion30 || 0}%</p>
          <p>Current streak: {summary?.streak || 0} day(s)</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Assigned programs</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 text-sm">
            {assignments.map((a) => <li key={a.id}>{programMap[a.programId]?.name || a.programId} • starts {a.startDate} • {a.completedCount}/{a.totalModules} modules</li>)}
          </ul>
        </CardContent>
      </Card>

      {nextSession ? (
        <Card>
          <CardHeader><CardTitle>Next guided session: {nextSession.module.name}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">{nextSession.module.instructions}</p>
            <p className="text-xs text-muted-foreground">Safety notes: {nextSession.module.safetyNotes?.join(' | ')}</p>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <div><Label>Pre anxiety (0-10)</Label><Input type="number" min={0} max={10} value={anxietyPre} onChange={(e) => setAnxietyPre(Number(e.target.value || 0))} /></div>
              <div><Label>Post anxiety (0-10)</Label><Input type="number" min={0} max={10} value={anxietyPost} onChange={(e) => setAnxietyPost(Number(e.target.value || 0))} /></div>
              <div><Label>Pre breathlessness (0-10)</Label><Input type="number" min={0} max={10} value={breathPre} onChange={(e) => setBreathPre(Number(e.target.value || 0))} /></div>
              <div><Label>Post breathlessness (0-10)</Label><Input type="number" min={0} max={10} value={breathPost} onChange={(e) => setBreathPost(Number(e.target.value || 0))} /></div>
              <div><Label>Sleep quality (1-5)</Label><Input type="number" min={1} max={5} value={sleepQuality} onChange={(e) => setSleepQuality(Number(e.target.value || 1))} /></div>
            </div>
            <div><Label>Optional notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
            <GuidedSession
              inhale={nextSession.module.pattern?.inhale || 4}
              exhale={nextSession.module.pattern?.exhale || 6}
              hold={nextSession.assignment?.customizedPattern?.disableHolds ? 0 : (nextSession.module.pattern?.hold || 0)}
              cycles={nextSession.module.pattern?.cycles || 6}
              onComplete={(durationSeconds) => startTransition(async () => {
                await completeBreathingSession({
                  patientUserId: session.userId,
                  assignmentId: nextSession.assignment.id,
                  moduleId: nextSession.module.id,
                  durationSeconds,
                  notes,
                  preCheckin: { anxiety: anxietyPre, breathlessness: breathPre, sleepQuality },
                  postCheckin: { anxiety: anxietyPost, breathlessness: breathPost, sleepQuality },
                });
                await refresh(session.userId);
              })}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
