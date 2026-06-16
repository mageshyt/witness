import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { calculateBMI, bmiCategory } from "@/lib/bmi";
import { ProfileForm } from "@/components/profile-form";
import { LogoutButton } from "@/components/logout-button";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { SlidersHorizontal, Utensils } from "lucide-react";
import { format } from "date-fns";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session?.user) return null;

  const profile = await prisma.userProfile.findUnique({ where: { userId: session.user.id } });
  const weightEntries = await prisma.bodyWeightEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
  });

  const latestWeight = weightEntries[0]?.weightKg ?? profile?.baseWeightKg;
  const bmi = latestWeight && profile?.heightCm
    ? calculateBMI(latestWeight, profile.heightCm)
    : null;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Hi {session.user.name},</h1>

      {bmi && (
        <div className="rounded-xl border border-[#FFB020]/30 bg-[#261A04] p-4">
          <div className="text-4xl font-extrabold text-[#FFB020]">{bmi.toFixed(1)}</div>
          <div className="mt-1 text-sm text-muted-foreground">BMI · {bmiCategory(bmi)}</div>
        </div>
      )}

      <ProfileForm profile={profile} />

      <div className="rounded-xl border border-border p-4 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Presets</h2>
        <div className="flex gap-3">
          <Link href="/workout-preset" className={cn(buttonVariants({ variant: "outline" }), "flex-1 gap-2")}>
            <SlidersHorizontal size={16} /> Workout Presets
          </Link>
          <Link href="/food-preset" className={cn(buttonVariants({ variant: "outline" }), "flex-1 gap-2")}>
            <Utensils size={16} /> Food Presets
          </Link>
        </div>
      </div>

      <LogoutButton />

      {weightEntries.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Weight history</h2>
          <div className="space-y-1">
            {weightEntries.map(e => (
              <div key={e.id} className="flex justify-between border-b border-border py-1.5 text-sm">
                <span className="text-muted-foreground">{format(new Date(e.date), "EEE, MMM d yyyy")}</span>
                <span className="font-medium text-[#FFB020]">{e.weightKg} kg</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
