"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider } from "jotai";
import { NavigationGuardProvider } from "next-navigation-guard";
import { ThemeProvider } from "next-themes";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NavigationGuardProvider>{children}</NavigationGuardProvider>
        </ThemeProvider>
      </JotaiProvider>
    </QueryClientProvider>
  );
}
