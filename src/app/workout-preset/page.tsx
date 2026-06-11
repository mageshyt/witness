import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { WorkoutPresetManager } from "@/components/workout/workout-preset-manager";
import { getUserCustomWorkoutTypes } from "@/actions/workout";

export default async function WorkoutPresetPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const customTypes = await getUserCustomWorkoutTypes();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Workout Presets</h1>
      </div>
      <p className="text-sm text-muted-foreground">Tap a workout to edit its default exercises.</p>
      <WorkoutPresetManager customTypes={customTypes} />
    </div>
  );
}
