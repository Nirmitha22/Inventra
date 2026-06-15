

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddItem } from "@/hooks/useItems";
import { useCategories } from "@/hooks/useCategories";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ScanLine, X } from "lucide-react";
import { BarcodeScanner } from "@/components/scanner/BarcodeScanner";
import { useOpenFoodFacts } from "@/hooks/useOpenFoodFacts";
import { createPortal } from "react-dom";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddItemDialog = ({ open, onOpenChange }: Props) => {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [barcode, setBarcode] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  const addItem = useAddItem();
  const { data: categories } = useCategories();
  const { toast } = useToast();
  const { fetchByBarcode, fetching: offFetching } = useOpenFoodFacts();

  const reset = () => {
    setName("");
    setQuantity("1");
    setBarcode("");
    setSellPrice("");
    setExpiryDate("");
    setCategoryId("");
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const handleBarcodeScanned = async (scanned: string) => {
    setShowScanner(false);
    setBarcode(scanned);
    try {
      const product = await fetchByBarcode(scanned);
      if (product.name && !name.trim()) {
        setName(product.name);
      }
      toast({
        title: "Barcode scanned",
        description: product.found
          ? `"${product.name || scanned}" found — name autofilled.`
          : `Barcode ${scanned} set. Enter product name manually.`,
      });
    } catch {
      toast({
        title: "Lookup skipped",
        description: "Barcode set. Enter product name manually.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      // IMPORTANT: do NOT pass `module` here.
      // useAddItem reads it from ModuleContext and writes it to Supabase correctly.
      // Overriding with a hardcoded string causes items to disappear on refresh
      // because useItems filters by the real context module.
      await addItem.mutateAsync({
        name: name.trim(),
        quantity: parseInt(quantity) || 1,
        min_quantity: 0,
        unit: "pcs",
        barcode: barcode.trim() || null,
        sell_price: sellPrice ? parseFloat(sellPrice) : null,
        expiry_date: expiryDate || null,
        category_id: categoryId || null,
        sku: null,
        cost_price: null,
        location_id: null,
        description: null,
        notes: null,
        image_url: null,
      });
      toast({ title: "Item added", description: `${name.trim()} added to inventory.` });
      reset();
      onOpenChange(false);
    } catch (err) {
      console.error("Add item error:", err);
      toast({ title: "Error", description: "Failed to add item. Please try again.", variant: "destructive" });
    }
  };

  return (
    <>
      {/* BarcodeScanner portaled to document.body — escapes phone-frame overflow:hidden */}
      {showScanner && createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 99999 }}>
          <BarcodeScanner
            title="Scan Product Barcode"
            onScan={handleBarcodeScanned}
            onClose={() => setShowScanner(false)}
          />
        </div>,
        document.body
      )}

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          {/* Header with explicit close button */}
          <DialogHeader className="px-5 pt-4 pb-3 shrink-0 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base font-semibold">Add Item</DialogTitle>
              <button
                type="button"
                onClick={handleClose}
                className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </DialogHeader>

          {/* Scrollable form body */}
          <div className="modal-inner">
            <form onSubmit={handleSubmit} className="space-y-4 pb-8 pt-3">

              {/* Scan barcode — prominent CTA at top */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 gap-2 border-dashed border-primary/50 text-primary hover:bg-primary/5"
                disabled={offFetching}
                onClick={() => setShowScanner(true)}
              >
                {offFetching
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <ScanLine className="h-4 w-4" />}
                {offFetching ? "Looking up product…" : "Scan Barcode to Autofill"}
              </Button>

              {/* Product Name */}
              <div className="space-y-1.5">
                <Label htmlFor="add-name">Product Name *</Label>
                <Input
                  id="add-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Milk, Rice, Shampoo"
                  required
                  autoComplete="off"
                />
              </div>

              {/* Quantity */}
              <div className="space-y-1.5">
                <Label htmlFor="add-qty">Quantity</Label>
                <Input
                  id="add-qty"
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              {/* Barcode — manual entry + inline scan icon */}
              <div className="space-y-1.5">
                <Label htmlFor="add-barcode">Barcode</Label>
                <div className="flex gap-2">
                  <Input
                    id="add-barcode"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Scan or type barcode"
                    className="flex-1"
                    autoComplete="off"
                    inputMode="numeric"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    disabled={offFetching}
                    onClick={() => setShowScanner(true)}
                    title="Open barcode scanner"
                  >
                    {offFetching
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <ScanLine className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-1.5">
                <Label htmlFor="add-price">Price (₹ per unit)</Label>
                <Input
                  id="add-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              {/* Expiry Date */}
              <div className="space-y-1.5">
                <Label htmlFor="add-expiry">Expiry Date</Label>
                <Input
                  id="add-expiry"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>

              {/* Category — only shown if any exist */}
              {categories && categories.length > 0 && (
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-11 mt-2"
                disabled={addItem.isPending || !name.trim()}
              >
                {addItem.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {addItem.isPending ? "Adding…" : "Add Item"}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddItemDialog;
