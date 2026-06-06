# Issue 1: Project scaffold & database schema

## What to build

Bootstrap the entire project foundation end-to-end: Next.js 14 App Router project, PostgreSQL database, Prisma ORM with the full schema, Better Auth wired to Postgres for session storage, and shadcn/ui initialized with the Witness design system tokens (dark theme, Electric Lime primary `#C8FF00`).

At the end of this slice the dev server runs, all Prisma migrations apply cleanly, and a health-check page confirms DB connectivity.

## Acceptance criteria

- [ ] `npx create-next-app` scaffold exists with App Router, TypeScript, Tailwind
- [ ] shadcn/ui initialized; CSS variables set to dark theme with Electric Lime as primary
- [ ] Prisma schema defines: `User`, `UserProfile`, `Session`, `DailyLog`, `FoodEntry`, `WorkoutSession`, `Exercise`, `ExerciseSet`, `BodyWeightEntry`
- [ ] `prisma migrate dev` runs without errors against a local PostgreSQL instance
- [ ] Better Auth configured with credential (email/password) provider, using Prisma adapter + Postgres session store
- [ ] `.env.example` documents all required env vars (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `NEXTAUTH_URL`)
- [ ] `npm run dev` starts without errors
- [ ] Root route renders a minimal shell page (no 500 errors)

## Blocked by

None — can start immediately.
