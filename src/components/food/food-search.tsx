"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface FoodResult {
  name: string;
  kcalPer100g: number;
  proteinPer100g: number;
  fatsPer100g: number;
}

interface Props {
  onSelect: (result: FoodResult) => void;
}

export function FoodSearch({ onSelect }: Props) {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState<FoodResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen]       = useState(false);
  const timerRef              = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    clearTimeout(timerRef.current);
    if (query.length < 3) { setResults([]); setOpen(false); return; }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/food-search?q=${encodeURIComponent(query)}`);
        const data: FoodResult[] = await res.json();
        setResults(data);
        setOpen(data.length > 0);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  return (
    <div className="relative">
      <Input
        placeholder="Search food (e.g. chicken breast)…"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      {loading && <Skeleton className="mt-1 h-8 w-full" />}
      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-md border border-border bg-card shadow-lg">
          {results.map((r, i) => (
            <li
              key={i}
              className="flex cursor-pointer items-center justify-between px-3 py-2 text-sm hover:bg-muted"
              onClick={() => { onSelect(r); setOpen(false); setQuery(""); }}>
              <span>{r.name}</span>
              <span className="text-xs text-muted-foreground">{Math.round(r.kcalPer100g)} kcal/100g</span>
            </li>
          ))}
          <li
            className="cursor-pointer px-3 py-2 text-xs text-muted-foreground hover:bg-muted"
            onClick={() => setOpen(false)}>
            Enter manually instead →
          </li>
        </ul>
      )}
    </div>
  );
}
