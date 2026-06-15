import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getDaysUntilExpiry, getStatus, InventraItem } from "@/lib/mockData";

interface ItemModalProps {
  isOpen: boolean;
  type: "expiring" | "items" | null;
  items: InventraItem[];
  onClose: () => void;
}

const getDaysRemainingLabel = (expiryDate: string) => {
  const days = getDaysUntilExpiry(expiryDate);
  if (days <= 0) return "EXPIRED";
  if (days === 1) return "Tomorrow";
  if (days === 2) return "2d left";
  return `${days}d left`;
};

const ItemModal = ({ isOpen, type, items, onClose }: ItemModalProps) => {
  const enrichedItems = items.map((item) => ({
    ...item,
    status: getStatus(item.expiryDate),
  }));

  const modalItems = type === "expiring"
    ? enrichedItems.filter((item) => item.status !== "fresh")
    : enrichedItems;

  const title = type === "expiring" ? "Expiring," : "Inventory,";

  const categoryEmoji: Record<string, string> = {
    Dairy: "🥛",
    Vegetables: "🥦",
    Fruits: "🍎",
    Grains: "🌾",
    Oils: "🫙",
    Bakery: "🍞",
    Snacks: "🍪",
    Pulses: "🫘",
    "Packaged Food": "📦",
    Condiments: "🧴",
    "Personal Care": "🪥",
    General: "📋",
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="absolute left-0 bottom-0 z-60 w-full max-w-[390px] h-[68%] max-h-[68%] translate-y-full rounded-t-[28px] bg-white p-0 shadow-2xl transition-transform duration-[380ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-[state=open]:translate-y-0 overflow-hidden">
        <div className="mx-auto mt-3 mb-1 h-1.5 w-10 rounded-full bg-slate-300" />
        <div className="modal-inner h-full overflow-y-auto px-5 pb-10 pt-2 scrollbar-none">
          <h2 className="modal-section-title font-serif text-4xl font-light tracking-[-0.5px] text-slate-950">{title}</h2>
          {modalItems.length === 0 ? (
            <div className="mt-8 text-center text-sm text-slate-500">No items match this filter.</div>
          ) : (
            modalItems.map((item) => {
              const status = item.status;
              const days = getDaysUntilExpiry(item.expiryDate);
              const valueLabel =
                type === "expiring"
                  ? days <= 0
                    ? "EXPIRED"
                    : days === 1
                      ? "Tomorrow"
                      : days === 2
                        ? "2d left"
                        : `${days}d left`
                  : `${item.quantity} ${item.unit}`;
              const valueClass = type === "expiring" || status !== "fresh" ? "danger" : "safe";
              const icon = categoryEmoji[item.category] ?? item.name.charAt(0).toUpperCase();

              return (
                <div key={item.id} className="modal-item-row">
                  <div className="modal-item-icon">{icon}</div>
                  <div className="modal-item-center">
                    <span className="modal-item-name">{item.name}</span>
                    <span className="modal-item-sub">{item.category}</span>
                  </div>
                  <span className={`modal-item-value ${valueClass}`}>{valueLabel}</span>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemModal;
