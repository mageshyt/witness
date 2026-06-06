"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FoodForm } from "./food-form";
import { deleteFoodEntry } from "@/actions/food";
import { toast } from "sonner";
import {
  Camera, Pencil, Trash2,
  Utensils, Beef, Fish, Egg, Milk, Apple, Wheat,
  Coffee, Cookie, Salad, Soup, Sandwich, Pizza, Banana,
  Droplets, FlameKindling, Nut,
  type LucideIcon,
} from "lucide-react";
import type { FoodEntry } from "@prisma/client";

interface Props {
  dateStr: string;
  entries: FoodEntry[];
}

function getFoodIcon(name: string): LucideIcon {
  const n = name.toLowerCase();

  if (/chicken|turkey|beef|pork|lamb|steak|meat|mince|bacon|sausage|ham|veal|bison/.test(n)) return Beef;
  if (/fish|salmon|tuna|cod|tilapia|shrimp|prawn|seafood|crab|lobster|sardine|mackerel/.test(n)) return Fish;
  if (/egg/.test(n)) return Egg;
  if (/milk|yogurt|cheese|whey|dairy|cream|butter|cottage/.test(n)) return Milk;
  if (/apple|orange|mango|berry|fruit|grape|pear|peach|melon|kiwi|pineapple|strawberry/.test(n)) return Apple;
  if (/banana/.test(n)) return Banana;
  if (/rice|bread|pasta|oat|wheat|grain|cereal|flour|noodle|roti|tortilla|bagel|cracker/.test(n)) return Wheat;
  if (/coffee|tea|espresso|latte/.test(n)) return Coffee;
  if (/cookie|cake|chocolate|candy|dessert|sweet|biscuit|donut|muffin|brownie/.test(n)) return Cookie;
  if (/salad|spinach|kale|lettuce|broccoli|vegetable|veggie|cucumber|tomato|carrot|avocado/.test(n)) return Salad;
  if (/soup|stew|broth|chowder/.test(n)) return Soup;
  if (/sandwich|burger|wrap|sub/.test(n)) return Sandwich;
  if (/pizza/.test(n)) return Pizza;
  if (/nut|almond|peanut|cashew|walnut|pistachio/.test(n)) return Nut;
  if (/oil|water|juice|drink|soda|smoothie|shake/.test(n)) return Droplets;
  if (/protein|supplement|powder|bar/.test(n)) return FlameKindling;

  return Utensils;
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
        {entries.map(e => {
          const Icon = getFoodIcon(e.name);
          return (
            <div
              key={e.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
            >
              {/* Food icon box */}
              <div
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded"
                style={{ background: "#2A1208" }}
              >
                <Icon size={16} className="text-[#FF5C38]" />
              </div>

              {/* Name + quantity */}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">{e.name}</div>
                <div className="text-xs text-muted-foreground">{e.quantityG}g</div>
              </div>

              {/* Macro pills — mono font */}
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                  style={{
                    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                    background: "#2A1208",
                    color: "#FF5C38",
                  }}
                >
                  {Math.round(e.calories)} kcal
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                  style={{
                    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                    background: "#001E26",
                    color: "#00D4FF",
                  }}
                >
                  {Math.round(e.proteinG)}g pro
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => toast.info("Photo upload coming soon")}
                >
                  <Camera size={14} />
                </button>
                <button
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => openEdit(e)}
                >
                  <Pencil size={14} />
                </button>
                <button
                  className="text-muted-foreground transition-colors hover:text-destructive"
                  onClick={() => handleDelete(e.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
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
