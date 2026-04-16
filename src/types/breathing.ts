export type BreathingUserRole = 'clinician' | 'patient';

export interface BreathingPattern {
  inhale: number;
  exhale: number;
  hold?: number;
  cycles: number;
}

export interface BreathingModule {
  id: string;
  dayIndex: number;
  name: string;
  durationTargetMinutes: number;
  instructions: string;
  pattern?: BreathingPattern;
  safetyNotes: string[];
}

export interface BreathingProgram {
  id: string;
  name: string;
  days: number;
  advanced: boolean;
  optional: boolean;
  requiresBreathHoldGating: boolean;
  contraindications: string[];
  modules: BreathingModule[];
}

export interface ProgramAssignment {
  id: string;
  clinicianId: string;
  patientId: string;
  programId: string;
  startDate: string;
  scheduleType: 'daily' | 'custom';
  customDays?: number[];
  reminderEnabled?: boolean;
  reminderTime?: string;
  customizedPattern?: Partial<BreathingPattern> & { disableHolds?: boolean };
  enableAdvancedHolds?: boolean;
  status: 'active' | 'completed' | 'paused';
}

export interface SymptomCheckin {
  anxiety?: number;
  breathlessness?: number;
  sleepQuality?: number;
}
