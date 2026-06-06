"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createWorkoutSession } from "@/actions/workout";
import { toast } from "sonner";

interface Props {
  dateStr: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function WorkoutForm({ dateStr, open, onOpenChange }: Props) {
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await createWorkoutSession(dateStr, label);
      toast.success("Workout session created");
      setLabel("");
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
          <DialogTitle>New workout session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label>Session label</Label>
            <Input value={label} onChange={e => setLabel(e.target.value)} required placeholder="e.g. Chest & Shoulders" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating…" : "Create session"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
