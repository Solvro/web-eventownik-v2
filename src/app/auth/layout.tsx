import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { verifySession } from "@/lib/session";

export async function generateMetadata() {
  const t = await getTranslations("Auth");

  return {
    title: t("authentication"),
  };
}

export default async function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await verifySession();

  if (session != null) {
    redirect("/dashboard/events");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        {children}
      </div>
    </div>
  );
}
