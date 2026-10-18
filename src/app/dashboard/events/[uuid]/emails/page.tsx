import { Mail } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { PageNavigation } from "@/components/page-navigation";
import { pageNumber, pageSize } from "@/lib/backend";

import { CreateEmailTemplateForm } from "./create-email-template-form";
import {
  getEventAttributes,
  getEventEmails,
  getEventForms,
} from "./data-access";
import { SortableEmailGrid } from "./sortable-email-grid";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Dashboard");

  return {
    title: t("emailTemplates"),
  };
}

export default async function DashboardEventEmailTemplatesPage({
  params,
  searchParams,
}: {
  params: Promise<{ uuid: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getTranslations("Dashboard");
  const { uuid } = await params;
  const query = await searchParams;
  const page = pageNumber(query.page);
  const take = pageSize(query.take);
  const [result, attributes, forms] = await Promise.all([
    getEventEmails(uuid, page, take),
    getEventAttributes(uuid),
    getEventForms(uuid),
  ]);
  if (result !== null && page > Math.max(result.meta.pageCount, 1)) {
    redirect(
      `/dashboard/events/${uuid}/emails?page=${String(Math.max(result.meta.pageCount, 1))}&take=${String(take)}`,
    );
  }
  const templates = result?.data ?? null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-3xl font-bold">{t("emailTemplates")}</h1>
        <CreateEmailTemplateForm
          eventUuid={uuid}
          eventAttributes={attributes}
          eventForms={forms}
        />
      </div>
      {templates === null ? (
        <div className="flex flex-wrap justify-center gap-8 sm:justify-start">
          <p className="text-red-600">{t("templatesLoadError")}</p>
        </div>
      ) : templates.length > 0 ? (
        <SortableEmailGrid
          templates={templates}
          eventUuid={uuid}
          offset={(page - 1) * take}
        />
      ) : (
        <div className="flex flex-wrap justify-center gap-8 sm:justify-start">
          <div className="flex w-full flex-col items-center justify-center py-12 text-center">
            <Mail className="text-muted-foreground mb-4 size-12" />
            <h3 className="text-muted-foreground text-lg">
              {t("emptyEmailTemplates")}
            </h3>
          </div>
        </div>
      )}
      {result === null ? null : (
        <PageNavigation
          meta={result.meta}
          href={(nextPage) =>
            `/dashboard/events/${uuid}/emails?page=${String(nextPage)}&take=${String(take)}`
          }
        />
      )}
    </div>
  );
}
