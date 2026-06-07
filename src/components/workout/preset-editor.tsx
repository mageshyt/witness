"use client";

import { useState, useTransition, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPreset, addToPresetAndSession, removeFromPreset, reorderPreset } from "@/actions/workout";
import { toast } from "sonner";
import { ChevronUp, ChevronDown, X } from "lucide-react";

type PresetItem = { id: string; exerciseName: string; order: number };

interface Props {
  workoutName: string;
  sessionId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function PresetEditor({ workoutName, sessionId, open, onOpenChange }: Props) {
  const [items, setItems] = useState<PresetItem[]>([]);
  const [newName, setNewName] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    startTransition(async () => {
      const data = await getPreset(workoutName);
      setItems(data);
    });
  }, [open, workoutName]);

  function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    startTransition(async () => {
      try {
        await addToPresetAndSession(workoutName, name, sessionId);
        setNewName("");
        const data = await getPreset(workoutName);
        setItems(data);
      } catch {
        toast.error("Failed to add exercise");
      }
    });
  }

  function handleRemove(exerciseName: string) {
    startTransition(async () => {
      try {
        await removeFromPreset(workoutName, exerciseName);
        const data = await getPreset(workoutName);
        setItems(data);
      } catch {
        toast.error("Failed to remove exercise");
      }
    });
  }

  function handleReorder(exerciseName: string, direction: "up" | "down") {
    startTransition(async () => {
      try {
        await reorderPreset(workoutName, exerciseName, direction);
        const data = await getPreset(workoutName);
        setItems(data);
      } catch {
        toast.error("Failed to reorder");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-4 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{workoutName} — Preset</DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-1 overflow-y-auto">
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">No exercises yet. Add one below.</p>
          )}
          {items.map((item, i) => (
            <div key={item.id} className="flex items-center gap-1 rounded-md border border-border px-3 py-2">
              <span className="flex-1 text-sm">{item.exerciseName}</span>
              <button
                disabled={i === 0 || pending}
                onClick={() => handleReorder(item.exerciseName, "up")}
                className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30">
                <ChevronUp size={14} />
              </button>
              <button
                disabled={i === items.length - 1 || pending}
                onClick={() => handleReorder(item.exerciseName, "down")}
                className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30">
                <ChevronDown size={14} />
              </button>
              <button
                disabled={pending}
                onClick={() => handleRemove(item.exerciseName)}
                className="p-1 text-muted-foreground hover:text-destructive disabled:opacity-30">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 border-t border-border pt-4">
          <Input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            placeholder="Exercise name"
            className="h-9 text-sm"
            disabled={pending}
          />
          <Button size="sm" onClick={handleAdd} disabled={pending || !newName.trim()}>
            Add
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
