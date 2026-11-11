"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { DeleteResourcePopup } from "@/components/delete-resource-popup";

import { deleteEventForm } from "./actions";

function DeleteFormPopup({
  eventUuid,
  formUuid,
  formName,
}: {
  eventUuid: string;
  formUuid: string;
  formName: string;
}) {
  const t = useTranslations("Dashboard");
  const router = useRouter();

  return (
    <DeleteResourcePopup
      resourceName={formName}
      resourceType={t("form")}
      onDelete={async () => deleteEventForm(eventUuid, formUuid)}
      onSuccess={() => {
        router.refresh();
      }}
    />
  );
}

export { DeleteFormPopup };
