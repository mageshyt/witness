"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function upsertProfile(data: {
  sex: string;
  heightCm: number;
  baseWeightKg: number;
  calorieTarget: number;
  proteinTarget: number;
}) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");
  await prisma.userProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...data },
    update: data,
  });
  revalidatePath("/profile");
}
