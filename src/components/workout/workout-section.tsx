"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SessionCard } from "./session-card";
import { WorkoutForm } from "./workout-form";
import type { WorkoutSession, Exercise, ExerciseSet } from "@prisma/client";

type FullSession = WorkoutSession & {
  exercises: (Exercise & { sets: ExerciseSet[] })[];
};

interface Props {
  dateStr: string;
  sessions: FullSession[];
  customWorkoutTypes: string[];
}

export function WorkoutSection({ dateStr, sessions, customWorkoutTypes }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Workouts</h2>
        <Button size="sm" onClick={() => setOpen(true)}>+ Add Workout</Button>
      </div>

      {sessions.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">No workouts logged yet.</p>
      )}

      <div className="space-y-3">
        {sessions.map(s => <SessionCard key={s.id} session={s} />)}
      </div>

      <WorkoutForm dateStr={dateStr} open={open} onOpenChange={setOpen} customWorkoutTypes={customWorkoutTypes} />
    </section>
  );
}
