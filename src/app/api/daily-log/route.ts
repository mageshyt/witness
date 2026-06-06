import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { startOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dateStr = req.nextUrl.searchParams.get("date") ?? new Date().toISOString().split("T")[0];

  const date = startOfDay(new Date(dateStr));
  const log = await prisma.dailyLog.upsert({
    where: { userId_date: { userId: session.user.id, date } },
    create: { userId: session.user.id, date },
    update: {},
    include: {
      foodEntries: true,
      workoutSessions: { include: { exercises: { include: { sets: true } } } },
    },
  });

  return NextResponse.json(log);
}
