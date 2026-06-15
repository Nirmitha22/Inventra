import { createContext, ReactNode, useContext, useMemo, useState } from "react";

export type AppModule = "household" | "retail";

interface ModuleContextType {
  module: AppModule | null;
  setModule: (module: AppModule) => void;
  clearModule: () => void;
}

const MODULE_KEY = "inventra_selected_module";

const ModuleContext = createContext<ModuleContextType>({
  module: null,
  setModule: () => {},
  clearModule: () => {},
});

const getInitialModule = (): AppModule | null => {
  const stored = localStorage.getItem(MODULE_KEY);
  if (stored === "household" || stored === "retail") {
    return stored;
  }
  return null;
};

export const ModuleProvider = ({ children }: { children: ReactNode }) => {
  const [module, setModuleState] = useState<AppModule | null>(() => getInitialModule());

  const setModule = (value: AppModule) => {
    localStorage.setItem(MODULE_KEY, value);
    setModuleState(value);
  };

  const clearModule = () => {
    localStorage.removeItem(MODULE_KEY);
    setModuleState(null);
  };

  const contextValue = useMemo(
    () => ({
      module,
      setModule,
      clearModule,
    }),
    [module]
  );

  return <ModuleContext.Provider value={contextValue}>{children}</ModuleContext.Provider>;
};

export const useModule = () => useContext(ModuleContext);
