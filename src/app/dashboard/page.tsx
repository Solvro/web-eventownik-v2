import { useTranslations } from "next-intl";

import { CreateEventForm } from "./(create-event)/create-event-form";

export default function DashboardHomepage() {
  const t = useTranslations("Dashboard");

  return (
    <main id="main-content" className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">{t("organizerPanel")}</h1>
      <CreateEventForm />
    </main>
  );
}
