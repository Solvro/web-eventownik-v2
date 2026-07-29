"use client";

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
  return (
    <DeleteResourcePopup
      resourceName={mailName}
      resourceType="Szablon"
      onDelete={async () => deleteEventMail(eventUuid, mailId)}
      onSuccess={() => {
        location.reload();
      }}
      triggerTitle="Usuń szablon"
    />
  );
}

export { DeleteEmailPopup };
