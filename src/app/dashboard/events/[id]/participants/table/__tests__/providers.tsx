import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import { useMemo } from "react";

import { Toaster } from "@/components/ui/toaster";

import plMessages from "../../../../../../../../messages/pl.json";

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const client = useMemo(
    () =>
      new QueryClient({
        // Tests pass participants as initialData - don't refetch them over the network
        defaultOptions: { queries: { staleTime: Infinity, retry: false } },
      }),
    [],
  );

  return (
    <NextIntlClientProvider locale="pl" messages={plMessages}>
      <QueryClientProvider client={client}>
        <Toaster />
        {children}
      </QueryClientProvider>
    </NextIntlClientProvider>
  );
}
