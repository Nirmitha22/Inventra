import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AppModule, useModule } from "@/context/ModuleContext";

const moduleCards: Array<{
  id: AppModule;
  title: string;
  subtitle: string;
  gradient: string;
}> = [
  {
    id: "household",
    title: "Household",
    subtitle: "track stock, monitor\nexpiry dates",
    gradient: "from-[#5a987d] via-[#2c5c4a] to-[#1d3930]",
  },
  {
    id: "retail",
    title: "Retail",
    subtitle: "track product stock, update\nquantities in real time",
    gradient: "from-[#1b2a25] via-[#284a3e] to-[#64b194]",
  },
];

const ModuleSelect = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { module, setModule } = useModule();
  const displayName = user?.email?.split("@")[0] || "Name";

  useEffect(() => {
    if (module) {
      navigate("/", { replace: true });
    }
  }, [module, navigate]);

  const handleSelect = (module: AppModule) => {
    setModule(module);
    navigate("/", { replace: true });
  };

  return (
    <div className="app-shell relative overflow-hidden bg-[#eef1ef]">
      <div className="pointer-events-none absolute -top-24 right-[-34px] h-48 w-48 rounded-full bg-[#b9ccc5]" />
      <div className="pointer-events-none absolute -bottom-24 left-[-54px] h-44 w-72 rounded-[999px] bg-[#b3c9c0]" />
      <div className="pointer-events-none absolute -bottom-16 left-[-16px] h-24 w-[290px] rounded-[999px] bg-[#4f846f]" />

      <div className="app-content flex min-h-screen flex-col items-center px-4 py-8">
        <div className="mt-20 text-center">
          <p className="text-[14px] font-semibold text-primary/75">Welcome To</p>
          <h1 className="mt-1 text-[41px] font-black tracking-[0.14em] text-primary">INVENTRA</h1>
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-[26px] font-extrabold leading-tight tracking-tight text-primary">
            Hi!
            <br />
            {displayName}
          </h2>
        </div>

        <div className="mt-10 w-full max-w-[286px] space-y-5">
          {moduleCards.map((moduleCard) => (
            <button
              key={moduleCard.id}
              onClick={() => handleSelect(moduleCard.id)}
              className={`w-full rounded-[13px] bg-gradient-to-r ${moduleCard.gradient} px-5 py-4 text-left text-white shadow-[0_4px_10px_rgba(15,34,28,0.28)]`}
            >
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[23px] font-bold leading-none">{moduleCard.title}</p>
                  <p className="mt-2 whitespace-pre-line text-[11px] leading-snug text-white/90">{moduleCard.subtitle}</p>
                </div>
                <ArrowRight className="mb-1 h-6 w-6 shrink-0" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModuleSelect;
