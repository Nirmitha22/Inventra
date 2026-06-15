import { X, User, FolderOpen, MapPin, Truck, Settings, LogOut, Package, Store, Home } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useModule } from "@/context/ModuleContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SlideMenuProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  { label: "Profile", icon: User, path: "/profile" },
  { label: "Categories", icon: FolderOpen, path: "/categories" },
  { label: "Locations", icon: MapPin, path: "/locations" },
  { label: "Suppliers", icon: Truck, path: "/suppliers" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

const SlideMenu = ({ open, onClose }: SlideMenuProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { module, setModule, clearModule } = useModule();

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleSignOut = async () => {
    await signOut();
    clearModule();
    onClose();
    navigate("/login");
  };

  const handleModuleSwitch = (nextModule: "household" | "retail") => {
    if (module === nextModule) return;
    setModule(nextModule);
    navigate("/", { replace: true });
    onClose();
  };

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className={cn("absolute inset-0 z-30 pointer-events-none", open && "pointer-events-auto")}>
      <div
        className={cn(
          "absolute inset-0 bg-black/45 transition-opacity duration-300 ease-in-out",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "absolute inset-y-0 left-0 z-40 flex h-full w-[78%] max-w-[312px] flex-col bg-[#f4f8f5] shadow-2xl transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-primary/10 px-4">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-wide text-primary">Inventra</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User Info */}
        <div className="border-b border-primary/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-primary/15 bg-white/70 p-1.5">
            <div className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wide text-primary/60">
              Module
            </div>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => handleModuleSwitch("household")}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition-colors",
                  module === "household" ? "bg-primary text-white" : "text-primary hover:bg-primary/10"
                )}
              >
                <Home className="h-3.5 w-3.5" />
                <span>Household</span>
              </button>
              <button
                onClick={() => handleModuleSwitch("retail")}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition-colors",
                  module === "retail" ? "bg-primary text-white" : "text-primary hover:bg-primary/10"
                )}
              >
                <Store className="h-3.5 w-3.5" />
                <span>Retail</span>
              </button>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors min-h-[44px]",
                  isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sign Out */}
        <div className="border-t border-primary/10 p-3 safe-bottom">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors min-h-[44px]"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlideMenu;
