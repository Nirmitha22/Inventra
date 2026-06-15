import { useEffect, useState } from "react";
import { Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/context/NotificationContext";
import { getStatus, getDaysUntilExpiry } from "@/lib/mockData";

interface HeaderProps {
  title: string;
  onMenuToggle: () => void;
}

const Header = ({ title, onMenuToggle }: HeaderProps) => {
  const { activeItems } = useNotification();
  const expiringItems = activeItems.filter((item) => getStatus(item.expiryDate) === "expiring");
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (notifOpen && target && !target.closest(".notif-wrapper")) {
        setNotifOpen(false);
      }
    };

    if (notifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifOpen]);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between bg-[#f0f4f0]/95 backdrop-blur shadow-sm top-header">
      <Button variant="ghost" size="icon" onClick={onMenuToggle} className="h-10 w-10 rounded-xl text-[#1a3d2e] hover:bg-[#e8f5ee]">
        <Menu className="h-5 w-5" />
      </Button>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-[#1a3d2e]/70">INVENTRA</p>
        <h1 className="text-base font-bold text-[#1a3d2e]">{title}</h1>
      </div>
      <div className="notif-wrapper">
        <div
          className="notif-bell-btn"
          onClick={() => setNotifOpen((prev) => !prev)}
        >
          <Bell className="h-5 w-5 text-[#1a3d2e]" />
          {expiringItems.length > 0 && (
            <span className="notif-badge">{expiringItems.length}</span>
          )}
        </div>

        {notifOpen && (
          <div className="notif-dropdown">
            <div className="notif-dropdown-header">
              <span className="notif-dropdown-title">⚠️ Expiring Soon</span>
              <span className="notif-dropdown-count">{expiringItems.length}</span>
            </div>
            <div className="notif-divider" />
            {expiringItems.length === 0 ? (
              <div className="notif-empty">No items expiring soon! ✅</div>
            ) : (
              expiringItems.map((item) => {
                const days = getDaysUntilExpiry(item.expiryDate);
                return (
                  <div key={item.id} className="notif-item-row">
                    <div className="notif-item-left">
                      <div className="notif-dot" />
                      <div className="notif-item-info">
                        <span className="notif-item-name">{item.name}</span>
                        <span className="notif-item-sub">{item.category}</span>
                      </div>
                    </div>
                    <span className="notif-item-days">
                      {days === 0 ? "Today" : days === 1 ? "1 day left" : `${days} days left`}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
