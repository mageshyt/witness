"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { addFoodEntry, updateFoodEntry } from "@/actions/food";
import { FoodSearch } from "./food-search";

interface FoodFormProps {
  dateStr: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: { id: string; name: string; quantityG: number; calories: number; proteinG: number };
}

export function FoodForm({ dateStr, open, onOpenChange, initial }: FoodFormProps) {
  const [name, setName]                   = useState(initial?.name ?? "");
  const [qty, setQty]                     = useState(initial?.quantityG?.toString() ?? "");
  const [kcal, setKcal]                   = useState(initial?.calories?.toString() ?? "");
  const [protein, setProtein]             = useState(initial?.proteinG?.toString() ?? "");
  const [loading, setLoading]             = useState(false);
  const [kcalPer100g, setKcalPer100g]     = useState<number | null>(null);
  const [proteinPer100g, setProteinPer100g] = useState<number | null>(null);

  function handleSearchSelect(result: { name: string; kcalPer100g: number; proteinPer100g: number }) {
    setName(result.name);
    setKcalPer100g(result.kcalPer100g);
    setProteinPer100g(result.proteinPer100g);
    if (qty) {
      setKcal(String(Math.round((result.kcalPer100g / 100) * +qty)));
      setProtein(String(Math.round((result.proteinPer100g / 100) * +qty)));
    }
  }

  function handleQtyChange(val: string) {
    setQty(val);
    if (kcalPer100g !== null && val) {
      setKcal(String(Math.round((kcalPer100g / 100) * +val)));
      setProtein(String(Math.round((proteinPer100g! / 100) * +val)));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const data = { name, quantityG: +qty, calories: +kcal, proteinG: +protein };
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
          {!initial && (
            <p className="text-sm text-muted-foreground">
              Search for a food or fill in the details manually.
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Search — only in add mode */}
          {!initial && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Search food</Label>
              <FoodSearch onSelect={handleSearchSelect} />
            </div>
          )}

          {/* Divider between search and manual fields */}
          {!initial && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">or enter manually</span>
              </div>
            </div>
          )}

          {/* Food name */}
          <div className="space-y-2">
            <Label htmlFor="food-name" className="text-sm font-medium">Food name</Label>
            <Input
              id="food-name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="e.g. Chicken breast"
            />
          </div>

          {/* Macros row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="food-qty" className="text-sm font-medium">Quantity</Label>
              <div className="relative">
                <Input
                  id="food-qty"
                  type="number"
                  value={qty}
                  onChange={e => handleQtyChange(e.target.value)}
                  required
                  min={0}
                  placeholder="200"
                  className="pr-7"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">g</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="food-kcal" className="text-sm font-medium">Calories</Label>
              <div className="relative">
                <Input
                  id="food-kcal"
                  type="number"
                  value={kcal}
                  onChange={e => setKcal(e.target.value)}
                  required
                  min={0}
                  placeholder="330"
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
                  type="number"
                  value={protein}
                  onChange={e => setProtein(e.target.value)}
                  required
                  min={0}
                  placeholder="62"
                  className="pr-6"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">g</span>
              </div>
            </div>
          </div>

          {/* Macro preview badges */}
          {(kcal || protein) && (
            <div className="flex gap-2">
              {kcal && (
                <span className="rounded-full border border-[#FF5C38]/30 bg-[#2A1208] px-3 py-1 text-xs font-medium text-[#FF5C38]">
                  🔥 {kcal} kcal
                </span>
              )}
              {protein && (
                <span className="rounded-full border border-[#00D4FF]/30 bg-[#001E26] px-3 py-1 text-xs font-medium text-[#00D4FF]">
                  💪 {protein}g protein
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
