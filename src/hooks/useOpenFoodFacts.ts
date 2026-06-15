import { useState } from "react";

export interface OFFResult {
  barcode: string;
  name: string;
  brand: string;
  category: string;
  found: boolean;
}

export function useOpenFoodFacts() {
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchByBarcode = async (barcode: string): Promise<OFFResult> => {
    setFetching(true);
    setFetchError(null);

    const empty: OFFResult = { barcode, name: "", brand: "", category: "", found: false };

    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(barcode)}.json`,
        { signal: AbortSignal.timeout(8000) }
      );
      if (!res.ok) return empty;

      const data = await res.json();
      if (data?.status !== 1 || !data?.product) return empty;

      const p = data.product;
      // Strip "en:" prefix from category tags
      const category = (p.categories_tags?.[0] ?? p.categories ?? "")
        .replace(/^en:/, "")
        .replace(/-/g, " ");

      return {
        barcode,
        name: p.product_name ?? p.product_name_en ?? "",
        brand: p.brands ?? "",
        category,
        found: true,
      };
    } catch {
      setFetchError("Could not reach OpenFoodFacts. Fill details manually.");
      return empty;
    } finally {
      setFetching(false);
    }
  };

  return { fetchByBarcode, fetching, fetchError };
}
