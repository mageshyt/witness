"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function VolumeChart({ data }: { data: { name: string; reps: number }[] }) {
  if (data.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardHeader><CardTitle className="text-base">Weekly Training Volume</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-8 text-center">No workout data for this week yet.</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="border-border bg-card">
      <CardHeader><CardTitle className="text-base">Weekly Training Volume (reps)</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, left: 60, bottom: 0 }}>
            <XAxis type="number" tick={{ fontSize: 10, fill: "#8888AA" }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#8888AA" }} axisLine={false} tickLine={false} width={60} />
            <Tooltip contentStyle={{ background: "#1A1A24", border: "1px solid #2A2A3A", borderRadius: 8 }} />
            <Bar dataKey="reps" fill="#A259FF" radius={[0, 3, 3, 0]} name="Total reps" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
