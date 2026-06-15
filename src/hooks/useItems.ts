import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useModule } from "@/context/ModuleContext";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Item = Tables<"items">;
export type ItemInsert = TablesInsert<"items">;
export type ItemUpdate = TablesUpdate<"items">;

const itemsKey = (userId?: string, module?: string | null) =>
  ["items", userId, module] as const;

export const useItems = () => {
  const { user } = useAuth();
  const { module } = useModule();

  return useQuery({
    queryKey: itemsKey(user?.id, module),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("items")
        .select("*, categories(name, color, icon), locations(name)")
        .eq("user_id", user!.id)
        .eq("module", module ?? "retail")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user && !!module,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

export const useAddItem = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { module } = useModule();

  return useMutation({
    mutationFn: async (item: Omit<ItemInsert, "user_id" | "module">) => {
      const { data, error } = await supabase
        .from("items")
        .insert({ ...item, user_id: user!.id, module: module ?? "retail" })
        .select()
        .single();
      if (error) {
        console.error("useAddItem error:", error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items", user?.id, module] });
    },
  });
};

export const useUpdateItem = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { module } = useModule();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ItemUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("items")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user!.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items", user?.id, module] });
    },
  });
};

export const useDeleteItem = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { module } = useModule();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("items")
        .delete()
        .eq("id", id)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items", user?.id, module] });
    },
  });
};
