import { useTranslations } from "next-intl";

export default function DashboardSettingsPage() {
  const t = useTranslations("Dashboard");

  return <h1 className="text-3xl font-bold">{t("accountSettings")}</h1>;
}
