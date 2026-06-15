import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useModule } from "@/context/ModuleContext";
import { useNotification } from "@/context/NotificationContext";
import { ChevronDown, PieChart as ChartIcon, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ItemModal from "@/components/ItemModal";
import { getExpiryStatus, getDaysUntilExpiry, getStatus, formatDate, ItemStatus, InventraItem } from "@/lib/mockData";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useItems, useDeleteItem } from "@/hooks/useItems";
import AddItemDialog from "@/components/inventory/AddItemDialog";

type Item = InventraItem & {
  status: ItemStatus;
};

const Dashboard = () => {
  const { module } = useModule();

  // ── Real Supabase data ──────────────────────────────────────────────────────
  const { data: supabaseItems = [] } = useItems();
  const deleteItemMutation = useDeleteItem();

  // Map Supabase items → InventraItem shape used by existing UI (stat cards etc.)
  const inventoryItems: InventraItem[] = useMemo(() => {
    return supabaseItems.map((item) => ({
      id: item.id as unknown as number,
      name: item.name,
      category: (item as any).categories?.name ?? "General",
      quantity: item.quantity,
      unit: item.unit ?? "pcs",
      expiryDate: item.expiry_date ?? new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
    }));
  }, [supabaseItems]);

  const [addOpen, setAddOpen] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<string | number | null>(null);
  const [modalType, setModalType] = useState<"expiring" | "items" | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [openCard, setOpenCard] = useState<"expiring" | "items" | null>(null);

  const enrichedItems = useMemo(() => {
    return inventoryItems.map((item) => ({
      ...item,
      status: getStatus(item.expiryDate),
    }));
  }, [inventoryItems]);

  const totalItems = enrichedItems.length;
  const expiringCount = enrichedItems.filter((item) => item.status === "expiring").length;
  const expiredCount = enrichedItems.filter((item) => item.status === "expired").length;
  const freshCount = enrichedItems.filter((item) => item.status === "fresh").length;
  const alertCount = module === "household" ? expiringCount + expiredCount : expiringCount;
  const activeItems = enrichedItems;
  const expiringItems = activeItems.filter((item) => item.status !== "fresh");

  const categoryEmoji: Record<string, string> = {
    Dairy: "🥛", Vegetables: "🥦", Fruits: "🍎", Grains: "🌾", Oils: "🫙",
    Bakery: "🍞", Snacks: "🍪", Pulses: "🫘", "Packaged Food": "📦",
    Condiments: "🧴", "Personal Care": "🪥", General: "📋", Misc: "📦",
  };

  const getDaysLeft = (expiryDate: string) => getDaysUntilExpiry(expiryDate);
  const toggleCard = (type: "expiring" | "items") => {
    setOpenCard((prev) => (prev === type ? null : type));
  };

  const StatDropdownCard = ({
    type, color, icon, count, label, isOpen, onToggle, items, renderValue, valueClass,
  }: {
    type: "expiring" | "items"; color: "pink" | "green"; icon: string; count: number;
    label: string; isOpen: boolean; onToggle: () => void; items: Item[];
    renderValue: (item: Item) => string; valueClass: "danger" | "neutral";
  }) => (
    <div
      className={`stat-dropdown-card ${color} ${isOpen ? "shadow-lg" : "shadow-sm"}`}
      onClick={onToggle}
    >
      <div className="stat-card-top-row">
        <span className="stat-card-icon">{icon}</span>
        <div className="stat-card-count-chevron">
          <span className={`stat-count ${color === "green" ? "green-text" : ""}`}>{count}</span>
          <span className={`stat-chevron ${isOpen ? "open" : ""}`}>▾</span>
        </div>
      </div>
      <div className={`stat-big-number ${color === "green" ? "green-text" : ""}`}>{count}</div>
      <div className={`stat-label ${color === "green" ? "green-text" : ""}`}>{label}</div>
      <div className={`stat-dropdown-list ${isOpen ? "open" : ""}`}>
        <div className="stat-dropdown-divider" />
        {items.map((item) => (
          <div key={item.id} className="stat-dropdown-row">
            <div className="stat-row-left">
              <span className="stat-row-emoji">{categoryEmoji[item.category] ?? "📋"}</span>
              <span className="stat-row-name">{item.name}</span>
            </div>
            <span className={`stat-row-value ${valueClass === "neutral" ? "neutral" : ""}`}>
              {renderValue(item)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const handleCloseModal = () => {
    setIsItemModalOpen(false);
    setModalType(null);
  };

  const chartData = [
    { name: "Expiring Soon", value: expiringCount, color: "#f59e0b" },
    { name: "Fresh Stock", value: freshCount, color: "#22c55e" },
    { name: "Expired", value: expiredCount, color: "#ef4444" },
  ];

  const { setActiveItems } = useNotification();
  useEffect(() => {
    setActiveItems(inventoryItems);
  }, [inventoryItems, setActiveItems]);

  const handleDelete = (displayId: number | string) => {
    const idx = inventoryItems.findIndex((i) => i.id === displayId);
    if (idx !== -1) {
      deleteItemMutation.mutate(supabaseItems[idx].id);
    }
  };

  const renderItemCard = (item: Item) => {
    const isExpanded = expandedItemId === item.id;
    const expiryStatus = getExpiryStatus(item.expiryDate);
    const rowClasses =
      item.status === "expired"
        ? "border border-[#fecaca] bg-[#fef2f2]"
        : item.status === "expiring"
        ? "border border-[#fcd34d]/40 bg-[#fffbeb]"
        : "border border-slate-200 bg-white";

    return (
      <Card key={item.id} className={`overflow-hidden rounded-[1.75rem] shadow-sm ${rowClasses}`}>
        <CardContent className="p-4">
          <button
            type="button"
            onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
            className="flex w-full flex-col gap-3 text-left"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-lg font-semibold text-[#1a3d2e]">{item.name}</p>
                <p className="mt-1 text-sm text-slate-500">{item.category}</p>
                <p className="mt-1 text-sm text-slate-500">Expires {formatDate(item.expiryDate)}</p>
              </div>
              <div className="flex items-center gap-2">
                {item.status === "expiring" && (
                  <span className="inline-flex h-8 items-center rounded-full bg-[#fef3c7] px-3 text-xs font-semibold text-[#b45309]">EXPIRING SOON</span>
                )}
                {item.status === "expired" && (
                  <span className="inline-flex h-8 items-center rounded-full bg-[#fee2e2] px-3 text-xs font-semibold text-[#b91c1c]">EXPIRED</span>
                )}
                <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </div>
            </div>
          </button>
          {isExpanded && (
            <div className="mt-4 rounded-3xl bg-[#f7faf7] p-4 text-sm text-slate-600">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-900">Status:</span>
                <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${expiryStatus.color}`}>
                  {expiryStatus.label}
                </span>
              </div>
              <p className="mb-2">Category: <span className="font-semibold text-slate-900">{item.category}</span></p>
              <p className="mb-2">Quantity: <span className="font-semibold text-slate-900">{item.quantity} {item.unit}</span></p>
              <p className="mb-4">Expiry Date: <span className="font-semibold text-slate-900">{formatDate(item.expiryDate)}</span></p>
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl bg-[#fee2e2] px-4 py-2 text-sm font-semibold text-[#b91c1c] hover:bg-[#fecaca] transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Delete "${item.name}"? This cannot be undone.`)) {
                    handleDelete(item.id);
                  }
                }}
              >
                <Trash2 size={14} />
                Delete Item
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const homeScreen = (
    <div className="space-y-4 px-4 pb-20 pt-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-[#1a3d2e]">Home</h2>
        <p className="mt-1 text-sm text-slate-500">Household pantry at a glance.</p>
      </div>
      <div className="flex gap-3">
        <StatDropdownCard
          type="expiring" color="pink" icon="🕐" count={alertCount}
          label="Expiring / Expired" isOpen={openCard === "expiring"}
          onToggle={() => toggleCard("expiring")} items={expiringItems}
          renderValue={(item) => {
            const days = getDaysLeft(item.expiryDate);
            if (days <= 0) return "EXPIRED";
            if (days === 1) return "Tomorrow";
            if (days === 2) return "2d left";
            return `${days}d left`;
          }}
          valueClass="danger"
        />
        <StatDropdownCard
          type="items" color="green" icon="📦" count={totalItems}
          label="Items" isOpen={openCard === "items"}
          onToggle={() => toggleCard("items")} items={activeItems}
          renderValue={(item) => `${item.quantity} ${item.unit}`}
          valueClass="neutral"
        />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Inventory</p>
          <h2 className="text-2xl font-bold text-[#1a3d2e]">All Items</h2>
        </div>
        <Button
          size="sm"
          className="inline-flex items-center gap-2 rounded-full bg-[#1a3d2e] px-4 py-2 text-white hover:bg-[#16362a]"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
      <div className="space-y-3">{enrichedItems.map(renderItemCard)}</div>
    </div>
  );

  const retailScreen = (
    <div className="space-y-4 px-4 pb-20 pt-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-[#1a3d2e]">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500">Retail inventory performance summary.</p>
      </div>
      <div className="flex gap-3">
        <StatDropdownCard
          type="expiring" color="pink" icon="🕐" count={expiringCount}
          label="Expiring Soon" isOpen={openCard === "expiring"}
          onToggle={() => toggleCard("expiring")} items={expiringItems}
          renderValue={(item) => {
            const days = getDaysLeft(item.expiryDate);
            if (days <= 0) return "EXPIRED";
            if (days === 1) return "Tomorrow";
            if (days === 2) return "2d left";
            return `${days}d left`;
          }}
          valueClass="danger"
        />
        <StatDropdownCard
          type="items" color="green" icon="📦" count={totalItems}
          label="Items" isOpen={openCard === "items"}
          onToggle={() => toggleCard("items")} items={activeItems}
          renderValue={(item) => `${item.quantity} ${item.unit}`}
          valueClass="neutral"
        />
      </div>
      <Card className="rounded-[2rem] border-none bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between pb-4">
          <div>
            <h3 className="text-lg font-semibold text-[#1a3d2e]">Stock Overview</h3>
            <p className="text-sm text-slate-500">Track the latest expiry and stock distribution.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f0f4f0] px-3 py-2 text-sm font-semibold text-[#1a3d2e]">
            <ChartIcon className="h-4 w-4" /> Overview
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-[1.75rem] bg-[#0f172a] p-4 text-white shadow-xl shadow-slate-900/10">
            <ResponsiveContainer width="100%" height={200}>
              <RechartsPieChart>
                <Pie data={chartData} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={2} stroke="none">
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center text-xs uppercase tracking-[0.3em] text-slate-400">Stock</div>
          </div>
          <div className="grid gap-3">
            {[
              { label: "Expiring Soon", color: "#ef4444", bg: "#fbe7e7", count: expiringCount },
              { label: "Fresh Stock", color: "#10b981", bg: "#def7ec", count: freshCount },
              { label: "Expired", color: "#f59e0b", bg: "#fdf5e5", count: expiredCount },
            ].map(({ label, color, bg, count }) => (
              <div key={label} className="rounded-[1.75rem] border border-[#e5e7eb] bg-[#fafafa] p-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <p className="font-semibold text-slate-900">{label}</p>
                </div>
                <p className="mt-2 text-sm text-slate-500">{totalItems > 0 ? `${Math.round((count / totalItems) * 100)}%` : "0%"}</p>
                <div className="mt-3 h-2 rounded-full" style={{ backgroundColor: bg }}>
                  <div className="h-full rounded-full" style={{ width: `${totalItems > 0 ? (count / totalItems) * 100 : 0}%`, backgroundColor: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Inventory</p>
          <h2 className="text-2xl font-bold text-[#1a3d2e]">All Items</h2>
        </div>
        <Button
          size="sm"
          className="inline-flex items-center gap-2 rounded-full bg-[#1a3d2e] px-4 py-2 text-white hover:bg-[#16362a]"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
      <div className="space-y-3">{enrichedItems.map(renderItemCard)}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0f4f0] pb-28 text-[#1a3d2e]">
      <div className="mx-auto max-w-[390px]">
        {module === "retail" ? retailScreen : homeScreen}

        {/* AddItemDialog — real Supabase-backed dialog with scanner */}
        <AddItemDialog open={addOpen} onOpenChange={setAddOpen} />

        <ItemModal
          isOpen={isItemModalOpen}
          type={modalType}
          items={activeItems}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
};

export default Dashboard;
