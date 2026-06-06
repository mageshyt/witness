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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Sex</Label>
          <Select value={sex} onValueChange={(val) => setSex(val ?? "")}>
            <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Height (cm)</Label>
          <Input type="number" value={height} onChange={e => setHeight(e.target.value)} min={100} max={250} />
        </div>
        <div className="space-y-1">
          <Label>Base weight (kg)</Label>
          <Input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} min={20} max={300} />
        </div>
        <div className="space-y-1">
          <Label>Daily calorie target</Label>
          <Input type="number" value={calories} onChange={e => setCalories(e.target.value)} min={0} />
        </div>
        <div className="col-span-2 space-y-1">
          <Label>Daily protein target (g)</Label>
          <Input type="number" value={protein} onChange={e => setProtein(e.target.value)} min={0} />
        </div>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
