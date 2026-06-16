"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createFoodPreset, updateFoodPreset, deleteFoodPreset } from "@/actions/food";
import { toast } from "sonner";
import { Pencil, Search, Trash2 } from "lucide-react";

type FoodPreset = { id: string; name: string; calories: number; proteinG: number; fatsG: number };

function fuzzyMatch(text: string, query: string): boolean {
  if (!query) return true;
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  let ti = 0;
  for (let qi = 0; qi < q.length; qi++) {
    ti = t.indexOf(q[qi], ti);
    if (ti === -1) return false;
    ti++;
  }
  return true;
}

function toNumeric(raw: string): string {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  return parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : cleaned;
}

interface Props {
  initialPresets: FoodPreset[];
}

export function FoodPresetManager({ initialPresets }: Props) {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FoodPreset | null>(null);
  const [pending, startTransition] = useTransition();

  const [name, setName]       = useState("");
  const [kcal, setKcal]       = useState("");
  const [protein, setProtein] = useState("");
  const [fats, setFats]       = useState("");

  function openAdd() {
    setEditing(null);
    setName(""); setKcal(""); setProtein(""); setFats("");
    setFormOpen(true);
  }

  function openEdit(preset: FoodPreset) {
    setEditing(preset);
    setName(preset.name);
    setKcal(preset.calories.toString());
    setProtein(preset.proteinG.toString());
    setFats(preset.fatsG.toString());
    setFormOpen(true);
  }

  function handleClose(open: boolean) {
    setFormOpen(open);
    if (!open) setEditing(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = { name, calories: +kcal, proteinG: +protein, fatsG: +fats };
    startTransition(async () => {
      try {
        if (editing) { await updateFoodPreset(editing.id, data); }
        else         { await createFoodPreset(data); }
        toast.success(editing ? "Preset updated" : "Preset created");
        setFormOpen(false);
      } catch {
        toast.error("Something went wrong");
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteFoodPreset(id);
        toast.success("Preset deleted");
      } catch {
        toast.error("Failed to delete");
      }
    });
  }

  const filtered = initialPresets.filter(p => fuzzyMatch(p.name, search));

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Saved presets</h2>
        <Button size="sm" onClick={openAdd}>+ Add Preset</Button>
      </div>

      {initialPresets.length > 0 && (
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search food presets…"
            className="pl-8 h-9 text-sm"
          />
        </div>
      )}

      {initialPresets.length === 0 && (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No food presets yet. Add one to speed up logging.
        </p>
      )}

      {initialPresets.length > 0 && filtered.length === 0 && (
        <p className="py-6 text-center text-sm text-muted-foreground">No presets match "{search}"</p>
      )}

      <div className="space-y-2">
        {filtered.map(p => (
          <div key={p.id} className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
            <div className="min-w-0 flex-1 truncate text-sm font-medium">{p.name}</div>
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: "#2A1208", color: "#FF5C38" }}>
                {Math.round(p.calories)} kcal
              </span>
              <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: "#001E26", color: "#00D4FF" }}>
                {Math.round(p.proteinG)}g pro
              </span>
              <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: "#261A00", color: "#FFB020" }}>
                {Math.round(p.fatsG)}g fat
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                disabled={pending}
                onClick={() => openEdit(p)}
                className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30">
                <Pencil size={14} />
              </button>
              <button
                disabled={pending}
                onClick={() => handleDelete(p.id)}
                className="text-muted-foreground transition-colors hover:text-destructive disabled:opacity-30">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={formOpen} onOpenChange={handleClose}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg font-semibold">
              {editing ? "Edit preset" : "New food preset"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="preset-name" className="text-sm font-medium">Food name</Label>
              <Input
                id="preset-name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="e.g. Chicken breast"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="preset-kcal" className="text-sm font-medium">Calories</Label>
                <div className="relative">
                  <Input
                    id="preset-kcal"
                    type="text"
                    inputMode="decimal"
                    value={kcal}
                    onChange={e => setKcal(toNumeric(e.target.value))}
                    placeholder="0"
                    className="pr-10"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">kcal</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="preset-protein" className="text-sm font-medium">Protein</Label>
                <div className="relative">
                  <Input
                    id="preset-protein"
                    type="text"
                    inputMode="decimal"
                    value={protein}
                    onChange={e => setProtein(toNumeric(e.target.value))}
                    placeholder="0"
                    className="pr-6"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">g</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="preset-fats" className="text-sm font-medium">Fats</Label>
                <div className="relative">
                  <Input
                    id="preset-fats"
                    type="text"
                    inputMode="decimal"
                    value={fats}
                    onChange={e => setFats(toNumeric(e.target.value))}
                    placeholder="0"
                    className="pr-6"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">g</span>
                </div>
              </div>
            </div>

            {(+kcal > 0 || +protein > 0 || +fats > 0) && (
              <div className="flex flex-wrap gap-2">
                {+kcal > 0 && (
                  <span className="rounded-full border border-[#FF5C38]/30 bg-[#2A1208] px-3 py-1 text-xs font-medium text-[#FF5C38]">
                    🔥 {kcal} kcal
                  </span>
                )}
                {+protein > 0 && (
                  <span className="rounded-full border border-[#00D4FF]/30 bg-[#001E26] px-3 py-1 text-xs font-medium text-[#00D4FF]">
                    💪 {protein}g protein
                  </span>
                )}
                {+fats > 0 && (
                  <span className="rounded-full border border-[#FFB020]/30 bg-[#261A00] px-3 py-1 text-xs font-medium text-[#FFB020]">
                    🧈 {fats}g fat
                  </span>
                )}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={pending || !name.trim()}>
              {pending ? "Saving…" : editing ? "Update preset" : "Create preset"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
