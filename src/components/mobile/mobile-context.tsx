"use client";

import { createContext, useContext } from "react";

import type { MobilePublicConfig } from "@/types/mobile";

interface MobileContextValue {
  eventSlug: string;
  config: MobilePublicConfig;
  /**
   * Class and inline variables of the app wrapper. Dialogs render outside that
   * wrapper (at the end of the page), so they must be given these to keep the
   * app's font, colours and accent.
   */
  surface: { className: string; style: React.CSSProperties };
}

const MobileContext = createContext<MobileContextValue | null>(null);

export function MobileProvider({
  eventSlug,
  config,
  surface,
  children,
}: MobileContextValue & { children: React.ReactNode }) {
  return (
    <MobileContext.Provider value={{ eventSlug, config, surface }}>
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
