import { AlertCircleIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { EventCardForSuperadmin } from "@/components/event-card";
import { PageNavigation } from "@/components/page-navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PaginatedResponse } from "@/lib/api";
import { API_URL } from "@/lib/api";
import { getBackend, pageNumber, pageSize, paginatedUrl } from "@/lib/backend";
import { verifySession } from "@/lib/session";
import type { V3Event } from "@/types/v3";

import { FetchErrorAlert } from "../fetch-error-alert";
import { checkIfSuperAdmin } from "./actions";

export async function generateMetadata() {
  const t = await getTranslations("Dashboard");

  return {
    title: t("superadminPanel"),
  };
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const page = pageNumber(query.page);
  const take = pageSize(query.take);
  const search =
    typeof query.search === "string" ? query.search.trim().slice(0, 200) : "";
  const pageHref = (nextPage: number) => {
    const parameters = new URLSearchParams({
      page: String(nextPage),
      take: String(take),
    });
    if (search !== "") {
      parameters.set("search", search);
    }
    return `/dashboard/admin?${parameters.toString()}`;
  };
  const session = await verifySession();
  if (session == null || typeof session.bearerToken !== "string") {
    notFound();
  }
  const t = await getTranslations("Dashboard");
  const { bearerToken } = session;

  const isSuperAdmin = await checkIfSuperAdmin(bearerToken);

  if (!isSuperAdmin) {
    return <FetchErrorAlert message="notSuperAdmin" />;
  }

  let result: PaginatedResponse<V3Event>;
  try {
    const url = paginatedUrl(`${API_URL}/events`, page, take);
    url.searchParams.set("sort", "createdAt:desc");
    if (search !== "") {
      url.searchParams.set("search", search);
    }
    result = await getBackend<PaginatedResponse<V3Event>>(url, {
      headers: { Authorization: `Bearer ${bearerToken}` },
    });
  } catch {
    return <FetchErrorAlert />;
  }
  if (page > Math.max(result.meta.pageCount, 1)) {
    redirect(pageHref(Math.max(result.meta.pageCount, 1)));
  }
  const events = result.data;

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-3xl font-bold">{t("superadminPanel")}</h1>
        </div>
        <Alert>
          <AlertCircleIcon />
          <AlertTitle className="line-clamp-0">
            {t("superadminPanelInfo")}
          </AlertTitle>
          <AlertDescription className="text-foreground inline">
            {t.rich("superadminEventsDescr", {
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </AlertDescription>
        </Alert>
        <form
          action="/dashboard/admin"
          className="flex flex-wrap items-center gap-2"
        >
          <Input
            name="search"
            type="search"
            aria-label={t("searchEvents")}
            placeholder={t("searchEventsPlaceholder")}
            defaultValue={search}
            key={search}
            maxLength={200}
            className="w-full sm:max-w-md"
          />
          <input type="hidden" name="take" value={take} />
          <Button type="submit" variant="outline">
            {t("searchEvents")}
          </Button>
          {search === "" ? null : (
            <Button asChild variant="ghost">
              <Link href={`/dashboard/admin?take=${String(take)}`}>
                {t("clearSearch")}
              </Link>
            </Button>
          )}
          <p className="text-muted-foreground text-sm" aria-live="polite">
            {t("eventSearchCount", { count: result.meta.itemCount })}
          </p>
        </form>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {events.length > 0 ? (
            events.map((event) => (
              <EventCardForSuperadmin
                key={event.uuid}
                event={event}
                bearerToken={bearerToken}
              />
            ))
          ) : (
            <div className="col-span-full">
              <p className="text-muted-foreground">{t("noMatchingEvents")}</p>
            </div>
          )}
        </div>
      </div>
      <PageNavigation meta={result.meta} href={pageHref} />
    </div>
  );
}
