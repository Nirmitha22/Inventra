import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useModule } from "@/context/ModuleContext";

export interface BillRecord {
  id: string;
  user_id: string;
  module: string;
  total: number;
  item_count: number;
  items_snapshot: {
    name: string;
    qty: number;
    subtotal: number;
    sell_price: number | null;
  }[];
  created_at: string;
}

export const useBillingHistory = () => {
  const { user } = useAuth();
  const { module } = useModule();

  return useQuery<BillRecord[]>({
    queryKey: ["bills", user?.id, module],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bills")
        .select("*")
        .eq("user_id", user!.id)
        .eq("module", module!)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as BillRecord[];
    },
    enabled: !!user && !!module,
  });
};

export const useSaveBill = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { module } = useModule();

  return useMutation({
    mutationFn: async (bill: {
      total: number;
      item_count: number;
      items_snapshot: BillRecord["items_snapshot"];
    }) => {
      const { data, error } = await supabase
        .from("bills")
        .insert({
          user_id: user!.id,
          module: module!,
          total: bill.total,
          item_count: bill.item_count,
          items_snapshot: bill.items_snapshot as any,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bills", user?.id, module] }),
  });
};

// Deletes ALL bills for this user+module
export const useClearHistory = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { module } = useModule();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("bills")
        .delete()
        .eq("user_id", user!.id)
        .eq("module", module ?? "inventory");
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bills", user?.id, module] }),
  });
};
