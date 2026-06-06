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

  const last7 = Array.from({ length: 7 }, (_, i) => startOfDay(subDays(new Date(), 6 - i)));

  const dailyLogs = await prisma.dailyLog.findMany({
    where: { userId, date: { gte: last7[0] } },
    include: {
      foodEntries: true,
      workoutSessions: { include: { exercises: { include: { sets: true } } } },
    },
  });

  const profile = await prisma.userProfile.findUnique({ where: { userId } });

  const nutritionData = last7.map(d => {
    const log = dailyLogs.find(l => format(new Date(l.date), "yyyy-MM-dd") === format(d, "yyyy-MM-dd"));
    return {
      date: format(d, "EEE"),
      calories: log ? Math.round(log.foodEntries.reduce((s, e) => s + e.calories, 0)) : 0,
      protein:  log ? Math.round(log.foodEntries.reduce((s, e) => s + e.proteinG, 0)) : 0,
    };
  });

  const weightEntries = await prisma.bodyWeightEntry.findMany({
    where: { userId },
    orderBy: { date: "asc" },
  });
  const weightData = weightEntries.map(e => ({
    date: format(new Date(e.date), "MMM d"),
    weight: e.weightKg,
  }));

  const allSets = await prisma.exerciseSet.findMany({
    where: { exercise: { workoutSession: { dailyLog: { userId } } } },
    include: { exercise: true },
  });
  const prMap = new Map<string, number>();
  allSets.forEach(s => {
    if (s.weightKg == null) return;
    const current = prMap.get(s.exercise.name) ?? 0;
    if (s.weightKg > current) prMap.set(s.exercise.name, s.weightKg);
  });
  const maxWeights = Array.from(prMap.entries())
    .map(([name, maxWeight]) => ({ name, maxWeight }))
    .sort((a, b) => b.maxWeight - a.maxWeight);

  const weekStart = startOfDay(subDays(new Date(), 6));
  const volMap = new Map<string, number>();
  dailyLogs
    .filter(l => new Date(l.date) >= weekStart)
    .forEach(l =>
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

  const allLogs = await prisma.dailyLog.findMany({
    where: { userId },
    include: { foodEntries: true, workoutSessions: true },
    orderBy: { date: "desc" },
  });
  let streak = 0;
  for (let i = 0; i < allLogs.length; i++) {
    const expected = format(subDays(new Date(), i), "yyyy-MM-dd");
    const log = allLogs.find(l => format(new Date(l.date), "yyyy-MM-dd") === expected);
    if (log && log.foodEntries.length > 0 && log.workoutSessions.length > 0) {
      streak++;
    } else {
      break;
    }
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
