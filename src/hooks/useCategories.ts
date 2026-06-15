import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useModule } from "@/context/ModuleContext";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Category = Tables<"categories">;

export const useCategories = () => {
  const { user } = useAuth();
  const { module } = useModule();

  return useQuery({
    queryKey: ["categories", user?.id, module],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user!.id)
        .eq("module", module!)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!module,
  });
};

export const useAddCategory = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { module } = useModule();

  return useMutation({
    mutationFn: async (cat: Omit<TablesInsert<"categories">, "user_id">) => {
      const { data, error } = await supabase
        .from("categories")
        .insert({ ...cat, user_id: user!.id, module: module! })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories", user?.id, module] }),
  });
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { module } = useModule();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"categories"> & { id: string }) => {
      const { data, error } = await supabase
        .from("categories")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user!.id)
        .eq("module", module!)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories", user?.id, module] }),
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { module } = useModule();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id)
        .eq("user_id", user!.id)
        .eq("module", module!);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories", user?.id, module] }),
  });
};
