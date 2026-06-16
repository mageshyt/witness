"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { startOfDay } from "date-fns";
import { redirect } from "next/navigation";

export async function getOrCreateDailyLog(dateStr: string) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

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
