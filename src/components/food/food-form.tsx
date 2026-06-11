"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { addFoodEntry, updateFoodEntry } from "@/actions/food";

type FoodPreset = { id: string; name: string; calories: number; proteinG: number; fatsG: number };

interface FoodFormProps {
  dateStr: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: { id: string; name: string; calories: number; proteinG: number; fatsG: number };
  foodPresets?: FoodPreset[];
}

function fuzzyMatch(text: string, query: string): boolean {
  if (!query) return false;
  const t = text.toLowerCase(), q = query.toLowerCase();
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

export function FoodForm({ dateStr, open, onOpenChange, initial, foodPresets }: FoodFormProps) {
  const [name, setName]             = useState(initial?.name ?? "");
  const [kcal, setKcal]             = useState(initial?.calories?.toString() ?? "");
  const [protein, setProtein]       = useState(initial?.proteinG?.toString() ?? "");
  const [fats, setFats]             = useState(initial?.fatsG?.toString() ?? "");
  const [loading, setLoading]       = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setKcal(initial?.calories?.toString() ?? "");
      setProtein(initial?.proteinG?.toString() ?? "");
      setFats(initial?.fatsG?.toString() ?? "");
      setShowSuggestions(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const suggestions = showSuggestions
    ? (foodPresets ?? []).filter(p => fuzzyMatch(p.name, name))
    : [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const data = { name, calories: +kcal, proteinG: +protein, fatsG: +fats };
    try {
      if (initial) { await updateFoodEntry(initial.id, data); }
      else         { await addFoodEntry(dateStr, data); }
      toast.success(initial ? "Entry updated" : "Food logged");
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg font-semibold">
            {initial ? "Edit food entry" : "Log food"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Food name */}
          <div className="space-y-2">
            <Label htmlFor="food-name" className="text-sm font-medium">Food name</Label>
            <Input
              id="food-name"
              value={name}
              onChange={e => { setName(e.target.value); setShowSuggestions(true); }}
              required
              placeholder="Search Food"
            />
          </div>

          {/* Preset suggestions */}
          {suggestions.length > 0 && (
            <ul className="max-h-44 overflow-y-auto rounded-md border border-border bg-card divide-y divide-border -mt-2">
              {suggestions.map(p => (
                <li key={p.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-3 py-2.5 text-sm hover:bg-muted active:bg-muted text-left"
                    onClick={() => {
                      setName(p.name);
                      setKcal(p.calories.toString());
                      setProtein(p.proteinG.toString());
                      setFats(p.fatsG.toString());
                      setShowSuggestions(false);
                    }}
                  >
                    <span className="font-medium">{p.name}</span>
                    <div className="flex gap-2 text-[11px] shrink-0 ml-2">
                      <span style={{ color: "#FF5C38" }}>{Math.round(p.calories)} kcal</span>
                      <span style={{ color: "#00D4FF" }}>{Math.round(p.proteinG)}g pro</span>
                      <span style={{ color: "#FFB020" }}>{Math.round(p.fatsG)}g fat</span>
                    </div>
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => setShowSuggestions(false)}
                  className="w-full px-3 py-2 text-xs text-muted-foreground hover:bg-muted text-left"
                >
                  Enter manually →
                </button>
              </li>
            </ul>
          )}

          {/* Macros row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="food-kcal" className="text-sm font-medium">Calories</Label>
              <div className="relative">
                <Input
                  id="food-kcal"
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
              <Label htmlFor="food-protein" className="text-sm font-medium">Protein</Label>
              <div className="relative">
                <Input
                  id="food-protein"
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
              <Label htmlFor="food-fats" className="text-sm font-medium">Fats</Label>
              <div className="relative">
                <Input
                  id="food-fats"
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

          {/* Macro preview badges — only when value > 0 */}
          {(+kcal > 0 || +protein > 0 || +fats > 0) && (
            <div className="flex gap-2 flex-wrap">
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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving…" : initial ? "Update entry" : "Log food"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
