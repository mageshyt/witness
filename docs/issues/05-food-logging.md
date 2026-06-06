# Issue 5: Food logging — manual entry + daily totals

## What to build

Full food entry CRUD on the DailyLog page. User can add food items manually (name, quantity in grams, calories, protein), see the full list of entries for the day, edit or delete any entry, and see the daily calorie and protein totals update in the stat cards. The photo attachment button is rendered but shows a "Coming soon" toast when tapped — no upload implemented.

## Acceptance criteria

- [ ] "Add Food" button opens a shadcn/ui Sheet or Dialog with fields: name (text), quantity (g, number), calories (kcal, number), protein (g, number)
- [ ] Submitting the form creates a `FoodEntry` linked to the current day's `DailyLog`
- [ ] Food entries are listed below the stat cards, showing: name, quantity, calorie pill (coral), protein pill (cyan)
- [ ] Each entry has Edit (opens pre-filled form) and Delete (with confirm dialog) actions
- [ ] Calorie stat card shows sum of all `FoodEntry.calories` for the day
- [ ] Protein stat card shows sum of all `FoodEntry.proteinG` for the day
- [ ] Progress bar on each stat card shows actual vs. target (from `UserProfile`); shows flat bar if no profile set
- [ ] Photo attachment icon on each food entry row shows shadcn/ui Toast: "Photo upload coming soon" on click
- [ ] All mutations use Next.js Server Actions; page re-validates after each mutation

## Blocked by

- Issue #4 — DailyLog today view shell
