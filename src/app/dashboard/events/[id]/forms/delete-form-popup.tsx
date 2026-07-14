"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { DeleteResourcePopup } from "@/components/delete-resource-popup";

import { deleteEventForm } from "./actions";

function DeleteFormPopup({
  eventId,
  formId,
  formName,
}: {
  eventId: string;
  formId: string;
  formName: string;
}) {
  const t = useTranslations("Dashboard");
  const router = useRouter();

  return (
    <DeleteResourcePopup
      resourceName={formName}
      resourceType={t("form")}
      onDelete={async () => deleteEventForm(eventId, formId)}
      onSuccess={() => {
        router.refresh();
      }}
    />
  );
}

export { DeleteFormPopup };
