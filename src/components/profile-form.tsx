"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { upsertProfile } from "@/actions/profile";
import { toast } from "sonner";
import type { UserProfile } from "@prisma/client";

export function ProfileForm({ profile }: { profile: UserProfile | null }) {
  const [sex, setSex]           = useState(profile?.sex ?? "");
  const [height, setHeight]     = useState(profile?.heightCm?.toString() ?? "");
  const [weight, setWeight]     = useState(profile?.baseWeightKg?.toString() ?? "");
  const [calories, setCalories] = useState(profile?.calorieTarget?.toString() ?? "");
  const [protein, setProtein]   = useState(profile?.proteinTarget?.toString() ?? "");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await upsertProfile({
        sex,
        heightCm: +height,
        baseWeightKg: +weight,
        calorieTarget: +calories,
        proteinTarget: +protein,
      });
      toast.success("Profile saved");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-xl border border-border p-5">
        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
          <div className="space-y-2">
            <Label>Sex</Label>
            <Select value={sex} onValueChange={(val) => setSex(val ?? "")}>
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Height (cm)</Label>
            <Input type="text" inputMode="decimal" value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 175" />
          </div>
          <div className="space-y-2">
            <Label>Base weight (kg)</Label>
            <Input type="text" inputMode="decimal" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 75.5" />
          </div>
          <div className="space-y-2">
            <Label>Daily calorie target</Label>
            <Input type="text" inputMode="numeric" value={calories} onChange={e => setCalories(e.target.value)} placeholder="e.g. 2500" />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Daily protein target (g)</Label>
            <Input type="text" inputMode="numeric" value={protein} onChange={e => setProtein(e.target.value)} placeholder="e.g. 180" />
          </div>
        </div>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
