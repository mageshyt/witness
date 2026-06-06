export const queryKeys = {
  dailyLog: (date: string) => ["daily-log", date] as const,
  profile: () => ["profile"] as const,
  weightEntries: () => ["weight-entries"] as const,
  metrics: () => ["metrics"] as const,
};
