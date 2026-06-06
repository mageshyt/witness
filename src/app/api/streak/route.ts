import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { format, subDays } from "date-fns";

export async function GET() {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ streak: 0 });

    const logs = await prisma.dailyLog.findMany({
        where: { userId: session.user.id },
        include: { foodEntries: true, workoutSessions: true },
        orderBy: { date: "desc" },
});

    let streak = 0;
    for (let i = 0; i < logs.length; i++) {
        const expected = format(subDays(new Date(), i), "yyyy-MM-dd");
        const log = logs.find(l => format(new Date(l.date), "yyyy-MM-dd") === expected);
        if (log && log.foodEntries.length > 0 && log.workoutSessions.length > 0) {
            streak++;
        } else {
            break;
        }
    }

    return NextResponse.json({ streak });
}
