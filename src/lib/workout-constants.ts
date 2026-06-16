export const QUICK_LABELS = [
  "Chest",
  "Shoulders",
  "Triceps",
  "Back",
  "Biceps",
  "Legs",
  "Abs",
  "Cardio",
  "Full Body",
] as const;

export type QuickLabel = (typeof QUICK_LABELS)[number];
