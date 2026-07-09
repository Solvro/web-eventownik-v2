"use client";

import { useTranslations } from "next-intl";

import { DeleteResourcePopup } from "@/components/delete-resource-popup";

import { deleteEventMail } from "./actions";

function DeleteEmailPopup({
  eventId,
  mailId,
  mailName,
}: {
  eventId: string;
  mailId: string;
  mailName: string;
}) {
  const t = useTranslations("Dashboard");
  const tEventDetails = useTranslations("EventDetails");

  return (
    <DeleteResourcePopup
      resourceName={mailName}
      resourceType={t("template")}
      onDelete={async () => deleteEventMail(eventId, mailId, tEventDetails)}
      onSuccess={() => {
        location.reload();
      }}
    />
  );
}

export { DeleteEmailPopup };
