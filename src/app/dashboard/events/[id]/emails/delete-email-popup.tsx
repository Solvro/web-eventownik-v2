"use client";

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
  return (
    <DeleteResourcePopup
      resourceName={mailName}
      resourceType="Szablon"
      onDelete={async () => deleteEventMail(eventId, mailId)}
      onSuccess={() => {
        location.reload();
      }}
      triggerTitle="Usuń szablon"
    />
  );
}

export { DeleteEmailPopup };
