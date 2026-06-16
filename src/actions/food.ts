"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getOrCreateDailyLog } from "./daily-log";

export async function addFoodEntry(dateStr: string, data: {
  name: string; calories: number; proteinG: number; fatsG: number;
}) {
  const log = await getOrCreateDailyLog(dateStr);
  await prisma.foodEntry.create({ data: { dailyLogId: log.id, ...data } });
  revalidatePath("/today");
}

export async function updateFoodEntry(id: string, data: {
  name: string; calories: number; proteinG: number; fatsG: number;
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

export async function getFoodPresets() {
  const session = await getSession();
  if (!session?.user) return [];
  return prisma.foodPreset.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true, calories: true, proteinG: true, fatsG: true },
  });
}

export async function createFoodPreset(data: {
  name: string; calories: number; proteinG: number; fatsG: number;
}) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");
  await prisma.foodPreset.create({ data: { userId: session.user.id, ...data } });
  revalidatePath("/profile");
  revalidatePath("/food-preset");
}

export async function updateFoodPreset(
  id: string,
  data: { name?: string; calories?: number; proteinG?: number; fatsG?: number }
) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");
  await prisma.foodPreset.update({ where: { id, userId: session.user.id }, data });
  revalidatePath("/profile");
  revalidatePath("/food-preset");
}

export async function deleteFoodPreset(id: string) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");
  await prisma.foodPreset.delete({ where: { id, userId: session.user.id } });
  revalidatePath("/profile");
  revalidatePath("/food-preset");
}
