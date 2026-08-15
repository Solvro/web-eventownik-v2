import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Statistics");
  return {
    title: t("title"),
  };
}

export default async function StatisticsLayout({
  children,
}: {
  children: Readonly<React.ReactNode>;
}) {
  const t = await getTranslations("Statistics");

  return (
    <div className="space-y-8 overflow-y-hidden px-0.5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
      </div>
      {children}
    </div>
  );
}
