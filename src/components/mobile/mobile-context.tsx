"use client";

import { createContext, useContext } from "react";

import type { MobilePublicConfig } from "@/types/mobile";

interface MobileContextValue {
  eventSlug: string;
  config: MobilePublicConfig;
}

const MobileContext = createContext<MobileContextValue | null>(null);

export function MobileProvider({
  eventSlug,
  config,
  children,
}: MobileContextValue & { children: React.ReactNode }) {
  return (
    <MobileContext.Provider value={{ eventSlug, config }}>
      {children}
    </MobileContext.Provider>
  );
}

export function useMobile(): MobileContextValue {
  const value = useContext(MobileContext);
  if (value === null) {
    throw new Error("useMobile must be used inside MobileProvider");
  }
  return value;
}
