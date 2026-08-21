import { Mail } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

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
}: {
  params: Promise<{ uuid: string }>;
}) {
  const t = await getTranslations("Dashboard");
  const { uuid } = await params;
  const templates = await getEventEmails(uuid);
  const attributes = await getEventAttributes(uuid);
  const forms = await getEventForms(uuid);

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
        <SortableEmailGrid templates={templates} eventUuid={uuid} />
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
    </div>
  );
}
