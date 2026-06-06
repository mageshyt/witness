# PRD: Fitness Tracker Application

## Problem Statement

Tracking daily fitness progress — nutrition intake, workout performance, body weight, and overall health metrics — is fragmented across multiple apps or done inconsistently on paper. There is no single personal tool that combines food logging with calorie/protein data, structured workout journaling, progress metrics, and body composition tracking in one place, tailored to a single user's workflow.

## Solution

A personal, full-stack web application built with Next.js and PostgreSQL that serves as a daily fitness witness — logging everything that happens each day: what was eaten (with calories and protein), what workouts were performed (exercises, sets, reps), body weight check-ins, and optional daily photos. An aggregated metrics view shows progress over time.

## User Stories

### Authentication
1. As a user, I want to register with a login ID and password, so that I can access my private fitness data.
2. As a user, I want to log in with my login ID and password, so that my data is protected from others.
3. As a user, I want to stay logged in across browser sessions, so that I don't have to re-authenticate every visit.
4. As a user, I want to log out securely, so that my data is protected on shared devices.

### Food Logging
5. As a user, I want to log the foods I ate for a given day, so that I have a record of my daily nutrition.
6. As a user, I want to search for a food by name and have calories and protein auto-populated via an external API, so that I don't have to manually look up nutritional data.
7. As a user, I want to specify the quantity/portion of a food item when logging it, so that the calorie and protein calculations are accurate.
8. As a user, I want to see the total calories consumed for the day, so that I can track whether I'm hitting my targets.
9. As a user, I want to see the total protein consumed for the day, so that I can track my protein intake goals.
10. As a user, I want to edit or delete a food entry for a day, so that I can correct mistakes.
11. As a user, I want to attach an optional photo to a food entry, so that I have a visual record of my meals.
12. As a user, I want to log food for any past day, so that I can backfill missed entries.

### Workout Logging
13. As a user, I want to log a workout session for a given day with a label (e.g., "Chest & Shoulders"), so that I know what muscle groups I trained.
14. As a user, I want to add exercises to a workout session, so that I can record what I did.
15. As a user, I want to log sets for each exercise, including reps performed per set, so that I have full volume data.
16. As a user, I want to optionally log the weight used per set, so that I can track load progression over time.
17. As a user, I want to edit or delete exercises and sets within a session, so that I can fix errors.
18. As a user, I want to log multiple workout sessions on the same day (e.g., morning cardio + evening lifting), so that my full training day is captured.
19. As a user, I want to log a workout for any past day, so that I can backfill sessions.

### Body Weight & Daily Photo
20. As a user, I want to optionally log my body weight on any given day, so that I can track weight trends over time.
21. As a user, I want to log weight as frequently or infrequently as I choose (daily or weekly), so that the app fits my weighing habit.
22. As a user, I want to upload an optional daily progress photo, so that I have a visual record of my physique over time.
23. As a user, I want to view my historical body weight entries in a list or chart, so that I can see trends.

### User Profile & Settings
24. As a user, I want to enter my biological sex, height, and starting weight in my profile, so that the app can calculate my BMI.
25. As a user, I want to see my current BMI displayed in my profile, so that I understand my body composition status.
26. As a user, I want to update my profile information at any time, so that it stays accurate as I change.
27. As a user, I want to set a daily calorie target, so that the app can show me progress toward my goal.
28. As a user, I want to set a daily protein target, so that the app can show me progress toward my goal.

### Metrics & Progress
29. As a user, I want to see a dashboard for any selected day showing total calories, total protein, and all workouts performed, so that I get a full snapshot of that day.
30. As a user, I want to see a weekly summary of calories and protein intake, so that I can assess consistency.
31. As a user, I want to see a chart of my body weight over time, so that I can visualize weight trends.
32. As a user, I want to see total weekly training volume (sets × reps) per muscle group or exercise, so that I can track workout progression.
33. As a user, I want to see my heaviest set per exercise over time, so that I can track strength progression.
34. As a user, I want to see a streak or consistency indicator showing how many days in a row I have logged both food and a workout, so that I stay motivated.

---

## Implementation Decisions

### Stack
- **Framework:** Next.js (App Router) — used for both frontend and backend (Server Actions / Route Handlers)
- **Database:** PostgreSQL — primary data store
- **ORM:** Prisma
- **Authentication:** Better Auth — email/password only, no OAuth providers
- **File Storage:** Local filesystem or object storage (e.g., Cloudflare R2 / S3-compatible) for food and daily photos
- **Nutrition API:** Open Food Facts API (free, no key required) or Nutritionix API — used to look up calories and protein by food name

### Core Domain Modules
- **Auth module** — registration, login, session management via Better Auth
- **DailyLog module** — the central record for a given user + date; anchors food entries, workout sessions, body weight, and daily photo
- **FoodEntry module** — individual food items logged within a DailyLog; stores name, quantity, calories, protein; links to optional photo
- **WorkoutSession module** — a named training session within a DailyLog (e.g., "Chest & Shoulders")
- **Exercise module** — an exercise within a WorkoutSession (e.g., "Bench Press")
- **Set module** — individual sets within an Exercise; stores reps and optional weight
- **BodyWeightEntry module** — body weight logged on a specific date (separate from DailyLog to support weekly logging)
- **UserProfile module** — sex, height, base weight, calorie target, protein target; used for BMI calculation
- **Metrics module** — aggregation layer that queries across DailyLogs to compute progress views

### Database Schema (key entities)

```
User             { id, loginId, hashedPassword, createdAt }
UserProfile      { userId, sex, heightCm, calorieTarget, proteinTarget }
DailyLog         { id, userId, date, bodyWeightKg?, photoUrl? }
FoodEntry        { id, dailyLogId, name, quantityG, calories, proteinG, photoUrl? }
WorkoutSession   { id, dailyLogId, label }
Exercise         { id, workoutSessionId, name, order }
ExerciseSet      { id, exerciseId, setNumber, reps, weightKg? }
BodyWeightEntry  { id, userId, date, weightKg }
```

### Nutrition API Integration
- On food name search, call external nutrition API and return top matches with per-100g or per-serving macros
- User selects a result and enters quantity; calories and protein are calculated client-side before saving
- If API is unavailable, user can enter values manually

### BMI Calculation
- BMI = weight(kg) / height(m)²
- Use the most recent BodyWeightEntry for the logged-in user; fall back to UserProfile base weight if no entries exist

### Photo Uploads
- Photos are optional on FoodEntry and DailyLog
- Uploaded via multipart form; stored to configured storage backend; URL stored in DB
- Photos are scoped to the authenticated user

---

## Testing Decisions

### What makes a good test
Tests should verify observable behavior from the outside — what a user or API caller sees — not internal implementation details like which query was run or which function was called internally. Tests should be stable against refactors.

### Modules to test
- **Auth flows** — registration succeeds, login succeeds, invalid password rejected, session persists
- **DailyLog creation and retrieval** — a log for a given date is created on first access, subsequent access returns the same log
- **FoodEntry CRUD** — adding, editing, and deleting food entries; daily calorie/protein totals calculated correctly
- **WorkoutSession + Exercise + Set CRUD** — full hierarchy created and retrieved correctly; sets update volume totals
- **BodyWeightEntry** — entries stored per date; BMI computed correctly from latest entry and profile height
- **Nutrition API integration** — mock the external API; assert correct macro calculation given a search result + quantity
- **Metrics aggregation** — weekly calorie totals, per-exercise max weight, streak calculation

### Testing approach
- Integration tests using a test PostgreSQL database (via Docker or pg test containers) at the Server Action / Route Handler boundary
- No unit tests on internal helpers unless they encode non-trivial logic (e.g., BMI formula, macro calculation)
- No tests on React component rendering internals

---

## Out of Scope

- Social features (sharing, following other users, leaderboards)
- AI-generated meal plans or workout recommendations
- Barcode scanning for food lookup
- Apple Health / Google Fit / wearable device sync
- Multiple user roles or admin dashboard
- Email verification or password reset (initial version)
- Native mobile app
- Offline mode / PWA

---

## Further Notes

- The app is personal — designed for a single user or a small household; multi-tenancy is supported at the data layer (all records scoped by userId) but no team or sharing features are planned
- "Daily witness" framing: the app's primary job is to be an honest record of what actually happened each day, not to prescribe behaviour
- The photo upload feature for both food and daily progress is fully optional and should not block logging if skipped
- Weekly weight check-in rhythm (e.g., every Monday) should be surfaced as a gentle prompt, not enforced
- Better Auth should be configured to use PostgreSQL as its session/user store to avoid a separate Redis dependency
