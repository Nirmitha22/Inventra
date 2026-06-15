/**
 * Scanner.tsx
 * Path: src/pages/Scanner.tsx
 * Route: /scanner
 *
 * ONLY CHANGE vs original: added `useNavigate` + History button in header.
 * All barcode, cart, search, and complete-bill logic is identical.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ScanLine, Trash2, ShoppingCart, CheckCircle, AlertCircle,
  Loader2, Plus, Minus, Receipt, Search, X, History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useItems } from "@/hooks/useItems";
import { useBilling, type CartItem } from "@/hooks/useBilling";
import { BarcodeScanner } from "@/components/scanner/BarcodeScanner";
import type { Item } from "@/hooks/useItems";

const Scanner = () => {
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(false);
  const [scanMsg, setScanMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [billed, setBilled] = useState(false);

  // Manual product search state
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const { data: items } = useItems();
  const billing = useBilling();
  const { toast } = useToast();

  // ── Barcode scan handler ────────────────────────────────────────────────
  const handleScan = (barcode: string) => {
    setShowScanner(false);
    setScanMsg(null);

    const found = items?.find((i) => i.barcode === barcode);
    if (!found) {
      setScanMsg({ type: "err", text: `Barcode "${barcode}" not in your inventory.` });
      return;
    }
    if (found.quantity === 0) {
      setScanMsg({ type: "err", text: `"${found.name}" is out of stock.` });
      return;
    }
    billing.addToCart(found);
    setScanMsg({ type: "ok", text: `Added: ${found.name}` });
    setTimeout(() => setScanMsg(null), 2000);
  };

  // ── Manual product select ───────────────────────────────────────────────
  const handleManualAdd = (item: Item) => {
    if (item.quantity === 0) {
      setScanMsg({ type: "err", text: `"${item.name}" is out of stock.` });
      setTimeout(() => setScanMsg(null), 2000);
      return;
    }
    billing.addToCart(item);
    setSearchQuery("");
    setShowSearch(false);
    setScanMsg({ type: "ok", text: `Added: ${item.name}` });
    setTimeout(() => setScanMsg(null), 2000);
  };

  const searchResults = searchQuery.trim().length > 0
    ? (items ?? []).filter((i) =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (i.barcode ?? "").includes(searchQuery)
      ).slice(0, 8)
    : [];

  // ── Complete bill ───────────────────────────────────────────────────────
  const handleCompleteBill = async () => {
    const ok = await billing.completeBill();
    if (ok) {
      setBilled(true);
      toast({ title: "Bill complete", description: "Stock updated successfully." });
      setTimeout(() => setBilled(false), 4000);
    } else if (billing.error) {
      toast({ title: "Error", description: billing.error, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4 p-4 pb-24">
      {showScanner && (
        <BarcodeScanner
          title="Scan to Bill"
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Header — History button added */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">Billing</h1>
        </div>
        <div className="flex items-center gap-2">
          {billing.itemCount > 0 && (
            <Badge variant="secondary">
              {billing.itemCount} item{billing.itemCount > 1 ? "s" : ""}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-muted-foreground"
            onClick={() => navigate("/billing-history")}
          >
            <History className="h-3.5 w-3.5" />
            History
          </Button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button className="flex-1 h-12 gap-2" onClick={() => setShowScanner(true)}>
          <ScanLine className="h-4 w-4" />
          Scan Barcode
        </Button>
        <Button
          variant="outline"
          className="h-12 gap-2"
          onClick={() => { setShowSearch((s) => !s); setSearchQuery(""); }}
        >
          {showSearch ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          {showSearch ? "Close" : "Search"}
        </Button>
      </div>

      {/* Manual product search */}
      {showSearch && (
        <Card>
          <CardContent className="p-3 space-y-2">
            <Input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product name or barcode…"
              className="h-10"
            />
            {searchResults.length > 0 && (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleManualAdd(item)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      {item.barcode && (
                        <p className="text-xs text-muted-foreground">{item.barcode}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      {item.sell_price && (
                        <p className="text-xs font-medium">₹{Number(item.sell_price).toFixed(2)}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {searchQuery.trim().length > 0 && searchResults.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">No products found</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status messages */}
      {scanMsg && (
        <Card className={scanMsg.type === "err"
          ? "border-destructive/30 bg-destructive/5"
          : "border-green-500/30 bg-green-500/5"}>
          <CardContent className="flex items-center gap-2 py-3 px-4 text-sm">
            {scanMsg.type === "err"
              ? <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
              : <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />}
            <span className={scanMsg.type === "err" ? "text-destructive" : "text-green-700"}>
              {scanMsg.text}
            </span>
          </CardContent>
        </Card>
      )}

      {billed && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="flex items-center gap-2 py-3 px-4 text-sm text-green-700">
            <CheckCircle className="h-4 w-4 shrink-0" />
            Bill completed! Inventory stock updated.
          </CardContent>
        </Card>
      )}

      {/* Empty cart */}
      {billing.cart.length === 0 && !billed && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-base font-semibold mb-1">Cart is empty</h3>
            <p className="text-sm text-muted-foreground">
              Scan a barcode or use Search to add products.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Cart items */}
      {billing.cart.length > 0 && (
        <>
          <div className="space-y-2">
            {billing.cart.map((ci) => (
              <CartCard
                key={ci.item.id}
                cartItem={ci}
                onIncrease={() => billing.changeQty(ci.item.id, +1)}
                onDecrease={() => billing.changeQty(ci.item.id, -1)}
                onRemove={() => billing.removeFromCart(ci.item.id)}
              />
            ))}
          </div>

          {/* Bill footer */}
          <Card className="border-primary/20 bg-primary/5 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="space-y-1">
                {billing.cart.map((ci) => (
                  <div key={ci.item.id} className="flex justify-between text-xs text-muted-foreground">
                    <span>{ci.item.name} × {ci.qty}</span>
                    <span>₹{ci.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-primary/15">
                <span className="font-bold">Total</span>
                <span className="font-bold text-xl text-primary">
                  ₹{billing.grandTotal.toFixed(2)}
                </span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={billing.clearCart} className="shrink-0">
                  Clear
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={handleCompleteBill}
                  disabled={billing.completing}
                >
                  {billing.completing && <Loader2 className="h-4 w-4 animate-spin" />}
                  {billing.completing ? "Processing…" : "Complete Bill"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Scanner;

// ── Cart Item Card ─────────────────────────────────────────────────────────
function CartCard({
  cartItem, onIncrease, onDecrease, onRemove,
}: {
  cartItem: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}) {
  const { item, qty, subtotal } = cartItem;
  const price = Number(item.sell_price ?? item.cost_price ?? 0);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <p className="font-semibold truncate">{item.name}</p>
            {item.barcode && (
              <p className="text-xs text-muted-foreground">{item.barcode}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-destructive hover:bg-destructive/10"
            onClick={onRemove}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={onDecrease}>
              <Minus className="h-3 w-3" />
            </Button>
            <span className="font-bold w-5 text-center">{qty}</span>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={onIncrease}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <div className="text-right">
            {price > 0 && (
              <p className="text-xs text-muted-foreground">₹{price.toFixed(2)} × {qty}</p>
            )}
            <p className="font-bold">₹{subtotal.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
