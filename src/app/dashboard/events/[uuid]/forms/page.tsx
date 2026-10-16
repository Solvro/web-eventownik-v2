import { FileText } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { FetchErrorAlert } from "@/app/dashboard/fetch-error-alert";
import { PageNavigation } from "@/components/page-navigation";
import { pageNumber, pageSize } from "@/lib/backend";

import { CreateEventFormForm } from "./create-event-form-form";
import { getEventAttributes, getEventForms } from "./data-access";
import { FormGrid } from "./form-grid";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Sidebar");

  return {
    title: t("forms"),
  };
}

export default async function DashboardEventFormsPage({
  params,
  searchParams,
}: {
  params: Promise<{ uuid: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { uuid } = await params;
  const query = await searchParams;
  const page = pageNumber(query.page);
  const take = pageSize(query.take);
  const [result, attributes] = await Promise.all([
    getEventForms(uuid, page, take),
    getEventAttributes(uuid),
  ]);
  if (result === null) {
    return <FetchErrorAlert />;
  }
  if (page > Math.max(result.meta.pageCount, 1)) {
    redirect(
      `/dashboard/events/${uuid}/forms?page=${String(Math.max(result.meta.pageCount, 1))}&take=${String(take)}`,
    );
  }
  const forms = result.data;
  const t = await getTranslations("EventDetails");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-3xl font-bold">Formularze</h1>
        <CreateEventFormForm eventUuid={uuid} attributes={attributes} />
      </div>
      {forms.length > 0 ? (
        <FormGrid forms={forms} eventUuid={uuid} offset={(page - 1) * take} />
      ) : (
        <div className="flex flex-wrap justify-center gap-8 sm:justify-start">
          <div className="flex w-full flex-col items-center justify-center py-12 text-center">
            <FileText className="text-muted-foreground mb-4 size-12" />
            <h3 className="text-muted-foreground text-lg">{t("noFormsYet")}</h3>
          </div>
        </div>
      )}
      <PageNavigation
        meta={result.meta}
        href={(nextPage) =>
          `/dashboard/events/${uuid}/forms?page=${String(nextPage)}&take=${String(take)}`
        }
      />
    </div>
  );
}
