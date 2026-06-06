import { NextRequest, NextResponse } from "next/server";

interface OFFProduct {
  product_name?: string;
  nutriments?: {
    "energy-kcal_100g"?: number;
    proteins_100g?: number;
  };
}

interface OFFResponse {
  products: OFFProduct[];
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q || q.length < 3) return NextResponse.json([]);

  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=5&fields=product_name,nutriments`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    const data: OFFResponse = await res.json();

    const results = (data.products ?? [])
      .filter(p => p.product_name && p.nutriments?.["energy-kcal_100g"] != null)
      .map(p => ({
        name: p.product_name!,
        kcalPer100g: p.nutriments!["energy-kcal_100g"]!,
        proteinPer100g: p.nutriments!.proteins_100g ?? 0,
      }));

    return NextResponse.json(results);
  } catch {
    return NextResponse.json([]);
  }
}
