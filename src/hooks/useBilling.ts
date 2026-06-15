import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useModule } from "@/context/ModuleContext";
import type { Item } from "@/hooks/useItems";

export interface CartItem {
  item: Item;
  qty: number;
  subtotal: number;
}

export function useBilling() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const qc = useQueryClient();
  const { user } = useAuth();
  const { module } = useModule();

  const grandTotal = cart.reduce((s, c) => s + c.subtotal, 0);
  const itemCount = cart.reduce((s, c) => s + c.qty, 0);

  const addToCart = (item: Item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.item.id === item.id
            ? { ...c, qty: c.qty + 1, subtotal: (c.qty + 1) * Number(item.sell_price ?? item.cost_price ?? 0) }
            : c
        );
      }
      return [
        ...prev,
        { item, qty: 1, subtotal: Number(item.sell_price ?? item.cost_price ?? 0) },
      ];
    });
  };

  const changeQty = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.item.id !== itemId) return c;
          const newQty = c.qty + delta;
          if (newQty <= 0) return null;
          return { ...c, qty: newQty, subtotal: newQty * Number(c.item.sell_price ?? c.item.cost_price ?? 0) };
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (itemId: string) =>
    setCart((prev) => prev.filter((c) => c.item.id !== itemId));

  const clearCart = () => setCart([]);

  const completeBill = async (): Promise<boolean> => {
    if (!cart.length || !user) return false;
    setCompleting(true);
    setError(null);

    // Snapshot values before cart is cleared
    const cartSnapshot = [...cart];
    const totalSnapshot = grandTotal;
    const countSnapshot = itemCount;

    try {
      // STEP 1: Reduce stock quantity for each cart item
      for (const cartItem of cartSnapshot) {
        const newQty = Math.max(0, cartItem.item.quantity - cartItem.qty);
        const { error: updateError } = await supabase
          .from("items")
          .update({
            quantity: newQty,
            updated_at: new Date().toISOString(),
          })
          .eq("id", cartItem.item.id)
          .eq("user_id", user.id);

        if (updateError) throw new Error(`Stock update failed: ${updateError.message}`);
      }

      // STEP 2: Save bill record for history
      const itemsSnapshot = cartSnapshot.map((c) => ({
        name: c.item.name,
        qty: c.qty,
        sell_price: Number(c.item.sell_price ?? c.item.cost_price ?? 0),
        subtotal: c.subtotal,
      }));

      const { error: billError } = await supabase
        .from("bills")
        .insert({
          user_id: user.id,
          module: module ?? "inventory",
          total: totalSnapshot,
          item_count: countSnapshot,
          items_snapshot: itemsSnapshot,
        });

      // Bill save failure should NOT block the completed stock reduction
      // Log it but don't throw — stock was already reduced successfully
      if (billError) {
        console.error("Bill record save failed (stock was still reduced):", billError.message);
      }

      // STEP 3: Refresh inventory and billing history queries
      qc.invalidateQueries({ queryKey: ["items"] });
      qc.invalidateQueries({ queryKey: ["bills"] });

      setCart([]);
      return true;
    } catch (e: any) {
      setError(e.message ?? "Bill completion failed");
      return false;
    } finally {
      setCompleting(false);
    }
  };

  return {
    cart,
    grandTotal,
    itemCount,
    completing,
    error,
    addToCart,
    changeQty,
    removeFromCart,
    clearCart,
    completeBill,
  };
}
