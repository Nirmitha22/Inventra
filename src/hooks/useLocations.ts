import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useModule } from "@/context/ModuleContext";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Location = Tables<"locations">;

export const useLocations = () => {
  const { user } = useAuth();
  const { module } = useModule();

  return useQuery({
    queryKey: ["locations", user?.id, module],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
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

export const useAddLocation = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { module } = useModule();

  return useMutation({
    mutationFn: async (loc: Omit<TablesInsert<"locations">, "user_id">) => {
      const { data, error } = await supabase
        .from("locations")
        .insert({ ...loc, user_id: user!.id, module: module! })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["locations", user?.id, module] }),
  });
};

export const useUpdateLocation = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { module } = useModule();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"locations"> & { id: string }) => {
      const { data, error } = await supabase
        .from("locations")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user!.id)
        .eq("module", module!)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["locations", user?.id, module] }),
  });
};

export const useDeleteLocation = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { module } = useModule();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("locations")
        .delete()
        .eq("id", id)
        .eq("user_id", user!.id)
        .eq("module", module!);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["locations", user?.id, module] }),
  });
};
