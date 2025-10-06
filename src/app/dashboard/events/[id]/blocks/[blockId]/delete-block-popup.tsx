"use client";

import { useRouter } from "next/navigation";

import { DeleteResourcePopup } from "@/components/delete-resource-popup";

import { deleteBlock } from "../actions";

function DeleteBlockPopup({
  eventId,
  blockId,
  blockName,
  attributeId,
}: {
  eventId: string;
  blockId: string;
  blockName: string;
  attributeId: string;
}) {
  const router = useRouter();

  return (
    <DeleteResourcePopup
      resourceName={blockName}
      resourceType="Blok"
      onDelete={async () => deleteBlock(eventId, blockId, attributeId)}
      onSuccess={() => {
        router.refresh();
      }}
      triggerClassName="text-destructive"
    />
  );
}

export { DeleteBlockPopup };
