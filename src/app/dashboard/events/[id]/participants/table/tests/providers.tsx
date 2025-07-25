import { Toaster } from "@/components/ui/toaster";

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Toaster />
      {children}
    </>
  );
}
