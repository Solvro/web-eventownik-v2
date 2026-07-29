"use client";

import { useRouter } from "next/navigation";

import { DeleteResourcePopup } from "@/components/delete-resource-popup";

import { deleteEventForm } from "./actions";

function DeleteFormPopup({
  eventUuid,
  formId,
  formName,
}: {
  eventUuid: string;
  formId: string;
  formName: string;
}) {
  const router = useRouter();

  return (
    <DeleteResourcePopup
      resourceName={formName}
      resourceType="Formularz"
      onDelete={async () => deleteEventForm(eventUuid, formId)}
      onSuccess={() => {
        router.refresh();
      }}
    />
  );
}

export { DeleteFormPopup };
