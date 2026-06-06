import { getOrCreateDailyLog } from "@/actions/daily-log";
import { StatCard } from "@/components/stat-card";
import { FoodSection } from "@/components/food/food-section";
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

  const prevDate = format(subDays(new Date(dateStr + "T12:00:00"), 1), "yyyy-MM-dd");
  const nextDate = format(addDays(new Date(dateStr + "T12:00:00"), 1), "yyyy-MM-dd");
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

      <FoodSection dateStr={dateStr} entries={log.foodEntries} />
    </div>
  );
}
