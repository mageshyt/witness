# Issue 3: User profile setup

## What to build

Profile settings page where the user enters their biological sex, height (cm), base weight (kg), daily calorie target, and daily protein target. BMI is calculated from height + most recent BodyWeightEntry (falling back to base weight) and displayed on the page. Data is upserted to `UserProfile` on save.

## Acceptance criteria

- [ ] `/profile` page renders a form with: sex (Male/Female select), height (cm), base weight (kg), calorie target (kcal), protein target (g)
- [ ] Submitting the form upserts `UserProfile` for the logged-in user
- [ ] BMI is displayed as a calculated value: `weight(kg) / (height(m))²`, rounded to 1 decimal place
- [ ] BMI uses most recent `BodyWeightEntry` if available, otherwise falls back to `UserProfile.baseWeightKg`
- [ ] BMI label shows category: Underweight / Normal / Overweight / Obese
- [ ] Form shows current saved values on load
- [ ] Success toast shown on save (shadcn/ui `useToast`)
- [ ] Page is accessible from the main navigation

## Blocked by

- Issue #2 — Authentication
