"use client";

import {
  QueryClient,
  QueryClientProvider,
  isServer,
} from "@tanstack/react-query";
import { Provider as JotaiProvider } from "jotai";
import { NavigationGuardProvider } from "next-navigation-guard";
import { ThemeProvider } from "next-themes";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: use singleton pattern
    browserQueryClient ??= makeQueryClient();
    return browserQueryClient;
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

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
