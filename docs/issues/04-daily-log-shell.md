# Issue 4: DailyLog — today view shell

## What to build

The central `/today` page that serves as the daily dashboard. On first visit for a given date, a `DailyLog` record is auto-created for the authenticated user. The page shows four stat cards (calories, protein, workout count, body weight) as placeholders ready for real data in later slices. A date picker / navigation allows viewing any past day's log.

## Acceptance criteria

- [ ] `/today` renders the DailyLog for today; auto-creates the record if it doesn't exist for today's date
- [ ] URL supports `/today?date=YYYY-MM-DD` to view any past day's log
- [ ] Date navigation (previous/next day arrows + date display) works correctly
- [ ] Four stat cards displayed: Calories (coral `#FF5C38`), Protein (cyan `#00D4FF`), Workouts (violet `#A259FF`), Body Weight (amber `#FFB020`) — showing `—` when no data yet
- [ ] Navigation bar visible with links to: Today, Metrics, Profile
- [ ] Page layout matches design system: dark surface cards, correct accent colors per stat type
- [ ] Unauthenticated access redirects to `/login`

## Blocked by

- Issue #2 — Authentication
