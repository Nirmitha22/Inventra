import React from "react";
import { InventraItem } from "@/lib/mockData";

type NotificationContextValue = {
  activeItems: InventraItem[];
  setActiveItems: React.Dispatch<React.SetStateAction<InventraItem[]>>;
};

const NotificationContext = React.createContext<NotificationContextValue | null>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeItems, setActiveItems] = React.useState<InventraItem[]>([]);

  return (
    <NotificationContext.Provider value={{ activeItems, setActiveItems }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider.");
  }
  return context;
};
