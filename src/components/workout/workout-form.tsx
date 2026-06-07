"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createWorkoutSession } from "@/actions/workout";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { QUICK_LABELS } from "@/lib/workout-constants";

interface Props {
  dateStr: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function WorkoutForm({ dateStr, open, onOpenChange }: Props) {
  const [label, setLabel]     = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    setLoading(true);
    try {
      await createWorkoutSession(dateStr, label.trim());
      toast.success("Workout session created");
      setLabel("");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleClose(v: boolean) {
    if (!v) setLabel("");
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg font-semibold">New workout session</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Name this session, then add exercises inside it.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Quick-select chips */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Quick select</Label>
            <div className="flex flex-wrap gap-2">
              {QUICK_LABELS.map(q => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setLabel(q)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    label === q
                      ? "border-[#A259FF]/60 bg-[#160D26] text-[#A259FF]"
                      : "border-border text-muted-foreground hover:border-[#A259FF]/40 hover:text-foreground"
                  )}>
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">or type a custom name</span>
            </div>
          </div>

          {/* Custom label input */}
          <div className="space-y-2">
            <Label htmlFor="session-label" className="text-sm font-medium">Session name</Label>
            <Input
              id="session-label"
              value={label}
              onChange={e => setLabel(e.target.value)}
              required
              placeholder="e.g. Chest & Shoulders"
              className="h-11"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => handleClose(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading || !label.trim()}>
              {loading ? "Creating…" : "Create session"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
