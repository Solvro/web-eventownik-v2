"use client";

import { Puck } from "@puckeditor/core";
import "@puckeditor/core/no-external.css";
import { useLocale, useTranslations } from "next-intl";

import { PuckComposition } from "@/components/editor/composition";
import { getPuckConfig } from "@/components/editor/config";
import { createOverrides } from "@/components/editor/overrides";
import type { MessageTag } from "@/lib/message-tags";
import type { EventAttribute } from "@/types/attributes";
import type { PuckData, PuckEventData, PuckMutationData } from "@/types/editor";
import type { EventForm } from "@/types/forms";

interface BlockEditorProps {
  initialData: Partial<PuckData>;
  tags: MessageTag[];
  forms: Pick<EventForm, "id" | "name">[];
  attributes: Pick<EventAttribute, "id" | "name">[];
  mutationData: PuckMutationData;
  eventData: PuckEventData;
}

// Render Puck editor
function Editor({
  initialData,
  tags,
  forms,
  attributes,
  mutationData,
  eventData,
}: BlockEditorProps) {
  const t = useTranslations("Editor");
  const tEmailTriggers = useTranslations("EmailTriggers");
  const tMessageTags = useTranslations("MessageTags");

  const locale = useLocale();
  const config = getPuckConfig({
    tags,
    forms,
    attributes,
    eventData,
    t,
    tEmailTriggers,
    tMessageTags,
  });

  return (
    <Puck
      key={locale} // Force re-render when locale changes
      config={config}
      data={initialData}
      overrides={{
        ...createOverrides(t),
        iframe: ({ children, document }) => {
          if (document !== undefined) {
            document.body.style.backgroundColor = "white";
            document.body.style.color = "black";
            document.body.style.fontFamily = "Arial, Helvetica, sans-serif";
          }
          // eslint-disable-next-line react/jsx-no-useless-fragment
          return <>{children}</>;
        },
      }}
    >
      <PuckComposition mutationData={mutationData} />
    </Puck>
  );
}

export { Editor };
