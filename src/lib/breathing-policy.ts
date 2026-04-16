export const roleGroupForUser = (role?: string): 'clinician' | 'patient' | null => {
  if (!role) return null;
  if (['clinician', 'admin', 'business'].includes(role)) return 'clinician';
  if (['patient', 'customer'].includes(role)) return 'patient';
  return null;
};

export const canAssignProgram = (requiresBreathHoldGating: boolean, enableAdvancedHolds?: boolean): boolean => {
  if (!requiresBreathHoldGating) return true;
  return !!enableAdvancedHolds;
};

export const buildCompletionStatus = (totalModules: number, completedCount: number) => ({
  completedCount,
  totalModules,
  status: completedCount >= totalModules && totalModules > 0 ? 'completed' : 'active',
});

export const shouldAnonymizeRecord = (recordDate: Date, retentionMonths: number, now = new Date()): boolean => {
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - Math.max(1, retentionMonths));
  return recordDate < cutoff;
};
