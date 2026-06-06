"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addSet, updateSet, deleteSet, deleteExercise } from "@/actions/workout";
import { toast } from "sonner";
import type { Exercise, ExerciseSet } from "@prisma/client";

interface Props {
  exercise: Exercise & { sets: ExerciseSet[] };
}

export function ExerciseRow({ exercise }: Props) {
  const [adding, setAdding]       = useState(false);
  const [newReps, setNewReps]     = useState("");
  const [newWeight, setNewWeight] = useState("");

  async function handleAddSet() {
    if (!newReps) return;
    setAdding(true);
    try {
      await addSet(exercise.id, exercise.sets.length + 1, +newReps, newWeight ? +newWeight : undefined);
      setNewReps(""); setNewWeight("");
    } catch {
      toast.error("Failed to add set");
    } finally {
      setAdding(false);
    }
  }

  async function handleDeleteExercise() {
    try {
      await deleteExercise(exercise.id);
    } catch {
      toast.error("Failed to remove exercise");
    }
  }

  return (
    <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{exercise.name}</span>
        <button className="text-xs text-muted-foreground hover:text-destructive" onClick={handleDeleteExercise}>
          Remove
        </button>
      </div>

      {exercise.sets.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-4 gap-2 px-2 text-xs font-medium text-muted-foreground">
            <span>Set</span><span>Weight (kg)</span><span>Reps</span><span></span>
          </div>
          <div className="space-y-2">
            {exercise.sets.map(s => (
              <SetRow key={s.id} set={s} />
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 items-center pt-2">
        <Input className="h-9 w-28 text-sm" placeholder="Weight kg" value={newWeight} onChange={e => setNewWeight(e.target.value)} type="text" inputMode="decimal" />
        <Input className="h-9 w-24 text-sm" placeholder="Reps" value={newReps} onChange={e => setNewReps(e.target.value)} type="text" inputMode="numeric" />
        <Button size="sm" className="h-9 px-4" onClick={handleAddSet} disabled={adding || !newReps}>
          + Set
        </Button>
      </div>
    </div>
  );
}

function SetRow({ set }: { set: ExerciseSet }) {
  const [reps, setReps]     = useState(set.reps.toString());
  const [weight, setWeight] = useState(set.weightKg?.toString() ?? "");

  async function handleBlur() {
    try {
      await updateSet(set.id, +reps, weight ? +weight : undefined);
    } catch {
      toast.error("Failed to update set");
    }
  }

  return (
    <div className="grid grid-cols-4 gap-2 items-center rounded-md border border-border/40 bg-background px-2 py-2">
      <span className="text-xs font-medium text-muted-foreground pl-1">{set.setNumber}</span>
      <Input className="h-8 text-sm" value={weight} onChange={e => setWeight(e.target.value)} onBlur={handleBlur} type="text" inputMode="decimal" placeholder="—" />
      <Input className="h-8 text-sm" value={reps}   onChange={e => setReps(e.target.value)}   onBlur={handleBlur} type="text" inputMode="numeric" placeholder="—" />
      <button className="flex justify-center text-muted-foreground hover:text-destructive transition-colors"
        onClick={async () => { try { await deleteSet(set.id); } catch { toast.error("Failed to delete set"); } }}>
        ✕
      </button>
    </div>
  );
}
