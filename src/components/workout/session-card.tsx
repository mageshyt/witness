"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExerciseRow } from "./exercise-row";
import { addExercise, deleteWorkoutSession } from "@/actions/workout";
import { toast } from "sonner";
import type { WorkoutSession, Exercise, ExerciseSet } from "@prisma/client";

type FullSession = WorkoutSession & {
  exercises: (Exercise & { sets: ExerciseSet[] })[];
};

export function SessionCard({ session }: { session: FullSession }) {
  const [exName, setExName] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAddExercise() {
    if (!exName.trim()) return;
    setAdding(true);
    try {
      await addExercise(session.id, exName.trim(), session.exercises.length, session.label);
      setExName("");
    } catch {
      toast.error("Failed to add exercise");
    } finally {
      setAdding(false);
    }
  }

  async function handleDeleteSession() {
    try {
      await deleteWorkoutSession(session.id);
    } catch {
      toast.error("Failed to delete session");
    }
  }

  return (
    <Card className="border-[#A259FF]/30 bg-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-[#A259FF]">{session.label}</CardTitle>
            <button className="text-xs text-muted-foreground hover:text-destructive" onClick={handleDeleteSession}>
              Delete session
            </button>
          </div>
          <p className="text-xs text-muted-foreground">{session.exercises.length} exercise(s)</p>
        </CardHeader>
        <CardContent className="space-y-2">
          {session.exercises.map(ex => <ExerciseRow key={ex.id} exercise={ex} />)}

          <div className="flex gap-2">
            <Input className="h-8 text-sm" placeholder="Add Exercise"
              value={exName} onChange={e => setExName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddExercise()} />
            <Button size="sm" className="h-8" onClick={handleAddExercise} disabled={adding || !exName.trim()}>
              + Add
            </Button>
          </div>
        </CardContent>
    </Card>
  );
}
