import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  accent: "calories" | "protein" | "workout" | "weight";
  progress?: number; // 0-100
}

const accentMap = {
  calories: { bar: "bg-[#FF5C38]", top: "border-t-[#FF5C38]", text: "text-[#FF5C38]" },
  protein:  { bar: "bg-[#00D4FF]", top: "border-t-[#00D4FF]", text: "text-[#00D4FF]" },
  workout:  { bar: "bg-[#A259FF]", top: "border-t-[#A259FF]", text: "text-[#A259FF]" },
  weight:   { bar: "bg-[#FFB020]", top: "border-t-[#FFB020]", text: "text-[#FFB020]" },
};

export function StatCard({ icon, label, value, sub, accent, progress }: StatCardProps) {
  const colors = accentMap[accent];
  return (
    <Card className={cn("border-border bg-card border-t-2", colors.top)}>
      <CardContent className="p-4">
        <div className="mb-3 text-xl">{icon}</div>
        <div className={cn("text-3xl font-extrabold tracking-tight", colors.text)}>{value}</div>
        <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
        {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
        {progress !== undefined && (
          <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div className={cn("h-full rounded-full", colors.bar)} style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
