"use client";

import { useRouter } from "next/navigation";

import { DeleteResourcePopup } from "@/components/delete-resource-popup";

import { deleteBlock } from "../actions";

function DeleteBlockPopup({
  eventUuid,
  blockUuid,
  blockName,
  attributeId,
}: {
  eventUuid: string;
  blockUuid: string;
  blockName: string;
  attributeId: string;
}) {
  const router = useRouter();

  return (
    <DeleteResourcePopup
      resourceName={blockName}
      resourceType="Blok"
      onDelete={async () => deleteBlock(eventUuid, blockUuid, attributeId)}
      onSuccess={() => {
        router.refresh();
      }}
      triggerClassName="text-destructive"
    />
  );
}

export { DeleteBlockPopup };
