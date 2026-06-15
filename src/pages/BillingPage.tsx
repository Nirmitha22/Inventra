import { useState } from "react";
import { createPortal } from "react-dom";
import { BarcodeScanner } from "@/components/scanner/BarcodeScanner";
import { useItems } from "@/hooks/useItems";
import { useBilling } from "@/hooks/useBilling";
import type { Item } from "@/hooks/useItems";
import {
  ScanBarcode, Trash2, ShoppingCart, CheckCircle, AlertCircle,
  Loader2, Receipt, Plus, Minus, Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export default function BillingPage() {
  const { data: items } = useItems();
  const {
    cart,
    grandTotal,
    completing,
    addToCart,
    changeQty,
    removeFromCart,
    completeBill,
  } = useBilling();

  const [showScanner, setShowScanner] = useState(false);
  const [query, setQuery] = useState("");
  const [scanMsg, setScanMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [billed, setBilled] = useState(false);

  // ── Barcode scan → find item in inventory and add to cart ──────────────
  const handleScan = (barcode: string) => {
    setShowScanner(false);
    setScanMsg(null);

    const found = items?.find((i) => i.barcode === barcode);

    if (!found) {
      setScanMsg({ type: "error", text: `Barcode "${barcode}" not found in inventory.` });
      return;
    }
    if (found.quantity === 0) {
      setScanMsg({ type: "error", text: `"${found.name}" is out of stock.` });
      return;
    }

    addToCart(found);
    setScanMsg({ type: "success", text: `Added: ${found.name}` });
    setTimeout(() => setScanMsg(null), 2000);
  };

  // ── Manual search results ──────────────────────────────────────────────
  const searchResults: Item[] = query.trim().length >= 1
    ? (items ?? []).filter(
        (i) =>
          i.name.toLowerCase().includes(query.toLowerCase()) ||
          (i.barcode ?? "").includes(query) ||
          (i.sku ?? "").toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  const handleAddFromSearch = (item: Item) => {
    if (item.quantity === 0) {
      setScanMsg({ type: "error", text: `"${item.name}" is out of stock.` });
      return;
    }
    addToCart(item);
    setQuery("");
    setScanMsg({ type: "success", text: `Added: ${item.name}` });
    setTimeout(() => setScanMsg(null), 2000);
  };

  // ── Complete bill ──────────────────────────────────────────────────────
  const checkout = async () => {
    const ok = await completeBill();
    if (ok) {
      setBilled(true);
      setTimeout(() => setBilled(false), 4000);
    } else {
      setScanMsg({ type: "error", text: "Checkout failed — please try again." });
    }
  };

  return (
    <div className="p-4 space-y-4 pb-36">
      {showScanner && createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 99999 }}>
          <BarcodeScanner
            title="Scan Product Barcode"
            onScan={handleScan}
            onClose={() => setShowScanner(false)}
          />
        </div>,
        document.body
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Receipt size={22} className="text-primary" />
            Billing
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Scan or search products to build a bill</p>
        </div>
        {cart.length > 0 && (
          <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold">
            {cart.length} item{cart.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Scan button */}
      <button
        onClick={() => setShowScanner(true)}
        className={cn(
          "w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl",
          "border-2 border-dashed border-primary/40 text-primary font-semibold text-sm",
          "hover:border-primary/70 hover:bg-primary/5 transition-all"
        )}
      >
        <ScanBarcode size={18} /> Scan Barcode
      </button>

      {/* Manual search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, barcode or SKU…"
          className="pl-9"
        />
      </div>

      {/* Search results dropdown */}
      {searchResults.length > 0 && (
        <div className="rounded-xl border border-border bg-card shadow-sm divide-y divide-border">
          {searchResults.map((item) => (
            <button
              key={item.id}
              onClick={() => handleAddFromSearch(item)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-secondary/50 transition first:rounded-t-xl last:rounded-b-xl"
            >
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.barcode ?? item.sku ?? ""} · Stock: {item.quantity} {item.unit}
                </p>
              </div>
              <div className="text-right shrink-0 ml-3">
                {item.sell_price != null && (
                  <p className="text-sm font-semibold">₹{Number(item.sell_price).toFixed(2)}</p>
                )}
                <Plus size={14} className="text-primary ml-auto" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Status messages */}
      {scanMsg && (
        <div className={cn(
          "flex items-center gap-2 text-sm rounded-lg px-3 py-2 animate-fade-in",
          scanMsg.type === "error"
            ? "bg-destructive/10 text-destructive"
            : "bg-green-500/10 text-green-600"
        )}>
          {scanMsg.type === "error"
            ? <AlertCircle size={15} />
            : <CheckCircle size={15} />}
          {scanMsg.text}
        </div>
      )}

      {billed && (
        <div className="flex items-center gap-2 text-sm rounded-lg px-3 py-2 bg-green-500/10 text-green-600 animate-fade-in">
          <CheckCircle size={15} />
          Bill completed! Inventory stock updated.
        </div>
      )}

      {/* Empty cart */}
      {cart.length === 0 && !billed && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
          <ShoppingCart size={44} className="opacity-20" />
          <p className="text-sm">Cart is empty — scan or search a product to start.</p>
        </div>
      )}

      {/* Cart items */}
      {cart.length > 0 && (
        <div className="space-y-3">
          {cart.map((cartItem) => (
            <div
              key={cartItem.item.id}
              className="rounded-xl border border-border bg-card p-4 space-y-3 animate-fade-in"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{cartItem.item.name}</p>
                  {cartItem.item.barcode && (
                    <p className="text-xs text-muted-foreground">{cartItem.item.barcode}</p>
                  )}
                </div>
                <button
                  onClick={() => removeFromCart(cartItem.item.id)}
                  className="shrink-0 text-muted-foreground hover:text-destructive transition p-1 rounded"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => changeQty(cartItem.item.id, -1)}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-bold w-5 text-center">{cartItem.qty}</span>
                  <button
                    onClick={() => changeQty(cartItem.item.id, +1)}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="text-right">
                  {cartItem.item.sell_price != null && (
                    <p className="text-xs text-muted-foreground">
                      ₹{Number(cartItem.item.sell_price).toFixed(2)} × {cartItem.qty}
                    </p>
                  )}
                  <p className="font-bold text-sm">₹{cartItem.subtotal.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sticky bill footer */}
      {cart.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 z-40 px-4 pb-2 bg-background/95 backdrop-blur border-t border-border pt-3 max-w-lg mx-auto">
          <div className="space-y-0.5 mb-2">
            {cart.map((i) => (
              <div key={i.item.id} className="flex justify-between text-xs text-muted-foreground">
                <span>{i.item.name} × {i.qty}</span>
                <span>₹{i.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mb-3 pt-2 border-t border-border">
            <span className="font-bold text-base">Total</span>
            <span className="font-bold text-xl">₹{grandTotal.toFixed(2)}</span>
          </div>
          <button
            onClick={checkout}
            disabled={completing}
            className="w-full py-3 rounded-xl font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {completing && <Loader2 size={16} className="animate-spin" />}
            {completing ? "Processing…" : "Complete Bill"}
          </button>
        </div>
      )}
    </div>
  );
}
