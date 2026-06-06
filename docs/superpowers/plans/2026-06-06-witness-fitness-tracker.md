# Witness Fitness Tracker — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack personal fitness tracking web app (Next.js + PostgreSQL + Prisma + Better Auth + shadcn/ui) that lets a user log daily food intake, workouts, and body weight, then view aggregated progress metrics.

**Architecture:** Next.js 14 App Router with Server Actions for all mutations and Route Handlers for external API calls. PostgreSQL via Prisma ORM. Better Auth handles credential-based sessions stored in Postgres. All pages are server components where possible; client components only for interactive forms and charts.

**Tech Stack:** Next.js 14 (App Router), TypeScript, PostgreSQL, Prisma, Better Auth, shadcn/ui, Tailwind CSS, Recharts, Open Food Facts API (public, no key).

---

## File Structure

```
fitness/
├── prisma/
│   └── schema.prisma                  # Full DB schema
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout with nav, Toaster
│   │   ├── page.tsx                   # Redirect → /today
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── today/
│   │   │   └── page.tsx               # DailyLog shell + all sections
│   │   ├── metrics/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   └── api/
│   │       ├── auth/[...all]/route.ts # Better Auth catch-all
│   │       └── food-search/route.ts   # Open Food Facts proxy
│   ├── components/
│   │   ├── nav.tsx                    # Top navigation bar
│   │   ├── stat-card.tsx              # Reusable colored stat card
│   │   ├── food/
│   │   │   ├── food-section.tsx       # Food entries list + totals
│   │   │   ├── food-form.tsx          # Add/edit food dialog (client)
│   │   │   └── food-search.tsx        # Search-to-fill combobox (client)
│   │   ├── workout/
│   │   │   ├── workout-section.tsx    # Sessions list
│   │   │   ├── session-card.tsx       # Single session with exercises
│   │   │   ├── exercise-row.tsx       # Exercise + set logger
│   │   │   └── workout-form.tsx       # Add session dialog (client)
│   │   ├── weight/
│   │   │   └── weight-dialog.tsx      # Log weight dialog (client)
│   │   └── metrics/
│   │       ├── nutrition-chart.tsx    # Weekly calories/protein bar chart
│   │       ├── weight-chart.tsx       # Body weight trend line chart
│   │       ├── volume-chart.tsx       # Weekly volume bar chart
│   │       ├── max-weight-list.tsx    # Per-exercise PR list
│   │       └── streak-widget.tsx      # Streak counter
│   ├── lib/
│   │   ├── prisma.ts                  # Prisma client singleton
│   │   ├── auth.ts                    # Better Auth server instance
│   │   ├── auth-client.ts             # Better Auth client instance
│   │   ├── session.ts                 # getSession() helper
│   │   └── bmi.ts                     # BMI calculation utility
│   └── actions/
│       ├── food.ts                    # Server Actions: CRUD food entries
│       ├── workout.ts                 # Server Actions: CRUD sessions/exercises/sets
│       ├── weight.ts                  # Server Actions: upsert BodyWeightEntry
│       ├── profile.ts                 # Server Actions: upsert UserProfile
│       └── daily-log.ts              # Server Action: getOrCreate DailyLog
```

---

## Task 1: Bootstrap Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`

- [ ] **Step 1: Scaffold the project**

```bash
cd /c/Users/I769591/Desktop/Projects/fullstack/fitness
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbo
```

Accept all defaults. When asked "Would you like to use Turbopack?", choose No.

- [ ] **Step 2: Install core dependencies**

```bash
npm install prisma @prisma/client better-auth recharts
npm install -D @types/node
```

- [ ] **Step 3: Initialize shadcn/ui**

```bash
npx shadcn@latest init
```

When prompted:
- Style: **Default**
- Base color: **Slate**
- CSS variables: **Yes**

- [ ] **Step 4: Apply Witness design tokens to `src/app/globals.css`**

Replace the `:root` and `.dark` blocks with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 240 10% 4%;
    --foreground: 240 20% 95%;
    --card: 240 10% 6%;
    --card-foreground: 240 20% 95%;
    --popover: 240 10% 8%;
    --popover-foreground: 240 20% 95%;
    --primary: 74 100% 50%;
    --primary-foreground: 240 10% 4%;
    --secondary: 240 10% 10%;
    --secondary-foreground: 240 20% 95%;
    --muted: 240 10% 14%;
    --muted-foreground: 240 10% 55%;
    --accent: 240 10% 14%;
    --accent-foreground: 240 20% 95%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 10% 16%;
    --input: 240 10% 16%;
    --ring: 74 100% 50%;
    --radius: 0.75rem;
  }
}

@layer base {
  * { @apply border-border; }
  body {
    @apply bg-background text-foreground;
    font-family: 'Inter', sans-serif;
  }
}
```

- [ ] **Step 5: Add Google Fonts to `src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Witness",
  description: "Daily fitness tracker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 6: Root page redirects to /today**

```tsx
// src/app/page.tsx
import { redirect } from "next/navigation";
export default function Home() {
  redirect("/today");
}
```

- [ ] **Step 7: Verify dev server starts**

```bash
npm run dev
```

Expected: server starts on http://localhost:3000, no compilation errors.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: bootstrap Next.js with shadcn/ui and Witness design tokens"
```

---

## Task 2: Prisma schema + database setup

**Files:**
- Create: `prisma/schema.prisma`, `src/lib/prisma.ts`, `.env.local`, `.env.example`

- [ ] **Step 1: Initialize Prisma**

```bash
npx prisma init --datasource-provider postgresql
```

- [ ] **Step 2: Create `.env.local` with local DB connection**

```bash
# .env.local  (never commit this file)
DATABASE_URL="postgresql://postgres:password@localhost:5432/witness_dev"
BETTER_AUTH_SECRET="change-me-to-a-random-32-char-string"
BETTER_AUTH_URL="http://localhost:3000"
```

- [ ] **Step 3: Create `.env.example`**

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/witness_dev"
BETTER_AUTH_SECRET="your-secret-here"
BETTER_AUTH_URL="http://localhost:3000"
```

- [ ] **Step 4: Write `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id             String           @id @default(cuid())
  email          String           @unique
  name           String?
  emailVerified  Boolean          @default(false)
  image          String?
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
  sessions       Session[]
  accounts       Account[]
  profile        UserProfile?
  dailyLogs      DailyLog[]
  bodyWeightEntries BodyWeightEntry[]
}

model Session {
  id        String   @id @default(cuid())
  expiresAt DateTime
  token     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Account {
  id                    String    @id @default(cuid())
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}

model Verification {
  id         String    @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime? @default(now())
  updatedAt  DateTime? @updatedAt
}

model UserProfile {
  id             String   @id @default(cuid())
  userId         String   @unique
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  sex            String?
  heightCm       Float?
  baseWeightKg   Float?
  calorieTarget  Int?
  proteinTarget  Int?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model DailyLog {
  id              String           @id @default(cuid())
  userId          String
  user            User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  date            DateTime         @db.Date
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  foodEntries     FoodEntry[]
  workoutSessions WorkoutSession[]

  @@unique([userId, date])
}

model FoodEntry {
  id         String   @id @default(cuid())
  dailyLogId String
  dailyLog   DailyLog @relation(fields: [dailyLogId], references: [id], onDelete: Cascade)
  name       String
  quantityG  Float
  calories   Float
  proteinG   Float
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model WorkoutSession {
  id         String     @id @default(cuid())
  dailyLogId String
  dailyLog   DailyLog   @relation(fields: [dailyLogId], references: [id], onDelete: Cascade)
  label      String
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  exercises  Exercise[]
}

model Exercise {
  id               String         @id @default(cuid())
  workoutSessionId String
  workoutSession   WorkoutSession @relation(fields: [workoutSessionId], references: [id], onDelete: Cascade)
  name             String
  order            Int            @default(0)
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
  sets             ExerciseSet[]
}

model ExerciseSet {
  id         String   @id @default(cuid())
  exerciseId String
  exercise   Exercise @relation(fields: [exerciseId], references: [id], onDelete: Cascade)
  setNumber  Int
  reps       Int
  weightKg   Float?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model BodyWeightEntry {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date      DateTime @db.Date
  weightKg  Float
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, date])
}
```

- [ ] **Step 5: Run migration**

```bash
npx prisma migrate dev --name init
```

Expected: Migration created and applied, Prisma Client generated.

- [ ] **Step 6: Create Prisma client singleton `src/lib/prisma.ts`**

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: ["query"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 7: Commit**

```bash
git add prisma/ src/lib/prisma.ts .env.example
git commit -m "feat: add Prisma schema and database setup"
```

---

## Task 3: Better Auth setup

**Files:**
- Create: `src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/app/api/auth/[...all]/route.ts`, `src/lib/session.ts`

- [ ] **Step 1: Create `src/lib/auth.ts`**

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
});
```

- [ ] **Step 2: Create `src/lib/auth-client.ts`**

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000",
});
```

- [ ] **Step 3: Create `src/app/api/auth/[...all]/route.ts`**

```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

- [ ] **Step 4: Create `src/lib/session.ts`**

```typescript
import { auth } from "./auth";
import { headers } from "next/headers";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}
```

- [ ] **Step 5: Add `NEXT_PUBLIC_BETTER_AUTH_URL` to `.env.local`**

```bash
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
```

- [ ] **Step 6: Verify auth route responds**

Start the dev server and visit: `http://localhost:3000/api/auth/get-session`
Expected: JSON response `{ session: null }` (not a 404 or 500).

- [ ] **Step 7: Commit**

```bash
git add src/lib/auth.ts src/lib/auth-client.ts src/app/api/ src/lib/session.ts
git commit -m "feat: configure Better Auth with Prisma adapter"
```

---

## Task 4: Install shadcn/ui components

**Files:**
- Modify: `components/ui/*` (auto-generated by shadcn CLI)

- [ ] **Step 1: Install all required shadcn components**

```bash
npx shadcn@latest add button card input label form select dialog sheet toast sonner badge separator skeleton
```

- [ ] **Step 2: Add Toaster to root layout**

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Witness",
  description: "Daily fitness tracker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify components render**

```bash
npm run build
```

Expected: build succeeds with no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: install shadcn/ui component library"
```

---

## Task 5: Authentication pages — register & login

**Files:**
- Create: `src/app/(auth)/register/page.tsx`, `src/app/(auth)/login/page.tsx`, `src/middleware.ts`

- [ ] **Step 1: Install Recharts (needed later, install now)**

```bash
npm install recharts
```

- [ ] **Step 2: Create login page `src/app/(auth)/login/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await authClient.signIn.email({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Invalid credentials");
    } else {
      router.push("/today");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm border-border bg-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <svg width="24" height="24" viewBox="0 0 26 26" fill="none">
              <path d="M4 13h4l3-8 4 16 3-8h4" stroke="#0A0A0F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">WITNESS</CardTitle>
          <p className="text-sm text-muted-foreground">Every rep. Every meal. Witnessed.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            No account?{" "}
            <a href="/register" className="text-primary hover:underline">Register</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Create register page `src/app/(auth)/register/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await authClient.signUp.email({ name, email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Registration failed");
    } else {
      router.push("/today");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm border-border bg-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <svg width="24" height="24" viewBox="0 0 26 26" fill="none">
              <path d="M4 13h4l3-8 4 16 3-8h4" stroke="#0A0A0F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Create account</CardTitle>
          <p className="text-sm text-muted-foreground">Start witnessing your progress</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required placeholder="Your name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" minLength={8} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a href="/login" className="text-primary hover:underline">Sign in</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/middleware.ts` to protect all routes**

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function middleware(request: NextRequest) {
  const session = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  const publicPaths = ["/login", "/register", "/api/auth"];
  const isPublic = publicPaths.some(p => pathname.startsWith(p));

  if (!session && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (session && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/today", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

- [ ] **Step 5: Verify flows manually**

```bash
npm run dev
```

1. Visit `http://localhost:3000` → should redirect to `/login`
2. Register a new account → should redirect to `/today` (404 is fine for now)
3. Sign out via `authClient.signOut()` in browser console → redirects to `/login`
4. Login with registered credentials → redirects to `/today`

- [ ] **Step 6: Commit**

```bash
git add src/app/\(auth\)/ src/middleware.ts
git commit -m "feat: add register/login pages and route protection middleware"
```

---

## Task 6: Navigation + DailyLog shell

**Files:**
- Create: `src/components/nav.tsx`, `src/components/stat-card.tsx`, `src/app/today/page.tsx`, `src/actions/daily-log.ts`

- [ ] **Step 1: Create `src/actions/daily-log.ts`**

```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { startOfDay } from "date-fns";

export async function getOrCreateDailyLog(dateStr: string) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const date = startOfDay(new Date(dateStr));

  return prisma.dailyLog.upsert({
    where: { userId_date: { userId: session.user.id, date } },
    create: { userId: session.user.id, date },
    update: {},
    include: {
      foodEntries: true,
      workoutSessions: { include: { exercises: { include: { sets: true } } } },
    },
  });
}
```

- [ ] **Step 2: Install date-fns**

```bash
npm install date-fns
```

- [ ] **Step 3: Create `src/components/stat-card.tsx`**

```tsx
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  accent: "calories" | "protein" | "workout" | "weight";
  progress?: number; // 0-100
}

const accentMap = {
  calories: { bar: "bg-[#FF5C38]", top: "border-t-[#FF5C38]", text: "text-[#FF5C38]" },
  protein:  { bar: "bg-[#00D4FF]", top: "border-t-[#00D4FF]", text: "text-[#00D4FF]" },
  workout:  { bar: "bg-[#A259FF]", top: "border-t-[#A259FF]", text: "text-[#A259FF]" },
  weight:   { bar: "bg-[#FFB020]", top: "border-t-[#FFB020]", text: "text-[#FFB020]" },
};

export function StatCard({ icon, label, value, sub, accent, progress }: StatCardProps) {
  const colors = accentMap[accent];
  return (
    <Card className={cn("border-border bg-card border-t-2", colors.top)}>
      <CardContent className="p-4">
        <div className="mb-3 text-xl">{icon}</div>
        <div className={cn("text-3xl font-extrabold tracking-tight", colors.text)}>{value}</div>
        <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
        {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
        {progress !== undefined && (
          <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div className={cn("h-full rounded-full", colors.bar)} style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Create `src/components/nav.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/today",   label: "Today",   icon: "⚡" },
  { href: "/metrics", label: "Metrics", icon: "📈" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg width="16" height="16" viewBox="0 0 26 26" fill="none">
              <path d="M4 13h4l3-8 4 16 3-8h4" stroke="#0A0A0F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-sm font-bold tracking-widest">WITNESS</span>
        </div>
        <div className="flex gap-1">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                pathname.startsWith(l.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}>
              <span>{l.icon}</span>{l.label}
            </Link>
          ))}
        </div>
        <button onClick={handleLogout} className="text-xs text-muted-foreground hover:text-foreground">
          Sign out
        </button>
      </div>
    </nav>
  );
}
```

- [ ] **Step 5: Add Nav to root layout**

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Nav } from "@/components/nav";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = { title: "Witness", description: "Daily fitness tracker" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Nav />
        <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Create `src/app/today/page.tsx`**

```tsx
import { getOrCreateDailyLog } from "@/actions/daily-log";
import { StatCard } from "@/components/stat-card";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { format, addDays, subDays } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Props {
  searchParams: Promise<{ date?: string }>;
}

export default async function TodayPage({ searchParams }: Props) {
  const { date: dateParam } = await searchParams;
  const dateStr = dateParam ?? format(new Date(), "yyyy-MM-dd");
  const log = await getOrCreateDailyLog(dateStr);

  const session = await getSession();
  const profile = await prisma.userProfile.findUnique({
    where: { userId: session!.user.id },
  });

  const totalCalories = log.foodEntries.reduce((s, e) => s + e.calories, 0);
  const totalProtein  = log.foodEntries.reduce((s, e) => s + e.proteinG, 0);
  const sessionCount  = log.workoutSessions.length;
  const totalSets     = log.workoutSessions.flatMap(s => s.exercises.flatMap(e => e.sets)).length;

  const latestWeight = await prisma.bodyWeightEntry.findFirst({
    where: { userId: session!.user.id },
    orderBy: { date: "desc" },
  });

  const prevDate = format(subDays(new Date(dateStr), 1), "yyyy-MM-dd");
  const nextDate = format(addDays(new Date(dateStr), 1), "yyyy-MM-dd");
  const isToday  = dateStr === format(new Date(), "yyyy-MM-dd");

  return (
    <div className="space-y-6">
      {/* Date nav */}
      <div className="flex items-center justify-between">
        <Link href={`/today?date=${prevDate}`}>
          <Button variant="ghost" size="sm">← Prev</Button>
        </Link>
        <h1 className="text-lg font-bold">
          {isToday ? "Today" : format(new Date(dateStr + "T12:00:00"), "EEE, MMM d")}
        </h1>
        <Link href={`/today?date=${nextDate}`}>
          <Button variant="ghost" size="sm" disabled={isToday}>Next →</Button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon="🔥" label="Calories" accent="calories"
          value={totalCalories > 0 ? `${Math.round(totalCalories)}` : "—"}
          sub={profile?.calorieTarget ? `Target: ${profile.calorieTarget} kcal` : undefined}
          progress={profile?.calorieTarget ? (totalCalories / profile.calorieTarget) * 100 : undefined}
        />
        <StatCard
          icon="💪" label="Protein" accent="protein"
          value={totalProtein > 0 ? `${Math.round(totalProtein)}g` : "—"}
          sub={profile?.proteinTarget ? `Target: ${profile.proteinTarget}g` : undefined}
          progress={profile?.proteinTarget ? (totalProtein / profile.proteinTarget) * 100 : undefined}
        />
        <StatCard
          icon="🏋️" label="Workouts" accent="workout"
          value={sessionCount > 0 ? `${sessionCount}` : "—"}
          sub={totalSets > 0 ? `${totalSets} sets` : undefined}
        />
        <StatCard
          icon="⚖️" label="Weight" accent="weight"
          value={latestWeight ? `${latestWeight.weightKg}kg` : "—"}
        />
      </div>

      {/* Sections — placeholders for food/workout/weight tasks */}
      <p className="text-sm text-muted-foreground text-center py-8">
        Food and workout sections coming next.
      </p>
    </div>
  );
}
```

- [ ] **Step 7: Verify the today page loads**

Visit `http://localhost:3000/today` — should show 4 stat cards with "—" values and date navigation.

- [ ] **Step 8: Commit**

```bash
git add src/components/nav.tsx src/components/stat-card.tsx src/app/today/ src/actions/daily-log.ts
git commit -m "feat: add DailyLog shell with stat cards and date navigation"
```

---

## Task 7: Food logging — manual CRUD

**Files:**
- Create: `src/actions/food.ts`, `src/components/food/food-section.tsx`, `src/components/food/food-form.tsx`
- Modify: `src/app/today/page.tsx`

- [ ] **Step 1: Create `src/actions/food.ts`**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getOrCreateDailyLog } from "./daily-log";

export async function addFoodEntry(dateStr: string, data: {
  name: string; quantityG: number; calories: number; proteinG: number;
}) {
  const log = await getOrCreateDailyLog(dateStr);
  await prisma.foodEntry.create({ data: { dailyLogId: log.id, ...data } });
  revalidatePath("/today");
}

export async function updateFoodEntry(id: string, data: {
  name: string; quantityG: number; calories: number; proteinG: number;
}) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");
  await prisma.foodEntry.update({ where: { id }, data });
  revalidatePath("/today");
}

export async function deleteFoodEntry(id: string) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");
  await prisma.foodEntry.delete({ where: { id } });
  revalidatePath("/today");
}
```

- [ ] **Step 2: Create `src/components/food/food-form.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { addFoodEntry, updateFoodEntry } from "@/actions/food";

interface FoodFormProps {
  dateStr: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: { id: string; name: string; quantityG: number; calories: number; proteinG: number };
}

export function FoodForm({ dateStr, open, onOpenChange, initial }: FoodFormProps) {
  const [name, setName]         = useState(initial?.name ?? "");
  const [qty, setQty]           = useState(initial?.quantityG?.toString() ?? "");
  const [kcal, setKcal]         = useState(initial?.calories?.toString() ?? "");
  const [protein, setProtein]   = useState(initial?.proteinG?.toString() ?? "");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const data = { name, quantityG: +qty, calories: +kcal, proteinG: +protein };
    try {
      if (initial) { await updateFoodEntry(initial.id, data); }
      else         { await addFoodEntry(dateStr, data); }
      toast.success(initial ? "Entry updated" : "Food logged");
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit food" : "Log food"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label>Food name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Chicken breast" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label>Qty (g)</Label>
              <Input type="number" value={qty} onChange={e => setQty(e.target.value)} required min={0} />
            </div>
            <div className="space-y-1">
              <Label>Calories</Label>
              <Input type="number" value={kcal} onChange={e => setKcal(e.target.value)} required min={0} />
            </div>
            <div className="space-y-1">
              <Label>Protein (g)</Label>
              <Input type="number" value={protein} onChange={e => setProtein(e.target.value)} required min={0} />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving…" : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: Create `src/components/food/food-section.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FoodForm } from "./food-form";
import { deleteFoodEntry } from "@/actions/food";
import { toast } from "sonner";
import type { FoodEntry } from "@prisma/client";

interface Props {
  dateStr: string;
  entries: FoodEntry[];
}

export function FoodSection({ dateStr, entries }: Props) {
  const [formOpen, setFormOpen]   = useState(false);
  const [editing, setEditing]     = useState<FoodEntry | null>(null);

  async function handleDelete(id: string) {
    await deleteFoodEntry(id);
    toast.success("Entry deleted");
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Food</h2>
        <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}>+ Add Food</Button>
      </div>

      {entries.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">No food logged yet.</p>
      )}

      <div className="space-y-2">
        {entries.map(e => (
          <div key={e.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{e.name}</div>
              <div className="text-xs text-muted-foreground">{e.quantityG}g</div>
            </div>
            <Badge variant="outline" className="text-[#FF5C38] border-[#FF5C38]/30 bg-[#2A1208] text-xs">
              {Math.round(e.calories)} kcal
            </Badge>
            <Badge variant="outline" className="text-[#00D4FF] border-[#00D4FF]/30 bg-[#001E26] text-xs">
              {Math.round(e.proteinG)}g pro
            </Badge>
            <button className="text-muted-foreground hover:text-foreground text-xs" onClick={() => toast.info("Photo upload coming soon")}>📷</button>
            <button className="text-muted-foreground hover:text-foreground text-xs" onClick={() => { setEditing(e); setFormOpen(true); }}>Edit</button>
            <button className="text-muted-foreground hover:text-destructive text-xs" onClick={() => handleDelete(e.id)}>Del</button>
          </div>
        ))}
      </div>

      <FoodForm
        dateStr={dateStr}
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editing ?? undefined}
      />
    </section>
  );
}
```

- [ ] **Step 4: Wire FoodSection into today page**

Replace the placeholder paragraph in `src/app/today/page.tsx` with:

```tsx
// add these imports at top
import { FoodSection } from "@/components/food/food-section";

// replace placeholder with:
<FoodSection dateStr={dateStr} entries={log.foodEntries} />
```

- [ ] **Step 5: Verify food CRUD works**

1. Add a food entry → appears in list, stat cards update
2. Edit entry → values update
3. Delete entry → removed from list
4. Click 📷 icon → toast "Photo upload coming soon"

- [ ] **Step 6: Commit**

```bash
git add src/actions/food.ts src/components/food/ src/app/today/page.tsx
git commit -m "feat: add food logging with manual entry, edit, delete"
```

---

## Task 8: Food search via Open Food Facts

**Files:**
- Create: `src/app/api/food-search/route.ts`, `src/components/food/food-search.tsx`
- Modify: `src/components/food/food-form.tsx`

- [ ] **Step 1: Create `/api/food-search` Route Handler**

```typescript
// src/app/api/food-search/route.ts
import { NextRequest, NextResponse } from "next/server";

interface OFFProduct {
  product_name?: string;
  nutriments?: {
    "energy-kcal_100g"?: number;
    proteins_100g?: number;
  };
}

interface OFFResponse {
  products: OFFProduct[];
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q || q.length < 2) return NextResponse.json([]);

  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=5&fields=product_name,nutriments`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    const data: OFFResponse = await res.json();

    const results = (data.products ?? [])
      .filter((p) => p.product_name && p.nutriments?.["energy-kcal_100g"] != null)
      .map((p) => ({
        name: p.product_name!,
        kcalPer100g: p.nutriments!["energy-kcal_100g"]!,
        proteinPer100g: p.nutriments!.proteins_100g ?? 0,
      }));

    return NextResponse.json(results);
  } catch {
    return NextResponse.json([]);
  }
}
```

- [ ] **Step 2: Install needed shadcn command component**

```bash
npx shadcn@latest add command popover
```

- [ ] **Step 3: Create `src/components/food/food-search.tsx`**

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface FoodResult {
  name: string;
  kcalPer100g: number;
  proteinPer100g: number;
}

interface Props {
  onSelect: (result: FoodResult) => void;
}

export function FoodSearch({ onSelect }: Props) {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState<FoodResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen]       = useState(false);
  const timerRef              = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(timerRef.current);
    if (query.length < 3) { setResults([]); setOpen(false); return; }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/food-search?q=${encodeURIComponent(query)}`);
      const data: FoodResult[] = await res.json();
      setResults(data);
      setOpen(data.length > 0);
      setLoading(false);
    }, 400);
  }, [query]);

  return (
    <div className="relative">
      <Input
        placeholder="Search food (e.g. chicken breast)…"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      {loading && <Skeleton className="mt-1 h-8 w-full" />}
      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-md border border-border bg-card shadow-lg">
          {results.map((r, i) => (
            <li key={i}
              className="flex cursor-pointer items-center justify-between px-3 py-2 text-sm hover:bg-muted"
              onClick={() => { onSelect(r); setOpen(false); setQuery(""); }}>
              <span>{r.name}</span>
              <span className="text-xs text-muted-foreground">{Math.round(r.kcalPer100g)} kcal / 100g</span>
            </li>
          ))}
          <li className="cursor-pointer px-3 py-2 text-xs text-muted-foreground hover:bg-muted"
              onClick={() => setOpen(false)}>
            Enter manually instead →
          </li>
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Update `food-form.tsx` to include search**

Add the FoodSearch component at the top of the form. When user selects a result, auto-fill name, kcal and protein based on quantity:

```tsx
// Add import at top of food-form.tsx
import { FoodSearch } from "./food-search";

// Inside FoodForm component, add state:
const [selectedKcalPer100g, setSelectedKcalPer100g] = useState<number | null>(null);
const [selectedProteinPer100g, setSelectedProteinPer100g] = useState<number | null>(null);

// Handler for search select:
function handleSearchSelect(result: { name: string; kcalPer100g: number; proteinPer100g: number }) {
  setName(result.name);
  setSelectedKcalPer100g(result.kcalPer100g);
  setSelectedProteinPer100g(result.proteinPer100g);
  if (qty) {
    setKcal(String(Math.round((result.kcalPer100g / 100) * +qty)));
    setProtein(String(Math.round((result.proteinPer100g / 100) * +qty)));
  }
}

// Handler for qty change — recalculate if food selected:
function handleQtyChange(val: string) {
  setQty(val);
  if (selectedKcalPer100g !== null && val) {
    setKcal(String(Math.round((selectedKcalPer100g / 100) * +val)));
    setProtein(String(Math.round((selectedProteinPer100g! / 100) * +val)));
  }
}

// In JSX, before the name input, add:
// {!initial && <FoodSearch onSelect={handleSearchSelect} />}

// Update qty Input to use handleQtyChange:
// <Input type="number" value={qty} onChange={e => handleQtyChange(e.target.value)} ... />
```

- [ ] **Step 5: Verify search flow**

1. Click "+ Add Food", type "chicken" in search box → results appear after ~400ms
2. Select a result → name, kcal, protein auto-fill
3. Change quantity → kcal and protein recalculate
4. Submit → entry appears with correct macros

- [ ] **Step 6: Commit**

```bash
git add src/app/api/food-search/ src/components/food/food-search.tsx src/components/food/food-form.tsx
git commit -m "feat: add food search via Open Food Facts API with auto-fill macros"
```

---

## Task 9: Workout logging

**Files:**
- Create: `src/actions/workout.ts`, `src/components/workout/workout-section.tsx`, `src/components/workout/session-card.tsx`, `src/components/workout/exercise-row.tsx`, `src/components/workout/workout-form.tsx`
- Modify: `src/app/today/page.tsx`

- [ ] **Step 1: Create `src/actions/workout.ts`**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOrCreateDailyLog } from "./daily-log";
import { getSession } from "@/lib/session";

export async function createSession(dateStr: string, label: string) {
  const log = await getOrCreateDailyLog(dateStr);
  await prisma.workoutSession.create({ data: { dailyLogId: log.id, label } });
  revalidatePath("/today");
}

export async function deleteSession(id: string) {
  await getSession().then(s => { if (!s?.user) throw new Error("Unauthorized"); });
  await prisma.workoutSession.delete({ where: { id } });
  revalidatePath("/today");
}

export async function addExercise(sessionId: string, name: string, order: number) {
  await prisma.exercise.create({ data: { workoutSessionId: sessionId, name, order } });
  revalidatePath("/today");
}

export async function deleteExercise(id: string) {
  await prisma.exercise.delete({ where: { id } });
  revalidatePath("/today");
}

export async function addSet(exerciseId: string, setNumber: number, reps: number, weightKg?: number) {
  await prisma.exerciseSet.create({ data: { exerciseId, setNumber, reps, weightKg } });
  revalidatePath("/today");
}

export async function updateSet(id: string, reps: number, weightKg?: number) {
  await prisma.exerciseSet.update({ where: { id }, data: { reps, weightKg } });
  revalidatePath("/today");
}

export async function deleteSet(id: string) {
  await prisma.exerciseSet.delete({ where: { id } });
  revalidatePath("/today");
}
```

- [ ] **Step 2: Create `src/components/workout/workout-form.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createSession } from "@/actions/workout";
import { toast } from "sonner";

interface Props {
  dateStr: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function WorkoutForm({ dateStr, open, onOpenChange }: Props) {
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await createSession(dateStr, label);
      toast.success("Workout session created");
      setLabel("");
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>New workout session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label>Session label</Label>
            <Input value={label} onChange={e => setLabel(e.target.value)} required placeholder="e.g. Chest & Shoulders" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating…" : "Create session"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: Create `src/components/workout/exercise-row.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addSet, updateSet, deleteSet, deleteExercise } from "@/actions/workout";
import { toast } from "sonner";
import type { Exercise, ExerciseSet } from "@prisma/client";

interface Props {
  exercise: Exercise & { sets: ExerciseSet[] };
}

export function ExerciseRow({ exercise }: Props) {
  const [adding, setAdding] = useState(false);
  const [newReps, setNewReps]     = useState("");
  const [newWeight, setNewWeight] = useState("");

  async function handleAddSet() {
    if (!newReps) return;
    setAdding(true);
    await addSet(exercise.id, exercise.sets.length + 1, +newReps, newWeight ? +newWeight : undefined);
    setNewReps(""); setNewWeight("");
    setAdding(false);
  }

  return (
    <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{exercise.name}</span>
        <button className="text-xs text-muted-foreground hover:text-destructive"
          onClick={() => deleteExercise(exercise.id)}>
          Remove
        </button>
      </div>

      {exercise.sets.length > 0 && (
        <div className="space-y-1">
          <div className="grid grid-cols-4 gap-1 text-xs text-muted-foreground px-1">
            <span>Set</span><span>Weight (kg)</span><span>Reps</span><span></span>
          </div>
          {exercise.sets.map(s => (
            <SetRow key={s.id} set={s} />
          ))}
        </div>
      )}

      <div className="flex gap-2 items-end">
        <Input className="h-7 text-xs w-24" placeholder="Weight kg" value={newWeight} onChange={e => setNewWeight(e.target.value)} type="number" min={0} />
        <Input className="h-7 text-xs w-20" placeholder="Reps" value={newReps}   onChange={e => setNewReps(e.target.value)}   type="number" min={1} required />
        <Button size="sm" className="h-7 text-xs" onClick={handleAddSet} disabled={adding || !newReps}>
          + Set
        </Button>
      </div>
    </div>
  );
}

function SetRow({ set }: { set: ExerciseSet }) {
  const [reps, setReps]     = useState(set.reps.toString());
  const [weight, setWeight] = useState(set.weightKg?.toString() ?? "");

  async function handleBlur() {
    await updateSet(set.id, +reps, weight ? +weight : undefined);
  }

  return (
    <div className="grid grid-cols-4 gap-1 items-center">
      <span className="text-xs text-muted-foreground pl-1">{set.setNumber}</span>
      <Input className="h-6 text-xs" value={weight} onChange={e => setWeight(e.target.value)} onBlur={handleBlur} type="number" min={0} />
      <Input className="h-6 text-xs" value={reps}   onChange={e => setReps(e.target.value)}   onBlur={handleBlur} type="number" min={1} />
      <button className="text-xs text-muted-foreground hover:text-destructive" onClick={() => deleteSet(set.id)}>✕</button>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/workout/session-card.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExerciseRow } from "./exercise-row";
import { addExercise, deleteSession } from "@/actions/workout";
import type { WorkoutSession, Exercise, ExerciseSet } from "@prisma/client";

type FullSession = WorkoutSession & {
  exercises: (Exercise & { sets: ExerciseSet[] })[];
};

export function SessionCard({ session }: { session: FullSession }) {
  const [exName, setExName] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAddExercise() {
    if (!exName.trim()) return;
    setAdding(true);
    await addExercise(session.id, exName.trim(), session.exercises.length);
    setExName("");
    setAdding(false);
  }

  return (
    <Card className="border-[#A259FF]/30 bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-[#A259FF]">{session.label}</CardTitle>
          <button className="text-xs text-muted-foreground hover:text-destructive"
            onClick={() => deleteSession(session.id)}>
            Delete session
          </button>
        </div>
        <p className="text-xs text-muted-foreground">{session.exercises.length} exercise(s)</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {session.exercises.map(ex => <ExerciseRow key={ex.id} exercise={ex} />)}

        <div className="flex gap-2">
          <Input className="h-8 text-sm" placeholder="Exercise name (e.g. Bench Press)"
            value={exName} onChange={e => setExName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAddExercise()} />
          <Button size="sm" className="h-8" onClick={handleAddExercise} disabled={adding || !exName.trim()}>
            + Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 5: Create `src/components/workout/workout-section.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SessionCard } from "./session-card";
import { WorkoutForm } from "./workout-form";
import type { WorkoutSession, Exercise, ExerciseSet } from "@prisma/client";

type FullSession = WorkoutSession & {
  exercises: (Exercise & { sets: ExerciseSet[] })[];
};

export function WorkoutSection({ dateStr, sessions }: { dateStr: string; sessions: FullSession[] }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Workouts</h2>
        <Button size="sm" onClick={() => setOpen(true)}>+ Add Workout</Button>
      </div>

      {sessions.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">No workouts logged yet.</p>
      )}

      <div className="space-y-3">
        {sessions.map(s => <SessionCard key={s.id} session={s} />)}
      </div>

      <WorkoutForm dateStr={dateStr} open={open} onOpenChange={setOpen} />
    </section>
  );
}
```

- [ ] **Step 6: Add WorkoutSection to today page**

```tsx
// add import
import { WorkoutSection } from "@/components/workout/workout-section";

// replace placeholder paragraph with:
<FoodSection dateStr={dateStr} entries={log.foodEntries} />
<WorkoutSection dateStr={dateStr} sessions={log.workoutSessions} />
```

- [ ] **Step 7: Verify workout logging**

1. Create a session "Push Day" → card appears with violet accent
2. Add exercise "Bench Press" → row appears
3. Log 3 sets with weight and reps → rows appear, edit on blur works
4. Delete a set → disappears
5. Delete session → card removed

- [ ] **Step 8: Commit**

```bash
git add src/actions/workout.ts src/components/workout/ src/app/today/page.tsx
git commit -m "feat: add workout session, exercise, and set logging"
```

---

## Task 10: Body weight logging

**Files:**
- Create: `src/actions/weight.ts`, `src/components/weight/weight-dialog.tsx`
- Modify: `src/app/today/page.tsx`, `src/app/profile/page.tsx`

- [ ] **Step 1: Create `src/actions/weight.ts`**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { startOfDay } from "date-fns";

export async function upsertBodyWeight(dateStr: string, weightKg: number) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");
  const date = startOfDay(new Date(dateStr));
  await prisma.bodyWeightEntry.upsert({
    where: { userId_date: { userId: session.user.id, date } },
    create: { userId: session.user.id, date, weightKg },
    update: { weightKg },
  });
  revalidatePath("/today");
  revalidatePath("/profile");
}
```

- [ ] **Step 2: Create `src/components/weight/weight-dialog.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { upsertBodyWeight } from "@/actions/weight";
import { toast } from "sonner";

interface Props {
  dateStr: string;
  current?: number;
}

export function WeightDialog({ dateStr, current }: Props) {
  const [open, setOpen]       = useState(false);
  const [weight, setWeight]   = useState(current?.toString() ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await upsertBodyWeight(dateStr, +weight);
      toast.success("Weight logged");
      setOpen(false);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="text-[#FFB020] border-[#FFB020]/30">
          {current ? `${current} kg` : "+ Log Weight"}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader><DialogTitle>Log body weight</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label>Weight (kg)</Label>
            <Input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} required min={20} max={300} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving…" : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: Add weight logging + photo toast to today page**

Below the stat cards in `src/app/today/page.tsx`, add:

```tsx
import { WeightDialog } from "@/components/weight/weight-dialog";
// ... inside JSX after stat cards grid:
<div className="flex items-center gap-3">
  <WeightDialog dateStr={dateStr} current={latestWeight?.weightKg} />
  <Button variant="outline" size="sm" className="text-muted-foreground"
    onClick={() => {/* handled client-side */}}>
    📷 Progress photo
  </Button>
</div>
```

Because `page.tsx` is a server component, the photo toast button needs a tiny client wrapper. Create `src/components/photo-toast-button.tsx`:

```tsx
"use client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function PhotoToastButton() {
  return (
    <Button variant="outline" size="sm" className="text-muted-foreground"
      onClick={() => toast.info("Photo upload coming soon")}>
      📷 Progress photo
    </Button>
  );
}
```

Then use `<PhotoToastButton />` in `today/page.tsx`.

- [ ] **Step 4: Create `src/lib/bmi.ts`**

```typescript
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25)   return "Normal";
  if (bmi < 30)   return "Overweight";
  return "Obese";
}
```

- [ ] **Step 5: Create profile page `src/app/profile/page.tsx`**

```tsx
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { calculateBMI, bmiCategory } from "@/lib/bmi";
import { ProfileForm } from "@/components/profile-form";
import { format } from "date-fns";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session?.user) return null;

  const profile = await prisma.userProfile.findUnique({ where: { userId: session.user.id } });
  const weightEntries = await prisma.bodyWeightEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
  });

  const latestWeight = weightEntries[0]?.weightKg ?? profile?.baseWeightKg;
  const bmi = latestWeight && profile?.heightCm
    ? calculateBMI(latestWeight, profile.heightCm)
    : null;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Profile</h1>

      {bmi && (
        <div className="rounded-xl border border-[#FFB020]/30 bg-[#261A04] p-4">
          <div className="text-4xl font-extrabold text-[#FFB020]">{bmi.toFixed(1)}</div>
          <div className="text-sm text-muted-foreground mt-1">BMI · {bmiCategory(bmi)}</div>
        </div>
      )}

      <ProfileForm profile={profile} />

      {weightEntries.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Weight history</h2>
          <div className="space-y-1">
            {weightEntries.map(e => (
              <div key={e.id} className="flex justify-between text-sm border-b border-border py-1.5">
                <span className="text-muted-foreground">{format(new Date(e.date), "EEE, MMM d yyyy")}</span>
                <span className="text-[#FFB020] font-medium">{e.weightKg} kg</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Create `src/components/profile-form.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { upsertProfile } from "@/actions/profile";
import { toast } from "sonner";
import type { UserProfile } from "@prisma/client";

export function ProfileForm({ profile }: { profile: UserProfile | null }) {
  const [sex, setSex]               = useState(profile?.sex ?? "");
  const [height, setHeight]         = useState(profile?.heightCm?.toString() ?? "");
  const [weight, setWeight]         = useState(profile?.baseWeightKg?.toString() ?? "");
  const [calories, setCalories]     = useState(profile?.calorieTarget?.toString() ?? "");
  const [protein, setProtein]       = useState(profile?.proteinTarget?.toString() ?? "");
  const [loading, setLoading]       = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await upsertProfile({ sex, heightCm: +height, baseWeightKg: +weight, calorieTarget: +calories, proteinTarget: +protein });
      toast.success("Profile saved");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Sex</Label>
          <Select value={sex} onValueChange={setSex}>
            <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Height (cm)</Label>
          <Input type="number" value={height} onChange={e => setHeight(e.target.value)} min={100} max={250} />
        </div>
        <div className="space-y-1">
          <Label>Base weight (kg)</Label>
          <Input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} min={20} max={300} />
        </div>
        <div className="space-y-1">
          <Label>Daily calorie target</Label>
          <Input type="number" value={calories} onChange={e => setCalories(e.target.value)} min={0} />
        </div>
        <div className="space-y-1 col-span-2">
          <Label>Daily protein target (g)</Label>
          <Input type="number" value={protein} onChange={e => setProtein(e.target.value)} min={0} />
        </div>
      </div>
      <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save profile"}</Button>
    </form>
  );
}
```

- [ ] **Step 7: Create `src/actions/profile.ts`**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function upsertProfile(data: {
  sex: string; heightCm: number; baseWeightKg: number; calorieTarget: number; proteinTarget: number;
}) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");
  await prisma.userProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...data },
    update: data,
  });
  revalidatePath("/profile");
}
```

- [ ] **Step 8: Verify profile + weight flow**

1. Go to `/profile`, fill in height + weight → BMI displays
2. Go to `/today`, click "+ Log Weight", enter value → weight stat card updates
3. Go back to `/profile` → weight history shows new entry, BMI recalculates

- [ ] **Step 9: Commit**

```bash
git add src/actions/weight.ts src/actions/profile.ts src/components/weight/ src/components/profile-form.tsx src/components/photo-toast-button.tsx src/lib/bmi.ts src/app/profile/
git commit -m "feat: add body weight logging, profile page with BMI"
```

---

## Task 11: Metrics dashboard

**Files:**
- Create: `src/app/metrics/page.tsx`, `src/components/metrics/nutrition-chart.tsx`, `src/components/metrics/weight-chart.tsx`, `src/components/metrics/volume-chart.tsx`, `src/components/metrics/max-weight-list.tsx`, `src/components/metrics/streak-widget.tsx`

- [ ] **Step 1: Create `src/app/metrics/page.tsx`**

```tsx
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay, format } from "date-fns";
import { NutritionChart } from "@/components/metrics/nutrition-chart";
import { WeightChart } from "@/components/metrics/weight-chart";
import { VolumeChart } from "@/components/metrics/volume-chart";
import { MaxWeightList } from "@/components/metrics/max-weight-list";
import { StreakWidget } from "@/components/metrics/streak-widget";

export default async function MetricsPage() {
  const session = await getSession();
  if (!session?.user) return null;
  const userId = session.user.id;

  // Last 7 days of daily logs
  const last7 = Array.from({ length: 7 }, (_, i) => startOfDay(subDays(new Date(), 6 - i)));
  const dailyLogs = await prisma.dailyLog.findMany({
    where: { userId, date: { gte: last7[0] } },
    include: {
      foodEntries: true,
      workoutSessions: { include: { exercises: { include: { sets: true } } } },
    },
  });

  const profile = await prisma.userProfile.findUnique({ where: { userId } });

  // Build nutrition data for chart
  const nutritionData = last7.map(d => {
    const log = dailyLogs.find(l => format(new Date(l.date), "yyyy-MM-dd") === format(d, "yyyy-MM-dd"));
    return {
      date: format(d, "EEE"),
      calories: log ? Math.round(log.foodEntries.reduce((s, e) => s + e.calories, 0)) : 0,
      protein:  log ? Math.round(log.foodEntries.reduce((s, e) => s + e.proteinG, 0)) : 0,
    };
  });

  // Weight entries for chart
  const weightEntries = await prisma.bodyWeightEntry.findMany({
    where: { userId },
    orderBy: { date: "asc" },
  });
  const weightData = weightEntries.map(e => ({
    date: format(new Date(e.date), "MMM d"),
    weight: e.weightKg,
  }));

  // Per-exercise max weight
  const allSets = await prisma.exerciseSet.findMany({
    where: { exercise: { workoutSession: { dailyLog: { userId } } } },
    include: { exercise: true },
  });
  const prMap = new Map<string, { maxWeight: number; date?: string }>();
  allSets.forEach(s => {
    if (s.weightKg == null) return;
    const current = prMap.get(s.exercise.name);
    if (!current || s.weightKg > current.maxWeight) {
      prMap.set(s.exercise.name, { maxWeight: s.weightKg });
    }
  });
  const maxWeights = Array.from(prMap.entries())
    .map(([name, v]) => ({ name, maxWeight: v.maxWeight }))
    .sort((a, b) => b.maxWeight - a.maxWeight);

  // Weekly volume (sets x reps) per exercise
  const weekStart = startOfDay(subDays(new Date(), 6));
  const weekLogs  = dailyLogs.filter(l => new Date(l.date) >= weekStart);
  const volMap = new Map<string, number>();
  weekLogs.forEach(l =>
    l.workoutSessions.forEach(s =>
      s.exercises.forEach(ex =>
        ex.sets.forEach(set => {
          volMap.set(ex.name, (volMap.get(ex.name) ?? 0) + set.reps);
        })
      )
    )
  );
  const volumeData = Array.from(volMap.entries())
    .map(([name, reps]) => ({ name, reps }))
    .sort((a, b) => b.reps - a.reps)
    .slice(0, 8);

  // Streak: consecutive days with food + workout
  const allLogs = await prisma.dailyLog.findMany({
    where: { userId },
    include: { foodEntries: true, workoutSessions: true },
    orderBy: { date: "desc" },
  });
  let streak = 0;
  for (let i = 0; i < allLogs.length; i++) {
    const expected = format(subDays(new Date(), i), "yyyy-MM-dd");
    const log = allLogs.find(l => format(new Date(l.date), "yyyy-MM-dd") === expected);
    if (log && log.foodEntries.length > 0 && log.workoutSessions.length > 0) streak++;
    else break;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Metrics</h1>
      <StreakWidget streak={streak} />
      <NutritionChart data={nutritionData} calorieTarget={profile?.calorieTarget} proteinTarget={profile?.proteinTarget} />
      <WeightChart data={weightData} />
      <VolumeChart data={volumeData} />
      <MaxWeightList items={maxWeights} />
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/metrics/streak-widget.tsx`**

```tsx
import { Card, CardContent } from "@/components/ui/card";

export function StreakWidget({ streak }: { streak: number }) {
  return (
    <Card className="border-primary/30 bg-card">
      <CardContent className="flex items-center gap-6 p-6">
        <div className="text-7xl font-black tracking-tighter text-primary leading-none">{streak}</div>
        <div>
          <div className="text-lg font-bold">Day Streak</div>
          <div className="text-sm text-muted-foreground mt-1">Consecutive days with food + workout logged</div>
          {streak === 0 && <div className="text-xs text-muted-foreground mt-2">Log food and a workout today to start your streak.</div>}
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Create `src/components/metrics/nutrition-chart.tsx`**

```tsx
"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  data: { date: string; calories: number; protein: number }[];
  calorieTarget?: number | null;
  proteinTarget?: number | null;
}

export function NutritionChart({ data, calorieTarget, proteinTarget }: Props) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-base">Weekly Nutrition</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#8888AA" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#8888AA" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#1A1A24", border: "1px solid #2A2A3A", borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="calories" fill="#FF5C38" radius={[3, 3, 0, 0]} name="Calories (kcal)" />
            <Bar dataKey="protein"  fill="#00D4FF" radius={[3, 3, 0, 0]} name="Protein (g)" />
            {calorieTarget && <ReferenceLine y={calorieTarget} stroke="#FF5C38" strokeDasharray="4 2" />}
            {proteinTarget  && <ReferenceLine y={proteinTarget}  stroke="#00D4FF" strokeDasharray="4 2" />}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Create `src/components/metrics/weight-chart.tsx`**

```tsx
"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function WeightChart({ data }: { data: { date: string; weight: number }[] }) {
  if (data.length < 2) return (
    <Card className="border-border bg-card">
      <CardHeader><CardTitle className="text-base">Body Weight Trend</CardTitle></CardHeader>
      <CardContent><p className="text-sm text-muted-foreground py-8 text-center">Log at least 2 weight entries to see your trend.</p></CardContent>
    </Card>
  );
  return (
    <Card className="border-border bg-card">
      <CardHeader><CardTitle className="text-base">Body Weight Trend</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#8888AA" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#8888AA" }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
            <Tooltip contentStyle={{ background: "#1A1A24", border: "1px solid #2A2A3A", borderRadius: 8 }} />
            <Line type="monotone" dataKey="weight" stroke="#FFB020" strokeWidth={2} dot={{ fill: "#FFB020", r: 3 }} name="Weight (kg)" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 5: Create `src/components/metrics/volume-chart.tsx`**

```tsx
"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function VolumeChart({ data }: { data: { name: string; reps: number }[] }) {
  if (data.length === 0) return (
    <Card className="border-border bg-card">
      <CardHeader><CardTitle className="text-base">Weekly Training Volume</CardTitle></CardHeader>
      <CardContent><p className="text-sm text-muted-foreground py-8 text-center">No workout data for this week yet.</p></CardContent>
    </Card>
  );
  return (
    <Card className="border-border bg-card">
      <CardHeader><CardTitle className="text-base">Weekly Training Volume (reps)</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, left: 60, bottom: 0 }}>
            <XAxis type="number" tick={{ fontSize: 10, fill: "#8888AA" }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#8888AA" }} axisLine={false} tickLine={false} width={60} />
            <Tooltip contentStyle={{ background: "#1A1A24", border: "1px solid #2A2A3A", borderRadius: 8 }} />
            <Bar dataKey="reps" fill="#A259FF" radius={[0, 3, 3, 0]} name="Total reps" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 6: Create `src/components/metrics/max-weight-list.tsx`**

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function MaxWeightList({ items }: { items: { name: string; maxWeight: number }[] }) {
  return (
    <Card className="border-border bg-card">
      <CardHeader><CardTitle className="text-base">Personal Records</CardTitle></CardHeader>
      <CardContent>
        {items.length === 0
          ? <p className="text-sm text-muted-foreground py-4 text-center">Log sets with weight to see your PRs.</p>
          : (
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.name} className="flex items-center justify-between border-b border-border py-2">
                  <span className="text-sm">{item.name}</span>
                  <Badge variant="outline" className="text-[#A259FF] border-[#A259FF]/30 bg-[#160D26]">
                    {item.maxWeight} kg
                  </Badge>
                </div>
              ))}
            </div>
          )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 7: Verify metrics page**

After logging some food + workouts + weight entries:
1. Visit `/metrics` → streak counter shows correct count
2. Nutrition chart shows bars for the last 7 days
3. Weight chart shows trend line (needs 2+ entries)
4. Volume chart shows reps per exercise for the week
5. PR list shows heaviest set per exercise

- [ ] **Step 8: Final build check**

```bash
npm run build
```

Expected: build completes with no TypeScript errors or missing module errors.

- [ ] **Step 9: Commit**

```bash
git add src/app/metrics/ src/components/metrics/
git commit -m "feat: add metrics dashboard with charts, PRs, and streak counter"
```

---

## Self-Review

**Spec coverage check:**
- Auth (stories 1–4): Task 5 ✓
- Food logging + totals (5, 7–10, 12): Tasks 7–8 ✓
- Food search API (6): Task 8 ✓
- Workout logging (13–19): Task 9 ✓
- Body weight + photo toast (20–22): Task 10 ✓
- Weight history (23): Task 10 (profile page) ✓
- User profile + BMI (24–26): Task 10 ✓
- Calorie/protein targets (27–28): Task 10 ✓
- Daily dashboard (29): Task 6 ✓
- Weekly nutrition summary (30): Task 11 ✓
- Weight trend chart (31): Task 11 ✓
- Weekly volume (32): Task 11 ✓
- Strength PRs (33): Task 11 ✓
- Streak (34): Task 11 ✓

**No placeholders found.** All steps have full code.

**Type consistency:**
- `getOrCreateDailyLog` returns Prisma type with includes — used consistently in today page and food/workout actions ✓
- `StatCard` accent prop typed as union — all call sites use valid values ✓
- `upsertBodyWeight` / `upsertProfile` server action signatures match client call sites ✓
