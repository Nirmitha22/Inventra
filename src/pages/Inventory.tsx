import { useState } from "react";
import { Package, Search, Plus, Trash2, Edit, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useItems, useDeleteItem } from "@/hooks/useItems";
import { useToast } from "@/hooks/use-toast";
import AddItemDialog from "@/components/inventory/AddItemDialog";
import EditItemDialog from "@/components/inventory/EditItemDialog";
import ItemImage from "@/components/inventory/ItemImage";

const formatExpiryDate = (expiry?: string | null) => {
  if (!expiry) return "Not set";
  const date = new Date(expiry);
  if (Number.isNaN(date.getTime())) return expiry;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const Inventory = () => {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const { data: items, isLoading } = useItems();
  const deleteItem = useDeleteItem();
  const { toast } = useToast();

  const filtered = items?.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.sku?.toLowerCase().includes(search.toLowerCase()) ||
    item.barcode?.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteItem.mutateAsync(id);
      toast({ title: "Deleted", description: `${name} removed from inventory.` });
    } catch {
      toast({ title: "Error", description: "Failed to delete item.", variant: "destructive" });
    }
  };

  const getStockBadge = (qty: number, min: number) => {
    if (qty === 0) return <Badge variant="destructive">Out of stock</Badge>;
    if (qty <= min) return <Badge className="bg-warning text-warning-foreground">Low stock</Badge>;
    return <Badge className="bg-success text-success-foreground">In stock</Badge>;
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            className="pl-9 h-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => setAddOpen(true)} className="h-11 shrink-0">
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-base font-semibold mb-1">
              {search ? "No matches found" : "No items yet"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {search ? "Try a different search term" : "Add your first inventory item to get started"}
            </p>
            {!search && (
              <Button onClick={() => setAddOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const isOpen = openItemId === item.id;
            return (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div
                    role="button"
                    tabIndex={0}
                    className="group w-full text-left"
                    onClick={() => setOpenItemId(isOpen ? null : item.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setOpenItemId(isOpen ? null : item.id);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0 flex gap-3">
                        {item.image_url && (
                          <ItemImage imageRef={item.image_url} alt={item.name} className="h-12 w-12 rounded-lg object-cover shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold truncate">{item.name}</h4>
                            {getStockBadge(item.quantity, item.min_quantity)}
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span>Qty: <strong className="text-foreground">{item.quantity}</strong> {item.unit}</span>
                            {item.sku && <span>SKU: {item.sku}</span>}
                            {(item as any).categories?.name && (
                              <span className="flex items-center gap-1">
                                <span
                                  className="h-2 w-2 rounded-full inline-block"
                                  style={{ backgroundColor: (item as any).categories.color || "hsl(var(--primary))" }}
                                />
                                {(item as any).categories.name}
                              </span>
                            )}
                            {(item as any).locations?.name && <span>📍 {(item as any).locations.name}</span>}
                          </div>
                          {item.sell_price && (
                            <p className="text-sm font-medium mt-1">
                              ${Number(item.sell_price).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(event) => { event.stopPropagation(); setEditItem(item); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={(event) => { event.stopPropagation(); handleDelete(item.id, item.name); }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                    <span className="text-xs text-slate-500">Expiry: {formatExpiryDate(item.expiry_date)}</span>
                    <button
                      type="button"
                      onClick={() => setOpenItemId(isOpen ? null : item.id)}
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary"
                      aria-expanded={isOpen}
                    >
                      <span>{isOpen ? "Hide details" : "Show details"}</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
                      />
                    </button>
                  </div>
                  {isOpen && (
                    <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                      <div className="grid gap-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900">
                        <div className="flex flex-wrap gap-4">
                          <span><strong className="text-foreground">Expiry:</strong> {formatExpiryDate(item.expiry_date)}</span>
                          <span><strong className="text-foreground">Min threshold:</strong> {item.min_quantity}</span>
                          <span><strong className="text-foreground">Unit:</strong> {item.unit}</span>
                        </div>
                        <div className="flex flex-wrap gap-4">
                          <span><strong className="text-foreground">Stock status:</strong> {getStockBadge(item.quantity, item.min_quantity)}</span>
                          {item.barcode && <span><strong>Barcode:</strong> {item.barcode}</span>}
                        </div>
                      </div>
                      {item.description && (
                        <div className="rounded-xl border border-slate-200 bg-white p-3">
                          <p className="text-sm font-medium text-slate-900">Description</p>
                          <p className="text-sm text-slate-700">{item.description}</p>
                        </div>
                      )}
                      {item.notes && (
                        <div className="rounded-xl border border-slate-200 bg-white p-3">
                          <p className="text-sm font-medium text-slate-900">Notes</p>
                          <p className="text-sm text-slate-700">{item.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
          );
          })}
        </div>
      )}

      <AddItemDialog
  open={addOpen}
  onOpenChange={setAddOpen}
  key="TEST123"
/>
      {editItem && (
        <EditItemDialog item={editItem} open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)} />
      )}
    </div>
  );
};

export default Inventory;
