import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useModule } from "@/context/ModuleContext";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Supplier = Tables<"suppliers">;

export const useSuppliers = () => {
  const { user } = useAuth();
  const { module } = useModule();

  return useQuery({
    queryKey: ["suppliers", user?.id, module],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
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

export const useAddSupplier = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { module } = useModule();

  return useMutation({
    mutationFn: async (sup: Omit<TablesInsert<"suppliers">, "user_id">) => {
      const { data, error } = await supabase
        .from("suppliers")
        .insert({ ...sup, user_id: user!.id, module: module! })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers", user?.id, module] }),
  });
};

export const useUpdateSupplier = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { module } = useModule();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"suppliers"> & { id: string }) => {
      const { data, error } = await supabase
        .from("suppliers")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user!.id)
        .eq("module", module!)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers", user?.id, module] }),
  });
};

export const useDeleteSupplier = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { module } = useModule();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("suppliers")
        .delete()
        .eq("id", id)
        .eq("user_id", user!.id)
        .eq("module", module!);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers", user?.id, module] }),
  });
};
