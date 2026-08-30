import { format } from "date-fns";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { EventPageLayout } from "@/app/[eventSlug]/event-page-layout";
import type { Event } from "@/types/event";
import type { EventForm } from "@/types/forms";

interface FormClosedViewProps {
  event: Event;
  form: EventForm;
  isRegistration?: boolean;
}

export function FormClosedView({
  event,
  form,
  isRegistration = true,
}: FormClosedViewProps) {
  const t = useTranslations("Event");

  const getFormStatus = async () => {
    if (form.openCondition === "MANUAL") {
      return isRegistration
        ? t("registrationDisabled")
        : t("organizerDisabledForm");
    }

    if (form.openDate !== null && form.closeDate !== null) {
      const now = new Date();

      const openDateFormatted = format(form.openDate, "dd.MM.yyyy HH:mm");
      const closeDateFormatted = format(form.closeDate, "dd.MM.yyyy HH:mm");

      const labelFuture = isRegistration
        ? t("registrationWillBeAvailable")
        : t("formWillBeAvailable");
      const labelPast = isRegistration
        ? t("registrationWasAvailable")
        : t("formWasAvailable");

      return t.rich("periodLabel", {
        label: new Date(form.openDate) > now ? labelFuture : labelPast,
        openDate: openDateFormatted,
        closeDate: closeDateFormatted,
        strong: (chunks) => <strong>{chunks}</strong>,
      });
    }

    return null;
  };

  return (
    <EventPageLayout
      event={event}
      description={form.description}
      variant="form"
    >
      <div className="border-border bg-card flex flex-col items-center justify-center gap-4 rounded-lg border p-8 text-center">
        <Info className="text-muted-foreground size-10" aria-hidden="true" />

        <div className="space-y-2">
          <h1 className="text-xl font-semibold">
            {isRegistration ? (
              <>
                {t.rich("registrationUnavailable", {
                  name: event.name,
                  strong: (chunks) => <strong>{chunks}</strong>,
                })}
              </>
            ) : (
              <>
                {t.rich("formUnavailable", {
                  name: form.name,
                  strong: (chunks) => <strong>{chunks}</strong>,
                })}
              </>
            )}
          </h1>
        </div>

        <p className="text-muted-foreground text-sm">{getFormStatus()}</p>

        <Link
          href={`/${event.slug}`}
          className="text-primary text-sm font-medium underline underline-offset-4"
        >
          {t("backToEventPage")}
        </Link>
      </div>
    </EventPageLayout>
  );
}
