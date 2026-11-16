import { useTranslations } from "next-intl";

export default function EventEmailEditorLoadingPage() {
  const t = useTranslations("Email");

  return (
    <p className="my-auto animate-pulse self-center">{t("loadingEditor")}</p>
  );
}
