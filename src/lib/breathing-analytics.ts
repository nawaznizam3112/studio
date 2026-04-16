const toDateKey = (d: Date) => d.toISOString().split('T')[0];

export const calculateCompletionRate = (completedDates: Date[], days: number): number => {
  if (!days) return 0;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days + 1);
  const unique = new Set(
    completedDates.filter((d) => d >= cutoff).map((d) => toDateKey(d))
  );
  return Math.min(100, Math.round((unique.size / days) * 100));
};

export const calculateStreak = (completedDates: Date[]): number => {
  if (!completedDates.length) return 0;
  const set = new Set(completedDates.map((d) => toDateKey(d)));
  let streak = 0;
  const cursor = new Date();
  while (set.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

export const daysSinceLastSession = (completedDates: Date[]): number => {
  if (!completedDates.length) return Number.MAX_SAFE_INTEGER;
  const latest = completedDates
    .map((d) => d.getTime())
    .sort((a, b) => b - a)[0];
  return Math.floor((Date.now() - latest) / (24 * 60 * 60 * 1000));
};
