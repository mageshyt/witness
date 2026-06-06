"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { upsertBodyWeight } from "@/actions/weight";
import { toast } from "sonner";

interface Props {
  dateStr: string;
  current?: number;
}

export function WeightDialog({ dateStr, current }: Props) {
  const [open, setOpen]       = useState(false);
  const [weight, setWeight]   = useState(current?.toString() ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setWeight(current?.toString() ?? "");
  }, [open, current]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await upsertBodyWeight(dateStr, +weight);
      toast.success("Weight logged");
      setOpen(false);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline" className="border-[#FFB020]/30 text-[#FFB020]" />
        }
      >
        {current ? `${current} kg` : "+ Log Weight"}
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>Log body weight</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label>Weight (kg)</Label>
            <Input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} required min={20} max={300} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving…" : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
