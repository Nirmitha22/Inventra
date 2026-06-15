/**
 * useInventory.ts — NEW FILE
 * ──────────────────────────
 * Central hook for all inventory DB operations via Supabase.
 * Table: inventory (id, name, barcode, quantity, price, expiry_date, category, brand)
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface Product {
  id: string;
  name: string;
  barcode: string;
  quantity: number;
  price: number;
  expiry_date: string | null;
  category: string | null;
  brand: string | null;
  created_at: string;
  updated_at: string;
}

const LOW_STOCK_THRESHOLD = 5;

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("inventory")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) setError(error.message);
    else setProducts((data as Product[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const addProduct = async (p: Omit<Product, "id" | "created_at" | "updated_at">) => {
    const { data, error } = await supabase
      .from("inventory")
      .insert([{ ...p, updated_at: new Date().toISOString() }])
      .select()
      .single();
    if (error) throw new Error(error.message);
    setProducts((prev) => [data as Product, ...prev]);
    return data as Product;
  };

  const getByBarcode = async (barcode: string): Promise<Product | null> => {
    const { data } = await supabase
      .from("inventory")
      .select("*")
      .eq("barcode", barcode)
      .single();
    return (data as Product) ?? null;
  };

  /** Reduce stock by soldQty after billing. */
  const reduceStock = async (productId: string, soldQty: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const newQty = Math.max(0, product.quantity - soldQty);
    const { error } = await supabase
      .from("inventory")
      .update({ quantity: newQty, updated_at: new Date().toISOString() })
      .eq("id", productId);
    if (error) throw new Error(error.message);
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, quantity: newQty } : p))
    );
  };

  const lowStockProducts = products.filter((p) => p.quantity <= LOW_STOCK_THRESHOLD);

  return {
    products,
    loading,
    error,
    lowStockProducts,
    fetchProducts,
    addProduct,
    getByBarcode,
    reduceStock,
  };
}
