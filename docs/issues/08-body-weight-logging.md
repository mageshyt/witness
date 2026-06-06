# Issue 8: Body weight logging

## What to build

Optional body weight entry on the DailyLog page, stored as a `BodyWeightEntry` record (independent of `DailyLog` to support infrequent logging). The body weight stat card on the daily view shows the most recent entry. BMI on the profile page updates to use the most recent entry. A weight history list is shown on the profile page. The daily progress photo button is rendered but shows a "Coming soon" toast.

## Acceptance criteria

- [ ] Body weight stat card on the daily page has a "+ Log Weight" button
- [ ] Clicking it opens a small form: weight (kg, decimal), date pre-filled to today
- [ ] Submitting creates a `BodyWeightEntry` for the user; card updates to show the new value
- [ ] If a `BodyWeightEntry` already exists for today, the form pre-fills with it (upsert behavior)
- [ ] Body weight stat card shows the most recent `BodyWeightEntry.weightKg` across all dates (not just today)
- [ ] Profile page shows a chronological list of all `BodyWeightEntry` records (date + weight)
- [ ] BMI on profile page recalculates using the most recent `BodyWeightEntry` automatically
- [ ] "Upload Progress Photo" button on the daily page shows shadcn/ui Toast: "Photo upload coming soon"
- [ ] Weight entry works correctly whether the user logs daily or skips days

## Blocked by

- Issue #3 — User profile setup
- Issue #4 — DailyLog today view shell
