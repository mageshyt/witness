"use client";

import { useState, useTransition } from "react";
import { QUICK_LABELS } from "@/lib/workout-constants";
import { PresetEditor } from "@/components/workout/preset-editor";
import { createCustomWorkoutType, deleteCustomWorkoutType } from "@/actions/workout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  customTypes: string[];
}

export function WorkoutPresetManager({ customTypes }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [newType, setNewType] = useState("");
  const [pending, startTransition] = useTransition();

  function handleAdd() {
    const name = newType.trim();
    if (!name) return;
    startTransition(async () => {
      try {
        await createCustomWorkoutType(name);
        setNewType("");
        toast.success(`"${name}" added`);
      } catch {
        toast.error("Failed to add workout type");
      }
    });
  }

  function handleDelete(name: string) {
    startTransition(async () => {
      try {
        await deleteCustomWorkoutType(name);
        toast.success(`"${name}" removed`);
      } catch {
        toast.error("Failed to remove workout type");
      }
    });
  }

  return (
    <>
      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Built-in</h2>
        <div className="grid grid-cols-3 gap-2">
          {QUICK_LABELS.map(label => (
            <button
              key={label}
              onClick={() => setSelected(label)}
              className="rounded-md border border-border px-3 py-3 text-sm font-medium hover:bg-accent transition-colors">
              {label}
            </button>
          ))}
        </div>
      </section>

      {customTypes.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Custom</h2>
          <div className="grid grid-cols-3 gap-2">
            {customTypes.map(name => (
              <div key={name} className="relative">
                <button
                  onClick={() => setSelected(name)}
                  className="w-full rounded-md border border-border px-3 py-3 pr-7 text-sm font-medium hover:bg-accent transition-colors">
                  {name}
                </button>
                <button
                  onClick={() => handleDelete(name)}
                  disabled={pending}
                  className="absolute right-1.5 top-1.5 p-0.5 text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="flex gap-2">
        <Input
          value={newType}
          onChange={e => setNewType(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          placeholder="Add custom workout type…"
          className="h-9 text-sm"
          disabled={pending}
        />
        <Button size="sm" onClick={handleAdd} disabled={pending || !newType.trim()}>
          Add
        </Button>
      </div>

      {selected && (
        <PresetEditor
          workoutName={selected}
          open={!!selected}
          onOpenChange={open => { if (!open) setSelected(null); }}
        />
      )}
    </>
  );
}
