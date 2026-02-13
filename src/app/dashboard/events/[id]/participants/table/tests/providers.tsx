import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import { useMemo } from "react";

import { Toaster } from "@/components/ui/toaster";

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const client = useMemo(() => new QueryClient(), []);

  return (
    <NextIntlClientProvider locale="pl" messages={{}}>
      <QueryClientProvider client={client}>
        <Toaster />
        {children}
      </QueryClientProvider>
    </NextIntlClientProvider>
  );
}
