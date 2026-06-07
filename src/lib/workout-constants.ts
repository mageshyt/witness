export const QUICK_LABELS = [
  "Chest",
  "Shoulders",
  "Triceps",
  "Back",
  "Biceps",
  "Legs",
  "Push",
  "Pull",
  "Arms",
  "Core",
  "Full Body",
  "Cardio",
] as const;

export type QuickLabel = (typeof QUICK_LABELS)[number];
