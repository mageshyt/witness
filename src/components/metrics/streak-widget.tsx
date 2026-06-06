import { Card, CardContent } from "@/components/ui/card";

export function StreakWidget({ streak }: { streak: number }) {
  return (
    <Card className="border-primary/30 bg-card">
      <CardContent className="flex items-center gap-6 p-6">
        <div className="text-7xl font-black tracking-tighter text-primary leading-none">{streak}</div>
        <div>
          <div className="text-lg font-bold">Day Streak</div>
          <div className="text-sm text-muted-foreground mt-1">Consecutive days with food + workout logged</div>
          {streak === 0 && (
            <div className="text-xs text-muted-foreground mt-2">Log food and a workout today to start your streak.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
