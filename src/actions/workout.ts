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

  const preset = await prisma.workoutPreset.findUnique({
    where: { userId_name: { userId: session.user.id, name: label } },
    include: { exercises: { orderBy: { order: "asc" } } },
  });
  if (preset && preset.exercises.length > 0) {
    await prisma.exercise.createMany({
      data: preset.exercises.map(e => ({
        workoutSessionId: ws.id,
        name: e.exerciseName,
        order: e.order,
      })),
    });
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

  if (workoutName) {
    const isBuiltIn = (QUICK_LABELS as readonly string[]).includes(workoutName);
    const hasPreset = isBuiltIn || !!(await prisma.workoutPreset.findUnique({
      where: { userId_name: { userId: session.user.id, name: workoutName } },
    }));
    if (hasPreset) {
      await upsertPresetExercise(session.user.id, workoutName, name);
    }
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
  const parent = await prisma.workoutPreset.findUnique({
    where: { userId_name: { userId: session.user.id, name: workoutName } },
  });
  if (!parent) return [];
  return prisma.presetExercise.findMany({
    where: { presetId: parent.id },
    orderBy: { order: "asc" },
    select: { id: true, exerciseName: true, order: true },
  });
}

export async function removeFromPreset(workoutName: string, exerciseName: string) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");
  const parent = await prisma.workoutPreset.findUnique({
    where: { userId_name: { userId: session.user.id, name: workoutName } },
  });
  if (!parent) return;
  await prisma.presetExercise.deleteMany({ where: { presetId: parent.id, exerciseName } });
  revalidatePath("/today");
}

async function upsertPresetExercise(userId: string, workoutName: string, exerciseName: string) {
  const parent = await prisma.workoutPreset.upsert({
    where: { userId_name: { userId, name: workoutName } },
    create: { userId, name: workoutName },
    update: {},
  });
  const maxOrder = await prisma.presetExercise.aggregate({
    where: { presetId: parent.id },
    _max: { order: true },
  });
  await prisma.presetExercise.upsert({
    where: { presetId_exerciseName: { presetId: parent.id, exerciseName } },
    create: { presetId: parent.id, exerciseName, order: (maxOrder._max.order ?? -1) + 1 },
    update: {},
  });
}

export async function addToPreset(workoutName: string, exerciseName: string) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");
  await upsertPresetExercise(session.user.id, workoutName, exerciseName);
  revalidatePath("/profile");
}

export async function addToPresetAndSession(workoutName: string, exerciseName: string, sessionId: string) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");

  await upsertPresetExercise(session.user.id, workoutName, exerciseName);

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

export async function getUserCustomWorkoutTypes(): Promise<string[]> {
  const session = await getSession();
  if (!session?.user) return [];
  const presets = await prisma.workoutPreset.findMany({
    where: { userId: session.user.id },
    select: { name: true },
    orderBy: { name: "asc" },
  });
  const builtIn = new Set(QUICK_LABELS as readonly string[]);
  return presets.map(p => p.name).filter(n => !builtIn.has(n));
}

export async function createCustomWorkoutType(name: string) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");
  await prisma.workoutPreset.upsert({
    where: { userId_name: { userId: session.user.id, name } },
    create: { userId: session.user.id, name },
    update: {},
  });
  revalidatePath("/workout-preset");
  revalidatePath("/today");
}

export async function deleteCustomWorkoutType(name: string) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");
  if ((QUICK_LABELS as readonly string[]).includes(name)) throw new Error("Cannot delete built-in workout type");
  await prisma.workoutPreset.delete({
    where: { userId_name: { userId: session.user.id, name } },
  });
  revalidatePath("/workout-preset");
  revalidatePath("/today");
}

export async function reorderPreset(workoutName: string, exerciseName: string, direction: "up" | "down") {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const parent = await prisma.workoutPreset.findUnique({
    where: { userId_name: { userId: session.user.id, name: workoutName } },
  });
  if (!parent) return;

  const all = await prisma.presetExercise.findMany({
    where: { presetId: parent.id },
    orderBy: { order: "asc" },
  });

  const idx = all.findIndex(p => p.exerciseName === exerciseName);
  if (idx === -1) return;

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= all.length) return;

  const a = all[idx];
  const b = all[swapIdx];

  await prisma.$transaction([
    prisma.presetExercise.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.presetExercise.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);
}
