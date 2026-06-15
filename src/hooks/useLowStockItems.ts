import { useItems } from "@/hooks/useItems";

export function useLowStockItems() {
  const { data: items, isLoading } = useItems();

  const lowStockItems = (items ?? []).filter(
    (item) =>
      item.min_quantity > 0 &&
      item.quantity <= item.min_quantity
  );

  const outOfStockItems = (items ?? []).filter((item) => item.quantity === 0);

  // Combine, de-duplicate (out of stock also counts as low stock)
  const alertItems = lowStockItems;

  return {
    alertItems,
    outOfStockItems,
    alertCount: alertItems.length,
    isLoading,
  };
}
