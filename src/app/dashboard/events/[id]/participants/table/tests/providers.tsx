import { NextIntlClientProvider } from "next-intl";

import { Toaster } from "@/components/ui/toaster";

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NextIntlClientProvider locale="pl" messages={{}}>
      <Toaster />
      {children}
    </NextIntlClientProvider>
  );
}
