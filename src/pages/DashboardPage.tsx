import { useInventory } from "@/hooks/useInventory";
import { AlertTriangle, Package, TrendingDown, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { products, lowStockProducts, loading } = useInventory();

  const totalItems = products.length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const outOfStock = products.filter((p) => p.quantity === 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Inventory overview</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Package size={20} />}
          label="Total Products"
          value={totalItems}
          color="text-blue-500"
          bg="bg-blue-500/10"
        />
        <StatCard
          icon={<IndianRupee size={20} />}
          label="Inventory Value"
          value={`₹${totalValue.toLocaleString("en-IN")}`}
          color="text-green-500"
          bg="bg-green-500/10"
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          label="Low Stock"
          value={lowStockProducts.length}
          color="text-yellow-500"
          bg="bg-yellow-500/10"
        />
        <StatCard
          icon={<TrendingDown size={20} />}
          label="Out of Stock"
          value={outOfStock}
          color="text-red-500"
          bg="bg-red-500/10"
        />
      </div>

      {/* Low stock alert list */}
      {lowStockProducts.length > 0 && (
        <section>
          <h2 className="font-semibold text-base mb-2 flex items-center gap-2">
            <AlertTriangle size={16} className="text-yellow-500" />
            Low Stock Alerts
          </h2>
          <div className="space-y-2">
            {lowStockProducts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-sm">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.barcode}</p>
                </div>
                <span
                  className={cn(
                    "text-sm font-bold",
                    p.quantity === 0 ? "text-red-500" : "text-yellow-500"
                  )}
                >
                  {p.quantity === 0 ? "Out!" : `${p.quantity} left`}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {products.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Package size={40} className="mx-auto mb-2 opacity-30" />
          <p>No products yet. Add some via the + tab.</p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  bg: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2">
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", bg, color)}>
        {icon}
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
