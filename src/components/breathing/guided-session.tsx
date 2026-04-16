'use client';

import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

type Step = 'inhale' | 'hold' | 'exhale';

export function GuidedSession({ inhale, exhale, hold = 0, cycles, onComplete }: { inhale: number; exhale: number; hold?: number; cycles: number; onComplete: (seconds: number) => void }) {
  const sequence = useMemo(() => {
    const items: { step: Step; seconds: number }[] = [{ step: 'inhale', seconds: inhale }];
    if (hold > 0) items.push({ step: 'hold', seconds: hold });
    items.push({ step: 'exhale', seconds: exhale });
    return items;
  }, [inhale, exhale, hold]);

  const [started, setStarted] = useState(false);
  const [cycle, setCycle] = useState(1);
  const [stepIndex, setStepIndex] = useState(0);
  const [remaining, setRemaining] = useState(sequence[0]?.seconds || 0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => {
      setElapsed((e) => e + 1);
      setRemaining((r) => {
        if (r > 1) return r - 1;
        const nextStep = stepIndex + 1;
        if (nextStep < sequence.length) {
          setStepIndex(nextStep);
          return sequence[nextStep].seconds;
        }
        if (cycle < cycles) {
          setCycle((c) => c + 1);
          setStepIndex(0);
          return sequence[0].seconds;
        }
        clearInterval(id);
        onComplete(elapsed + 1);
        setStarted(false);
        return 0;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [started, stepIndex, sequence, cycle, cycles, elapsed, onComplete]);

  const step = sequence[stepIndex]?.step || 'inhale';

  return (
    <div className="space-y-3 rounded border p-4">
      <p className="text-sm text-muted-foreground">Cycle {cycle}/{cycles}</p>
      <p className="text-2xl font-bold capitalize">{step}</p>
      <p className="text-4xl font-semibold">{remaining}s</p>
      <Button onClick={() => { setStarted(true); setCycle(1); setStepIndex(0); setRemaining(sequence[0].seconds); setElapsed(0); }} disabled={started}>
        {started ? 'Session Running...' : 'Start Guided Session'}
      </Button>
    </div>
  );
}
