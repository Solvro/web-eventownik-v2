import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function FetchErrorAlert({
  message = "fetchDataError",
}: {
  message?: "fetchDataError" | "notSuperAdmin";
}) {
  const t = useTranslations("Dashboard");

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <Alert variant="destructive">
        <AlertCircle className="size-6" />
        <AlertTitle>{t("fetchDataError")}</AlertTitle>
        <AlertDescription>{t(message)}</AlertDescription>
      </Alert>
    </div>
  );
}
