import { AlertCircleIcon, CalendarDays, Shield } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CreateEventForm } from "@/app/dashboard/(create-event)/create-event-form";
import { EventCard } from "@/components/event-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { Event } from "@/types/event";

import { checkIfSuperAdmin } from "../admin/actions";
import { FetchErrorAlert } from "../fetch-error-alert";

export async function generateMetadata() {
  const t = await getTranslations("Dashboard");

  return {
    title: t("myEvents"),
  };
}

export default async function EventListPage() {
  const session = await verifySession();
  const t = await getTranslations("Dashboard");

  if (session == null || typeof session.bearerToken !== "string") {
    notFound();
  }
  const { bearerToken } = session;
  const response = await fetch(`${API_URL}/events`, {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  });

  if (!response.ok) {
    return <FetchErrorAlert />;
  }

  // NOTE: Response structure refactor
  const events = ((await response.json()) as { data: Event[] }).data.toSorted(
    (a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    },
  );

  const isSuperAdmin = await checkIfSuperAdmin(bearerToken);

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-3xl font-bold">{t("myEvents")}</h1>
          <div className="flex items-center gap-2">
            <CreateEventForm />
            {isSuperAdmin ? (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className="hidden border border-amber-400 bg-amber-200/50 hover:bg-amber-200/70 sm:inline-flex dark:border-amber-400/70 dark:bg-amber-200/20 dark:hover:bg-amber-200/30"
                >
                  <Link href="/dashboard/admin">
                    <Shield />
                    {t("superadminPanel")}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="ml-auto size-12 border border-amber-400 bg-amber-200/50 hover:bg-amber-200/70 sm:hidden dark:border-amber-400/70 dark:bg-amber-200/20 dark:hover:bg-amber-200/30"
                >
                  <Link href="/dashboard/admin">
                    <Shield />
                  </Link>
                </Button>
              </>
            ) : null}
          </div>
        </div>
        <Alert>
          <AlertCircleIcon />
          <AlertTitle className="line-clamp-0">
            {t("importantInfoForOrganizers")}
          </AlertTitle>
          <AlertDescription className="text-foreground inline">
            {t("pilotVersionNotice")}{" "}
            <a href="mailto:eventownik@pwr.edu.pl">eventownik@pwr.edu.pl</a>
          </AlertDescription>
        </Alert>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {events.length > 0 ? (
            events.map((event) => <EventCard key={event.uuid} event={event} />)
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <CalendarDays className="text-muted-foreground mb-4 size-12" />
              <h3 className="text-muted-foreground text-lg">
                {t("noEventsYet")}
              </h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
