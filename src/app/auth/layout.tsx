import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("Auth");

  return {
    title: t("authentication"),
  };
}

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen items-center justify-center px-2">
      <div className="flex max-w-lg flex-col items-center gap-8">
        {children}
      </div>
    </div>
  );
}
