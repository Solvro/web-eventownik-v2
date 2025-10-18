import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Uwierzytelnianie",
};

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex max-w-lg flex-col items-center gap-8">
        {children}
      </div>
    </div>
  );
}
