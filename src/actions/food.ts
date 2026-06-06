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
