"use client";

import { Provider as JotaiProvider } from "jotai";
import { NavigationGuardProvider } from "next-navigation-guard";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <JotaiProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <NavigationGuardProvider>{children}</NavigationGuardProvider>
      </ThemeProvider>
    </JotaiProvider>
  );
}
