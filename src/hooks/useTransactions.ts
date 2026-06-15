import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useModule } from "@/context/ModuleContext";
import { Tables } from "@/integrations/supabase/types";

export type Transaction = Tables<"transactions">;

export const useTransactions = (limit = 20) => {
  const { user } = useAuth();
  const { module } = useModule();

  return useQuery({
    queryKey: ["transactions", user?.id, module, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*, items(name)")
        .eq("user_id", user!.id)
        .eq("items.module", module!)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!module,
  });
};
