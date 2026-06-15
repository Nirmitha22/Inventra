import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateItem, Item } from "@/hooks/useItems";
import { useCategories } from "@/hooks/useCategories";
import { useLocations } from "@/hooks/useLocations";
import { useToast } from "@/hooks/use-toast";
import { useImageUpload } from "@/hooks/useImageUpload";
import ImageUpload from "./ImageUpload";
import { Loader2 } from "lucide-react";

interface Props {
  item: Item;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditItemDialog = ({ item, open, onOpenChange }: Props) => {
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(String(item.quantity));
  const [minQuantity, setMinQuantity] = useState(String(item.min_quantity));
  const [unit, setUnit] = useState(item.unit || "pcs");
  const [sku, setSku] = useState(item.sku || "");
  const [barcode, setBarcode] = useState(item.barcode || "");
  const [costPrice, setCostPrice] = useState(item.cost_price ? String(item.cost_price) : "");
  const [sellPrice, setSellPrice] = useState(item.sell_price ? String(item.sell_price) : "");
  const [expiryDate, setExpiryDate] = useState(item.expiry_date || "");
  const [categoryId, setCategoryId] = useState(item.category_id || "");
  const [locationId, setLocationId] = useState(item.location_id || "");
  const [description, setDescription] = useState(item.description || "");
  const [notes, setNotes] = useState(item.notes || "");
  const [imageUrl, setImageUrl] = useState<string | null>(item.image_url);

  const updateItem = useUpdateItem();
  const { upload, remove, uploading } = useImageUpload();
  const { data: categories } = useCategories();
  const { data: locations } = useLocations();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await updateItem.mutateAsync({
        id: item.id,
        name: name.trim(),
        quantity: parseInt(quantity) || 0,
        min_quantity: parseInt(minQuantity) || 0,
        unit,
        sku: sku || null,
        barcode: barcode || null,
        cost_price: costPrice ? parseFloat(costPrice) : null,
        sell_price: sellPrice ? parseFloat(sellPrice) : null,
        expiry_date: expiryDate || null,
        category_id: categoryId || null,
        location_id: locationId || null,
        description: description || null,
        notes: notes || null,
        image_url: imageUrl,
      });
      toast({ title: "Updated", description: `${name} has been updated.` });
      onOpenChange(false);
    } catch {
      toast({ title: "Error", description: "Failed to update item.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageUpload
            imageUrl={imageUrl}
            onUpload={async (file) => {
              const url = await upload(file);
              if (url) setImageUrl(url);
            }}
            onRemove={async () => {
              if (imageUrl) await remove(imageUrl);
              setImageUrl(null);
            }}
            uploading={uploading}
          />
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["pcs", "kg", "g", "L", "ml", "box", "pack", "dozen"].map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="minQty">Min Quantity (alert threshold)</Label>
            <Input id="minQty" type="number" value={minQuantity} onChange={(e) => setMinQuantity(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="barcode">Barcode</Label>
              <Input id="barcode" value={barcode} onChange={(e) => setBarcode(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="cost">Cost Price</Label>
              <Input id="cost" type="number" step="0.01" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="sell">Sell Price</Label>
              <Input id="sell" type="number" step="0.01" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="expiry">Expiry Date</Label>
            <Input id="expiry" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
          </div>

          {categories && categories.length > 0 && (
            <div>
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {locations && locations.length > 0 && (
            <div>
              <Label>Location</Label>
              <Select value={locationId} onValueChange={setLocationId}>
                <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                <SelectContent>
                  {locations.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <Button type="submit" className="w-full" disabled={updateItem.isPending}>
            {updateItem.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemDialog;
