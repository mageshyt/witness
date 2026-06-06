"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FoodForm } from "./food-form";
import { deleteFoodEntry } from "@/actions/food";
import { toast } from "sonner";
import type { FoodEntry } from "@prisma/client";

interface Props {
  dateStr: string;
  entries: FoodEntry[];
}

export function FoodSection({ dateStr, entries }: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing]   = useState<FoodEntry | null>(null);

  async function handleDelete(id: string) {
    try {
      await deleteFoodEntry(id);
      toast.success("Entry deleted");
    } catch {
      toast.error("Failed to delete entry");
    }
  }

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(entry: FoodEntry) {
    setEditing(entry);
    setFormOpen(true);
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Food</h2>
        <Button size="sm" onClick={openAdd}>+ Add Food</Button>
      </div>

      {entries.length === 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">No food logged yet.</p>
      )}

      <div className="space-y-2">
        {entries.map(e => (
          <div key={e.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{e.name}</div>
              <div className="text-xs text-muted-foreground">{e.quantityG}g</div>
            </div>
            <Badge variant="outline" className="border-[#FF5C38]/30 bg-[#2A1208] text-[#FF5C38] text-xs">
              {Math.round(e.calories)} kcal
            </Badge>
            <Badge variant="outline" className="border-[#00D4FF]/30 bg-[#001E26] text-[#00D4FF] text-xs">
              {Math.round(e.proteinG)}g pro
            </Badge>
            <button
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => toast.info("Photo upload coming soon")}>
              📷
            </button>
            <button
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => openEdit(e)}>
              Edit
            </button>
            <button
              className="text-xs text-muted-foreground hover:text-destructive"
              onClick={() => handleDelete(e.id)}>
              Del
            </button>
          </div>
        ))}
      </div>

      <FoodForm
        dateStr={dateStr}
        open={formOpen}
        onOpenChange={open => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        initial={editing ? { id: editing.id, name: editing.name, quantityG: editing.quantityG, calories: editing.calories, proteinG: editing.proteinG } : undefined}
      />
    </section>
  );
}
