export type InventraItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string;
};

export type ItemStatus = "fresh" | "expiring" | "expired";

const parseExpiryDate = (expiryDateStr: string) => {
  const [year, month, day] = String(expiryDateStr).trim().split("-").map((segment) => parseInt(segment, 10));
  const expiry = new Date(year, month - 1, day);
  expiry.setHours(0, 0, 0, 0);
  return expiry;
};

export const getDaysUntilExpiry = (expiryDateStr: string) => {
  const expiry = parseExpiryDate(expiryDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Math.round((expiry.getTime() - today.getTime()) / 86400000);
};

export const getExpiryStatus = (expiryDateStr: string) => {
  const daysUntilExpiry = getDaysUntilExpiry(expiryDateStr);

  if (daysUntilExpiry <= 0) {
    return { label: "EXPIRED", color: "bg-[#ef4444] text-white" };
  }

  if (daysUntilExpiry <= 2) {
    return { label: "EXPIRING SOON", color: "bg-[#f59e0b] text-white" };
  }

  return { label: "FRESH", color: "bg-[#22c55e] text-white" };
};

export const getStatus = (expiryDateStr: string): ItemStatus => {
  const daysUntilExpiry = getDaysUntilExpiry(expiryDateStr);
  if (daysUntilExpiry <= 0) return "expired";
  if (daysUntilExpiry <= 2) return "expiring";
  return "fresh";
};

export const formatDate = (expiryDateStr: string) => {
  const date = new Date(expiryDateStr);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
