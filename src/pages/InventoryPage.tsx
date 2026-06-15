import { useState } from "react";
import { useInventory } from "@/hooks/useInventory";
import { Search, Package, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export default function InventoryPage() {
  const { products, loading } = useInventory();
  const [query, setQuery] = useState("");

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.barcode.includes(query)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      <div>
        <h1 className="text-2xl font-bold">Inventory</h1>
        <p className="text-muted-foreground text-sm">{products.length} products</p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or barcode…"
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Package size={40} className="mx-auto mb-2 opacity-30" />
          <p>{query ? "No matching products" : "No products yet"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product: p }: { product: Product }) {
  const isLow = p.quantity <= 5;
  const isOut = p.quantity === 0;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{p.name}</p>
          {p.brand && (
            <p className="text-xs text-muted-foreground">{p.brand}</p>
          )}
        </div>
        {isLow && (
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium",
              isOut
                ? "bg-red-500/15 text-red-500"
                : "bg-yellow-500/15 text-yellow-600"
            )}
          >
            {isOut ? "Out" : "Low"}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 text-sm">
        <Info label="Barcode" value={p.barcode} />
        <Info label="Qty" value={String(p.quantity)} highlight={isLow} />
        <Info label="Price" value={`₹${p.price}`} />
      </div>

      {p.expiry_date && (
        <p className="text-xs text-muted-foreground">
          Exp: {new Date(p.expiry_date).toLocaleDateString("en-IN")}
        </p>
      )}
      {p.category && (
        <span className="inline-block text-xs bg-secondary text-secondary-foreground rounded px-2 py-0.5">
          {p.category}
        </span>
      )}
    </div>
  );
}

function Info({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("font-medium text-sm", highlight && "text-yellow-600")}>{value}</p>
    </div>
  );
}
