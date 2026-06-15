import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useModule } from "@/context/ModuleContext";
import { Tables } from "@/integrations/supabase/types";

export type Alert = Tables<"alerts">;

export const useAlerts = () => {
  const { user } = useAuth();
  const { module } = useModule();

  return useQuery({
    queryKey: ["alerts", user?.id, module],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alerts")
        .select("*, items(name)")
        .eq("user_id", user!.id)
        .eq("items.module", module!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!module,
  });
};

export const useMarkAlertRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("alerts").update({ is_read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });
};

export const useMarkAllAlertsRead = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("alerts")
        .update({ is_read: true })
        .eq("user_id", user!.id)
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });
};
