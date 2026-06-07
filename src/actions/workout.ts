"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOrCreateDailyLog } from "./daily-log";
import { getSession } from "@/lib/session";
import { QUICK_LABELS } from "@/lib/workout-constants";

export async function createWorkoutSession(dateStr: string, label: string) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");
  const log = await getOrCreateDailyLog(dateStr);
  const existing = await prisma.workoutSession.findFirst({ where: { dailyLogId: log.id, label } });
  if (existing) throw new Error(`A "${label}" session already exists for today`);

  const ws = await prisma.workoutSession.create({ data: { dailyLogId: log.id, label } });

  if ((QUICK_LABELS as readonly string[]).includes(label)) {
    const presets = await prisma.workoutPreset.findMany({
      where: { userId: session.user.id, workoutName: label },
      orderBy: { order: "asc" },
    });
    if (presets.length > 0) {
      await prisma.exercise.createMany({
        data: presets.map(p => ({
          workoutSessionId: ws.id,
          name: p.exerciseName,
          order: p.order,
        })),
      });
    }
  }

  revalidatePath("/today");
}

export async function deleteWorkoutSession(id: string) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");
  await prisma.workoutSession.delete({ where: { id } });
  revalidatePath("/today");
}

export async function addExercise(sessionId: string, name: string, order: number, workoutName: string | null) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");
  await prisma.exercise.create({ data: { workoutSessionId: sessionId, name, order } });

  if (workoutName && (QUICK_LABELS as readonly string[]).includes(workoutName)) {
    const maxOrder = await prisma.workoutPreset.aggregate({
      where: { userId: session.user.id, workoutName },
      _max: { order: true },
    });
    await prisma.workoutPreset.upsert({
      where: { userId_workoutName_exerciseName: { userId: session.user.id, workoutName, exerciseName: name } },
      create: { userId: session.user.id, workoutName, exerciseName: name, order: (maxOrder._max.order ?? -1) + 1 },
      update: {},
    });
  }

  revalidatePath("/today");
}

export async function deleteExercise(id: string) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");
  await prisma.exercise.delete({ where: { id } });
  revalidatePath("/today");
}

export async function addSet(exerciseId: string, setNumber: number, reps: number, weightKg?: number) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");
  await prisma.exerciseSet.create({ data: { exerciseId, setNumber, reps, weightKg } });
  revalidatePath("/today");
}

export async function updateSet(id: string, reps: number, weightKg?: number) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");
  await prisma.exerciseSet.update({ where: { id }, data: { reps, weightKg } });
  revalidatePath("/today");
}

export async function deleteSet(id: string) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");
  await prisma.exerciseSet.delete({ where: { id } });
  revalidatePath("/today");
}

// Preset actions

export async function getPreset(workoutName: string): Promise<{ id: string; exerciseName: string; order: number }[]> {
  const session = await getSession();
  if (!session?.user) return [];
  return prisma.workoutPreset.findMany({
    where: { userId: session.user.id, workoutName },
    orderBy: { order: "asc" },
    select: { id: true, exerciseName: true, order: true },
  });
}

export async function removeFromPreset(workoutName: string, exerciseName: string) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");
  await prisma.workoutPreset.deleteMany({
    where: { userId: session.user.id, workoutName, exerciseName },
  });
  revalidatePath("/today");
}

export async function addToPresetAndSession(workoutName: string, exerciseName: string, sessionId: string) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const maxOrder = await prisma.workoutPreset.aggregate({
    where: { userId: session.user.id, workoutName },
    _max: { order: true },
  });
  await prisma.workoutPreset.upsert({
    where: { userId_workoutName_exerciseName: { userId: session.user.id, workoutName, exerciseName } },
    create: { userId: session.user.id, workoutName, exerciseName, order: (maxOrder._max.order ?? -1) + 1 },
    update: {},
  });

  const already = await prisma.exercise.findFirst({
    where: { workoutSessionId: sessionId, name: exerciseName },
  });
  if (!already) {
    const count = await prisma.exercise.count({ where: { workoutSessionId: sessionId } });
    await prisma.exercise.create({
      data: { workoutSessionId: sessionId, name: exerciseName, order: count },
    });
  }

  revalidatePath("/today");
}

export async function reorderPreset(workoutName: string, exerciseName: string, direction: "up" | "down") {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const all = await prisma.workoutPreset.findMany({
    where: { userId: session.user.id, workoutName },
    orderBy: { order: "asc" },
  });

  const idx = all.findIndex(p => p.exerciseName === exerciseName);
  if (idx === -1) return;

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= all.length) return;

  const a = all[idx];
  const b = all[swapIdx];

  await prisma.$transaction([
    prisma.workoutPreset.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.workoutPreset.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);
}
