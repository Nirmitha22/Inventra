import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import BottomNav from "./BottomNav";
import SlideMenu from "./SlideMenu";
import { useModule } from "@/context/ModuleContext";

const pageTitles: Record<string, string> = {
  "/inventory": "Inventory",
  "/scanner": "Billing",
  "/alerts": "Alerts",
  "/reports": "Reports",
  "/profile": "Profile",
  "/categories": "Categories",
  "/locations": "Locations",
  "/suppliers": "Suppliers",
  "/settings": "Settings",
  "/billing-history": "Billing History",
};

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { module } = useModule();

  const title =
    location.pathname === "/"
      ? module === "household"
        ? "Home"
        : "Dashboard"
      : pageTitles[location.pathname] || "Inventra";

  const activeTab =
    location.pathname === "/"
      ? "home"
      : location.pathname === "/scanner"
      ? "scan"
      : location.pathname === "/profile"
      ? "profile"
      : "home";

  const navigate = useNavigate();

  const handleTabChange = (tab: "home" | "scan" | "profile") => {
    if (tab === "home") navigate("/");
    else if (tab === "scan") navigate("/scanner");
    else if (tab === "profile") navigate("/profile");
  };

  return (
    <div className="phone-frame app-bg">
      <div className="app-container flex flex-col">
        <Header title={title} onMenuToggle={() => setMenuOpen(true)} />
        <SlideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
        <main className="screen-content relative flex-1">
          {children}
        </main>
      </div>
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default AppLayout;
