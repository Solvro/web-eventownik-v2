"use client";

import { useTranslations } from "next-intl";

import { DeleteResourcePopup } from "@/components/delete-resource-popup";

import { deleteEventMail } from "./actions";

function DeleteEmailPopup({
  eventUuid,
  mailUuid,
  mailName,
}: {
  eventUuid: string;
  mailUuid: string;
  mailName: string;
}) {
  const t = useTranslations("Dashboard");

  return (
    <DeleteResourcePopup
      resourceName={mailName}
      resourceType={t("template")}
      onDelete={async () => deleteEventMail(eventUuid, mailUuid)}
      onSuccess={() => {
        location.reload();
      }}
    />
  );
}

export { DeleteEmailPopup };
