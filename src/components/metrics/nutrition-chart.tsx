"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  data: { date: string; calories: number; protein: number }[];
  calorieTarget?: number | null;
  proteinTarget?: number | null;
}

export function NutritionChart({ data, calorieTarget, proteinTarget }: Props) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-base">Weekly Nutrition</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#8888AA" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#8888AA" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#1A1A24", border: "1px solid #2A2A3A", borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="calories" fill="#FF5C38" radius={[3, 3, 0, 0]} name="Calories (kcal)" />
            <Bar dataKey="protein"  fill="#00D4FF" radius={[3, 3, 0, 0]} name="Protein (g)" />
            {calorieTarget && <ReferenceLine y={calorieTarget} stroke="#FF5C38" strokeDasharray="4 2" />}
            {proteinTarget  && <ReferenceLine y={proteinTarget}  stroke="#00D4FF" strokeDasharray="4 2" />}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
