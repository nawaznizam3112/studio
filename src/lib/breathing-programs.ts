import type { BreathingProgram } from '@/types/breathing';

const mkSafety = (extra: string[] = []) => [
  'Stop immediately if you feel dizzy, chest pain, severe breathlessness, or distress.',
  'This training is educational and not emergency medical care.',
  ...extra,
];

const moduleOf = (programId: string, day: number, name: string, durationTargetMinutes: number, instructions: string, inhale: number, exhale: number, hold?: number) => ({
  id: `${programId}-d${day}`,
  dayIndex: day,
  name,
  durationTargetMinutes,
  instructions,
  pattern: { inhale, exhale, hold, cycles: Math.max(4, Math.round((durationTargetMinutes * 60) / ((inhale + exhale + (hold || 0)) || 1))) },
  safetyNotes: mkSafety(),
});

export const DEFAULT_BREATHING_PROGRAMS: BreathingProgram[] = [
  {
    id: 'foundations-7',
    name: 'Foundations',
    days: 7,
    advanced: false,
    optional: false,
    requiresBreathHoldGating: false,
    contraindications: ['Acute respiratory distress', 'Uncontrolled chest pain'],
    modules: Array.from({ length: 7 }, (_, i) => moduleOf('foundations-7', i + 1, `Foundations Day ${i + 1}`, 8, 'Nasal diaphragmatic pacing with calm extended exhales.', 4, 6)),
  },
  {
    id: 'anxiety-stress-14',
    name: 'Anxiety & Stress Regulation',
    days: 14,
    advanced: false,
    optional: false,
    requiresBreathHoldGating: false,
    contraindications: ['Pause if panic escalates'],
    modules: Array.from({ length: 14 }, (_, i) => moduleOf('anxiety-stress-14', i + 1, `Anxiety & Stress Day ${i + 1}`, 10, 'Down-regulation cadence with longer exhale.', 4, 7)),
  },
  {
    id: 'sleep-winddown-10',
    name: 'Sleep Wind-Down',
    days: 10,
    advanced: false,
    optional: false,
    requiresBreathHoldGating: false,
    contraindications: ['Avoid while driving or operating equipment'],
    modules: Array.from({ length: 10 }, (_, i) => moduleOf('sleep-winddown-10', i + 1, `Sleep Wind-Down Day ${i + 1}`, 10, 'Bedtime breathing to lower arousal and settle body.', 4, 8)),
  },
  {
    id: 'copd-asthma-gentle-10',
    name: 'COPD/Asthma-friendly Gentle Breath',
    days: 10,
    advanced: false,
    optional: true,
    requiresBreathHoldGating: false,
    contraindications: ['No breath-holding by default', 'Keep intensity gentle'],
    modules: Array.from({ length: 10 }, (_, i) => ({
      ...moduleOf('copd-asthma-gentle-10', i + 1, `Gentle Breath Day ${i + 1}`, 8, 'Pursed-lip exhale with gentle nasal inhale pacing.', 3, 5),
      pattern: { inhale: 3, exhale: 5, cycles: 60 },
      safetyNotes: mkSafety(['No breath holds unless clinician explicitly enables and patient tolerates.']),
    })),
  },
  {
    id: 'performance-co2-14',
    name: 'Performance / CO₂ tolerance',
    days: 14,
    advanced: true,
    optional: true,
    requiresBreathHoldGating: true,
    contraindications: ['Not for pregnancy', 'Not for uncontrolled hypertension', 'Not for cardiac instability'],
    modules: Array.from({ length: 14 }, (_, i) => moduleOf('performance-co2-14', i + 1, `CO₂ Tolerance Day ${i + 1}`, 12, 'Controlled cadence with optional short holds when clinician-enabled.', 4, 6, 2)),
  },
];
