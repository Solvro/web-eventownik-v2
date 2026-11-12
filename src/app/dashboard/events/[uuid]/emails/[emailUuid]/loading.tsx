import { useTranslations } from "next-intl";

export default function EventEmailLoadingPage() {
  const t = useTranslations("Email");

  return (
    <p className="my-auto animate-pulse self-center">{t("loadingEditor")}</p>
  );
}
