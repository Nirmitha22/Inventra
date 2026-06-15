import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useModule } from "@/context/ModuleContext";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, profile, signOut } = useAuth();
  const { module, setModule } = useModule();
  const navigate = useNavigate();

  const initials = (profile?.full_name || user?.email || "U")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleToggle = (value: "household" | "retail") => {
    if (module === value) return;
    setModule(value);
    navigate("/");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#f0f4f0] pb-20">
      <div className="bg-gradient-to-b from-[#1a3d2e] via-[#16412d] to-[#1f5e42] px-6 pb-12 pt-10 text-center text-white shadow-lg shadow-[#16412d]/20">
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white/15 ring-8 ring-white/25">
          <Avatar className="h-20 w-20 bg-white/10 text-white shadow-lg shadow-black/10">
            <AvatarFallback className="text-2xl font-bold">{initials}</AvatarFallback>
          </Avatar>
        </div>
        <h1 className="text-xl font-semibold">{profile?.full_name || "User"}</h1>
        <p className="mt-1 text-sm text-white/80">{user?.email}</p>
      </div>

      <div className="mx-auto max-w-[390px] px-4 pt-6">
        <Card className="rounded-[2rem] border-none bg-white shadow-sm">
          <CardContent className="space-y-4 p-5">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-[#1a3d2e]/70">Current Mode</p>
              <h2 className="text-2xl font-bold text-[#1a3d2e]">INVENTRA Profile</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => handleToggle("household")}
                className={`rounded-3xl border px-4 py-4 text-left transition ${module === "household" ? "border-[#1a3d2e] bg-[#e8f5ee] text-[#1a3d2e]" : "border-[#d9e5dc] bg-white text-slate-700 hover:bg-[#f5fbf6]"}`}
              >
                <p className="text-sm font-semibold">Household</p>
                {module === "household" && <p className="mt-1 text-xs text-[#1a3d2e]">Active</p>}
              </button>
              <button
                onClick={() => handleToggle("retail")}
                className={`rounded-3xl border px-4 py-4 text-left transition ${module === "retail" ? "border-[#1a3d2e] bg-[#e8f5ee] text-[#1a3d2e]" : "border-[#d9e5dc] bg-white text-slate-700 hover:bg-[#f5fbf6]"}`}
              >
                <p className="text-sm font-semibold">Retail</p>
                {module === "retail" && <p className="mt-1 text-xs text-[#1a3d2e]">Active</p>}
              </button>
            </div>
            <div className="rounded-[1.75rem] bg-[#f7faf7] p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Quick actions</p>
              <p className="mt-2">Tap a mode to switch the app view. Home is shown for Household, Dashboard for Retail.</p>
            </div>
            <Button
              variant="outline"
              className="w-full rounded-full border-[#1a3d2e] text-[#1a3d2e] hover:bg-[#e8f5ee]"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
