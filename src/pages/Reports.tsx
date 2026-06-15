import { useMemo } from "react";
import { BarChart3, PieChart, TrendingUp, DollarSign, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useItems } from "@/hooks/useItems";
import { useTransactions } from "@/hooks/useTransactions";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, PieChart as RPieChart, Pie, Cell } from "recharts";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

const Reports = () => {
  const { data: items, isLoading } = useItems();
  const { data: transactions } = useTransactions(100);

  const stats = useMemo(() => {
    if (!items?.length) return null;

    const totalItems = items.length;
    const totalValue = items.reduce((sum, i) => sum + (Number(i.sell_price) || 0) * i.quantity, 0);
    const lowStock = items.filter((i) => i.quantity > 0 && i.quantity <= i.min_quantity).length;
    const outOfStock = items.filter((i) => i.quantity === 0).length;

    // Category breakdown
    const catMap = new Map<string, { count: number; value: number }>();
    items.forEach((item) => {
      const catName = (item as any).categories?.name || "Uncategorized";
      const existing = catMap.get(catName) || { count: 0, value: 0 };
      existing.count += 1;
      existing.value += (Number(item.sell_price) || 0) * item.quantity;
      catMap.set(catName, existing);
    });
    const categoryData = Array.from(catMap.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      value: Math.round(data.value * 100) / 100,
    }));

    // Stock status distribution
    const stockData = [
      { name: "In Stock", value: totalItems - lowStock - outOfStock, fill: "hsl(var(--success))" },
      { name: "Low Stock", value: lowStock, fill: "hsl(var(--warning))" },
      { name: "Out of Stock", value: outOfStock, fill: "hsl(var(--destructive))" },
    ].filter((d) => d.value > 0);

    // Top items by quantity
    const topItems = [...items]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8)
      .map((i) => ({ name: i.name.length > 12 ? i.name.slice(0, 12) + "…" : i.name, quantity: i.quantity }));

    // Transaction activity (last 7 days)
    const activityMap = new Map<string, { inQty: number; outQty: number }>();
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en", { weekday: "short" });
      activityMap.set(key, { inQty: 0, outQty: 0 });
    }
    transactions?.forEach((t) => {
      const d = new Date(t.created_at);
      const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
      if (diff < 7) {
        const key = d.toLocaleDateString("en", { weekday: "short" });
        const existing = activityMap.get(key);
        if (existing) {
          if (t.type === "in") existing.inQty += t.quantity;
          else if (t.type === "out") existing.outQty += t.quantity;
        }
      }
    });
    const activityData = Array.from(activityMap.entries()).map(([day, data]) => ({
      day,
      in: data.inQty,
      out: data.outQty,
    }));

    return { totalItems, totalValue, lowStock, outOfStock, categoryData, stockData, topItems, activityData };
  }, [items, transactions]);

  const categoryConfig: ChartConfig = {
    count: { label: "Items", color: "hsl(var(--primary))" },
  };

  const topItemsConfig: ChartConfig = {
    quantity: { label: "Quantity", color: "hsl(var(--primary))" },
  };

  const activityConfig: ChartConfig = {
    in: { label: "Stock In", color: "hsl(var(--success))" },
    out: { label: "Stock Out", color: "hsl(var(--destructive))" },
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-4 p-4">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-base font-semibold mb-1">No reports yet</h3>
            <p className="text-sm text-muted-foreground">Reports will be generated once you have inventory data.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-xl p-2.5 text-primary bg-primary/10">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalItems}</p>
              <p className="text-xs text-muted-foreground">Total Items</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-xl p-2.5 text-success bg-success/10">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Value</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-xl p-2.5 text-warning bg-warning/10">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.lowStock}</p>
              <p className="text-xs text-muted-foreground">Low Stock</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-xl p-2.5 text-destructive bg-destructive/10">
              <PieChart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.outOfStock}</p>
              <p className="text-xs text-muted-foreground">Out of Stock</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Status Pie Chart */}
      {stats.stockData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Stock Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[200px] w-full">
              <RPieChart>
                <Pie data={stats.stockData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
                  {stats.stockData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </RPieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Top Items Bar Chart */}
      {stats.topItems.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Top Items by Quantity</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={topItemsConfig} className="h-[220px] w-full">
              <BarChart data={stats.topItems} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="quantity" fill="var(--color-quantity)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Category Breakdown */}
      {stats.categoryData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Items by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={categoryConfig} className="h-[200px] w-full">
              <BarChart data={stats.categoryData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {stats.categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Activity Chart */}
      {stats.activityData.some((d) => d.in > 0 || d.out > 0) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">7-Day Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={activityConfig} className="h-[200px] w-full">
              <BarChart data={stats.activityData}>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="in" fill="var(--color-in)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="out" fill="var(--color-out)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Reports;
