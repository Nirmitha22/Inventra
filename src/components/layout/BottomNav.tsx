import { LayoutGrid, ScanLine, User } from "lucide-react";

interface BottomNavProps {
  activeTab: "home" | "scan" | "profile";
  onTabChange: (tab: "home" | "scan" | "profile") => void;
}

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  return (
    <div className="bottom-nav-bar">
      <div
        className={`nav-item ${activeTab === "home" ? "active" : ""}`}
        onClick={() => onTabChange("home")}
      >
        <div className={`nav-icon-box ${activeTab === "home" ? "active" : ""}`}>
          <LayoutGrid size={20} />
        </div>
      </div>

      <div
        className={`nav-item ${activeTab === "scan" ? "active" : ""}`}
        onClick={() => onTabChange("scan")}
      >
        <div className={`nav-icon-box ${activeTab === "scan" ? "active" : ""}`}>
          <ScanLine size={20} />
        </div>
      </div>

      <div
        className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
        onClick={() => onTabChange("profile")}
      >
        <div className={`nav-icon-box ${activeTab === "profile" ? "active" : ""}`}>
          <User size={20} />
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
