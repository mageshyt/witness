# Issue 7: Workout logging — session, exercises, sets

## What to build

Full workout logging on the DailyLog page. User creates a named `WorkoutSession` (e.g. "Chest & Shoulders"), adds `Exercise` entries to it (e.g. "Bench Press"), and logs `ExerciseSet` rows per exercise (set number, reps, optional weight in kg). Multiple sessions per day are supported. Edit and delete work at every level of the hierarchy.

## Acceptance criteria

- [ ] "Add Workout" button opens a form to create a `WorkoutSession` with a text label
- [ ] Created sessions appear on the daily page as expandable cards with the violet (`#A259FF`) accent
- [ ] Inside a session, "Add Exercise" adds an `Exercise` (name text field, order preserved)
- [ ] Each exercise shows a set logger table: columns Set #, Weight (kg, optional), Reps
- [ ] "+ Add Set" appends a new `ExerciseSet` row; set number auto-increments
- [ ] Inline editing: weight and reps inputs are editable in place; changes save on blur via Server Action
- [ ] Delete buttons at session, exercise, and set level (confirm dialog for session/exercise delete; set delete is immediate)
- [ ] Workout stat card on the daily view shows count of sessions for the day
- [ ] Total sets and total reps for the day shown as sub-label on the workout stat card
- [ ] Multiple sessions on the same day all appear in the list

## Blocked by

- Issue #4 — DailyLog today view shell
