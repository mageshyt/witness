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
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit food" : "Log food"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          {!initial && (
            <div className="space-y-1">
              <Label>Search food</Label>
              <FoodSearch onSelect={handleSearchSelect} />
            </div>
          )}
          <div className="space-y-1">
            <Label>Food name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Chicken breast" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label>Qty (g)</Label>
              <Input type="number" value={qty} onChange={e => handleQtyChange(e.target.value)} required min={0} />
            </div>
            <div className="space-y-1">
              <Label>Calories</Label>
              <Input type="number" value={kcal} onChange={e => setKcal(e.target.value)} required min={0} />
            </div>
            <div className="space-y-1">
              <Label>Protein (g)</Label>
              <Input type="number" value={protein} onChange={e => setProtein(e.target.value)} required min={0} />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving…" : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
