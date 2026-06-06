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
