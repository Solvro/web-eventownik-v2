"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { DeleteResourcePopup } from "@/components/delete-resource-popup";

import { deleteBlock } from "../actions";

function DeleteBlockPopup({
  eventUuid,
  blockUuid,
  blockName,
  attributeUuid,
}: {
  eventUuid: string;
  blockUuid: string;
  blockName: string;
  attributeUuid: string;
}) {
  const t = useTranslations("Dashboard");
  const router = useRouter();

  return (
    <DeleteResourcePopup
      resourceName={blockName}
      resourceType="Blok"
      onDelete={async () => deleteBlock(eventUuid, blockUuid, attributeUuid)}
      onSuccess={() => {
        router.refresh();
      }}
      triggerClassName="text-destructive"
    />
  );
}

export { DeleteBlockPopup };
