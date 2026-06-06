"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function WeightChart({ data }: { data: { date: string; weight: number }[] }) {
  if (data.length < 2) {
    return (
      <Card className="border-border bg-card">
        <CardHeader><CardTitle className="text-base">Body Weight Trend</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-8 text-center">Log at least 2 weight entries to see your trend.</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="border-border bg-card">
      <CardHeader><CardTitle className="text-base">Body Weight Trend</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#8888AA" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#8888AA" }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{ background: "#1A1A24", border: "1px solid #2A2A3A", borderRadius: 8, color: "#F0F0FF" }}
              cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }}
            />
            <Line type="monotone" dataKey="weight" stroke="#FFB020" strokeWidth={2} dot={{ fill: "#FFB020", r: 3 }} name="Weight (kg)" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
