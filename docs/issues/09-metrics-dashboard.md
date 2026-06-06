# Issue 9: Metrics dashboard

## What to build

A `/metrics` page aggregating data across all DailyLogs for the authenticated user. Shows: weekly calorie and protein summary bar chart, body weight trend line chart, per-exercise max weight over time, weekly training volume (sets × reps), and a login-day streak counter. Charts rendered with Recharts (already a shadcn/ui dependency).

## Acceptance criteria

- [ ] `/metrics` page is accessible from the main navigation
- [ ] **Weekly nutrition chart**: grouped bar chart showing daily calories (coral) and protein (cyan) for the last 7 days; target lines shown as dashed horizontal reference lines
- [ ] **Body weight trend**: line chart of all `BodyWeightEntry` records over time (amber); empty state shown if fewer than 2 entries
- [ ] **Per-exercise max weight**: for each unique exercise name, show the heaviest `ExerciseSet.weightKg` logged and the date it was achieved; displayed as a sortable list
- [ ] **Weekly training volume**: total sets × reps per exercise for the current week; displayed as a horizontal bar chart (violet)
- [ ] **Streak counter**: number of consecutive days (counting backwards from today) where both at least one `FoodEntry` AND at least one `WorkoutSession` were logged; displayed as a large number with the design system streak widget style
- [ ] All charts are responsive (use `ResponsiveContainer` from Recharts)
- [ ] Empty states shown for each section when insufficient data exists (first-time user)
- [ ] Page uses the design system dark surfaces and semantic accent colors

## Blocked by

- Issue #5 — Food logging
- Issue #7 — Workout logging
- Issue #8 — Body weight logging
