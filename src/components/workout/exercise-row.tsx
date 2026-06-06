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
        <div className="space-y-1">
          <div className="grid grid-cols-4 gap-1 text-xs text-muted-foreground px-1">
            <span>Set</span><span>Weight (kg)</span><span>Reps</span><span></span>
          </div>
          {exercise.sets.map(s => (
            <SetRow key={s.id} set={s} />
          ))}
        </div>
      )}

      <div className="flex gap-2 items-end">
        <Input className="h-7 text-xs w-24" placeholder="kg" value={newWeight} onChange={e => setNewWeight(e.target.value)} type="number" min={0} />
        <Input className="h-7 text-xs w-20" placeholder="reps" value={newReps} onChange={e => setNewReps(e.target.value)} type="number" min={1} />
        <Button size="sm" className="h-7 text-xs" onClick={handleAddSet} disabled={adding || !newReps}>
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
    <div className="grid grid-cols-4 gap-1 items-center">
      <span className="text-xs text-muted-foreground pl-1">{set.setNumber}</span>
      <Input className="h-6 text-xs" value={weight} onChange={e => setWeight(e.target.value)} onBlur={handleBlur} type="number" min={0} />
      <Input className="h-6 text-xs" value={reps}   onChange={e => setReps(e.target.value)}   onBlur={handleBlur} type="number" min={1} />
      <button className="text-xs text-muted-foreground hover:text-destructive"
        onClick={async () => { try { await deleteSet(set.id); } catch { toast.error("Failed to delete set"); } }}>
        ✕
      </button>
    </div>
  );
}
