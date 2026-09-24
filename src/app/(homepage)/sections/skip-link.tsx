import { useTranslations } from "next-intl";

export function SkipLink() {
  const t = useTranslations("Homepage");

  return (
    <a
      href="#main-content"
      className="bg-background text-foreground focus-visible:ring-ring sr-only rounded-md px-4 py-2 font-medium focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus-visible:ring-[3px]"
    >
      {t("skipToMainContent")}
    </a>
  );
}
