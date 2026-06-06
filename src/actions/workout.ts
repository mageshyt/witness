"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOrCreateDailyLog } from "./daily-log";
import { getSession } from "@/lib/session";

export async function createWorkoutSession(dateStr: string, label: string) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");
  const log = await getOrCreateDailyLog(dateStr);
  await prisma.workoutSession.create({ data: { dailyLogId: log.id, label } });
  revalidatePath("/today");
}

export async function deleteWorkoutSession(id: string) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");
  await prisma.workoutSession.delete({ where: { id } });
  revalidatePath("/today");
}

export async function addExercise(sessionId: string, name: string, order: number) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");
  await prisma.exercise.create({ data: { workoutSessionId: sessionId, name, order } });
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
