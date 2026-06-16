import { getOrCreateDailyLog } from "@/actions/daily-log";
import { getUserCustomWorkoutTypes } from "@/actions/workout";
import { getFoodPresets } from "@/actions/food";
import { StatCard } from "@/components/stat-card";
import { FoodSection } from "@/components/food/food-section";
import { WorkoutSection } from "@/components/workout/workout-section";
import { WeightDialog } from "@/components/weight/weight-dialog";
import { PhotoToastButton } from "@/components/photo-toast-button";
import { DateNav } from "@/components/date-nav";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { redirect } from "next/navigation";

interface Props {
  searchParams: Promise<{ date?: string }>;
}

export default async function TodayPage({ searchParams }: Props) {
  const { date: dateParam } = await searchParams;
  const dateStr = dateParam ?? format(new Date(), "yyyy-MM-dd");

  const session = await getSession();
  if (!session?.user) redirect("/login");

  const [log, customWorkoutTypes, foodPresets] = await Promise.all([
    getOrCreateDailyLog(dateStr),
    getUserCustomWorkoutTypes(),
    getFoodPresets(),
  ]);

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  const totalCalories = log.foodEntries.reduce((s, e) => s + e.calories, 0);
  const totalProtein  = log.foodEntries.reduce((s, e) => s + e.proteinG, 0);
  const sessionCount  = log.workoutSessions.length;
  const totalSets     = log.workoutSessions.flatMap(s => s.exercises.flatMap(e => e.sets)).length;

  const latestWeight = await prisma.bodyWeightEntry.findFirst({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Date nav with calendar picker */}
      <DateNav dateStr={dateStr} />

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

      {/* Weight + photo quick actions */}
      <div className="flex items-center gap-3">
        <WeightDialog dateStr={dateStr} current={latestWeight?.weightKg} />
        <PhotoToastButton />
      </div>

      <FoodSection dateStr={dateStr} entries={log.foodEntries} foodPresets={foodPresets} />
      <WorkoutSection dateStr={dateStr} sessions={log.workoutSessions} customWorkoutTypes={customWorkoutTypes} />
    </div>
  );
}
