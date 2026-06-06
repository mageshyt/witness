import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function MaxWeightList({ items }: { items: { name: string; maxWeight: number }[] }) {
  return (
    <Card className="border-border bg-card">
      <CardHeader><CardTitle className="text-base">Personal Records</CardTitle></CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Log sets with weight to see your PRs.</p>
        ) : (
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.name} className="flex items-center justify-between border-b border-border py-2">
                <span className="text-sm">{item.name}</span>
                <Badge variant="outline" className="text-[#A259FF] border-[#A259FF]/30 bg-[#160D26]">
                  {item.maxWeight} kg
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
