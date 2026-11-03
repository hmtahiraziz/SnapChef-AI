import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type BootContextValue = {
  /** True once auth + onboarding routing has landed on the correct surface. */
  navSettled: boolean;
  setNavSettled: (settled: boolean) => void;
};

const BootContext = createContext<BootContextValue | null>(null);

export function BootProvider({ children }: { children: ReactNode }) {
  const [navSettled, setNavSettled] = useState(false);
  const value = useMemo(() => ({ navSettled, setNavSettled }), [navSettled]);
  return <BootContext.Provider value={value}>{children}</BootContext.Provider>;
}

export function useBoot() {
  const ctx = useContext(BootContext);
  if (!ctx) {
    throw new Error('useBoot must be used within BootProvider');
  }
  return ctx;
}

export function useBootOptional() {
  return useContext(BootContext);
}
