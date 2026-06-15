/**
 * AddProductPage.tsx — REPLACE existing Add Product page
 * ────────────────────────────────────────────────────────
 * Adds barcode scanner + OpenFoodFacts autofill.
 * Preserves existing INVENTRA card/form UI patterns.
 *
 * Flow:
 *  1. Tap "Scan Barcode" → BarcodeScanner opens (fullscreen)
 *  2. Scan → decode → fetch OpenFoodFacts by barcode
 *  3. Auto-fill: barcode, product name, brand
 *  4. User fills: quantity, expiry date, price
 *  5. Save → Supabase inventory insert
 */
import { useState } from "react";
import { BarcodeScanner } from "@/components/scanner/BarcodeScanner";
import { useInventory } from "@/hooks/useInventory";
import { useOpenFoodFacts } from "@/hooks/useOpenFoodFacts";
import { ScanBarcode, Loader2, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormState {
  barcode: string;
  name: string;
  brand: string;
  category: string;
  quantity: string;
  price: string;
  expiry_date: string;
}

const INIT: FormState = {
  barcode: "", name: "", brand: "", category: "",
  quantity: "", price: "", expiry_date: "",
};

export default function AddProductPage() {
  const { addProduct } = useInventory();
  const { fetchProductByBarcode, fetching, fetchError } = useOpenFoodFacts();

  const [form, setForm] = useState<FormState>(INIT);
  const [showScanner, setShowScanner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offFound, setOffFound] = useState<boolean | null>(null);

  const set = (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleScan = async (barcode: string) => {
    setShowScanner(false);
    setOffFound(null);
    setError(null);
    const info = await fetchProductByBarcode(barcode);
    setOffFound(info.found);
    setForm((f) => ({
      ...f,
      barcode: info.barcode,
      name: info.name || f.name,
      brand: info.brand || f.brand,
      category: info.category || f.category,
    }));
  };

  const handleSave = async () => {
    setError(null);
    if (!form.barcode || !form.name || !form.price || !form.quantity) {
      setError("Barcode, name, price, and quantity are required.");
      return;
    }
    setSaving(true);
    try {
      await addProduct({
        barcode: form.barcode.trim(),
        name: form.name.trim(),
        brand: form.brand.trim() || null,
        category: form.category.trim() || null,
        quantity: parseInt(form.quantity, 10) || 0,
        price: parseFloat(form.price) || 0,
        expiry_date: form.expiry_date || null,
      });
      setForm(INIT);
      setOffFound(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message ?? "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 space-y-5 pb-24">
      {showScanner && (
        <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add Product</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Scan a barcode or enter details manually
        </p>
      </div>

      {/* Scan trigger */}
      <button
        onClick={() => setShowScanner(true)}
        disabled={fetching}
        className={cn(
          "w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl",
          "border-2 border-dashed border-primary/40 text-primary font-semibold text-sm",
          "hover:border-primary/70 hover:bg-primary/5 transition-all",
          "disabled:opacity-60 disabled:cursor-not-allowed"
        )}
      >
        {fetching
          ? <><Loader2 size={18} className="animate-spin" /> Fetching product info…</>
          : <><ScanBarcode size={18} /> Scan Barcode</>}
      </button>

      {/* OpenFoodFacts result notice */}
      {offFound === true && (
        <Notice type="success" icon={<CheckCircle size={13} />}>
          Product found — name &amp; brand auto-filled. Complete stock details below.
        </Notice>
      )}
      {offFound === false && (
        <Notice type="info" icon={<Info size={13} />}>
          Barcode not in OpenFoodFacts database. Please fill in details manually.
        </Notice>
      )}
      {fetchError && (
        <Notice type="warning" icon={<AlertCircle size={13} />}>{fetchError}</Notice>
      )}

      {/* Form */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <section className="space-y-3">
          <SectionLabel>Product Info</SectionLabel>
          <Field label="Barcode *" value={form.barcode} onChange={set("barcode")} placeholder="Scan or type barcode" />
          <Field label="Product Name *" value={form.name} onChange={set("name")} placeholder="e.g. Parle-G Biscuits" />
          <Field label="Brand" value={form.brand} onChange={set("brand")} placeholder="e.g. Parle" />
          <Field label="Category" value={form.category} onChange={set("category")} placeholder="e.g. Snacks" />
        </section>

        <div className="border-t border-border" />

        <section className="space-y-3">
          <SectionLabel>Stock Details</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Quantity *" value={form.quantity} onChange={set("quantity")} placeholder="0" type="number" />
            <Field label="Price (₹) *" value={form.price} onChange={set("price")} placeholder="0.00" type="number" />
          </div>
          <Field label="Expiry Date" value={form.expiry_date} onChange={set("expiry_date")} placeholder="" type="date" />
        </section>
      </div>

      {error && (
        <Notice type="error" icon={<AlertCircle size={15} />}>{error}</Notice>
      )}
      {success && (
        <Notice type="success" icon={<CheckCircle size={15} />}>
          Product saved to inventory!
        </Notice>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-xl font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {saving && <Loader2 size={16} className="animate-spin" />}
        {saving ? "Saving…" : "Save Product"}
      </button>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{children}</p>;
}

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string; type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={type === "number" ? "0" : undefined}
        step={type === "number" ? "any" : undefined}
        className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring transition"
      />
    </div>
  );
}

type NoticeType = "success" | "info" | "warning" | "error";
const noticeStyles: Record<NoticeType, string> = {
  success: "text-green-600 bg-green-500/10",
  info:    "text-muted-foreground bg-muted/60",
  warning: "text-yellow-600 bg-yellow-500/10",
  error:   "text-destructive bg-destructive/10",
};

function Notice({ type, icon, children }: {
  type: NoticeType; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className={cn("flex items-center gap-2 text-xs rounded-lg px-3 py-2", noticeStyles[type])}>
      {icon}{children}
    </div>
  );
}
