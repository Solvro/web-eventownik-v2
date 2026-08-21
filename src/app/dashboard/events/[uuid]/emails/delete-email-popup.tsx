"use client";

import { useTranslations } from "next-intl";

import { DeleteResourcePopup } from "@/components/delete-resource-popup";

import { deleteEventMail } from "./actions";

function DeleteEmailPopup({
  eventUuid,
  mailId,
  mailName,
}: {
  eventUuid: string;
  mailId: string;
  mailName: string;
}) {
  const t = useTranslations("Dashboard");

  return (
    <DeleteResourcePopup
      resourceName={mailName}
      resourceType={t("template")}
      onDelete={async () => deleteEventMail(eventUuid, mailId)}
      onSuccess={() => {
        location.reload();
      }}
    />
  );
}

export { DeleteEmailPopup };
