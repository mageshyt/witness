import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getFoodPresets } from "@/actions/food";
import { FoodPresetManager } from "@/components/food/food-preset-manager";

export default async function FoodPresetPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const presets = await getFoodPresets();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Food Presets</h1>
      </div>
      <FoodPresetManager initialPresets={presets} />
    </div>
  );
}
