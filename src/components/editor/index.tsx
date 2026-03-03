"use client";

import { Puck } from "@puckeditor/core";
import "@puckeditor/core/no-external.css";

import { PuckComposition } from "@/components/editor/composition";
import { getPuckConfig } from "@/components/editor/config";
import { overrides } from "@/components/editor/overrides";
import type { MessageTag } from "@/lib/extensions/tags";
import type { PuckData, PuckEventData, PuckMutationData } from "@/types/editor";
import type { EventForm } from "@/types/forms";

interface BlockEditorProps {
  initialData: Partial<PuckData>;
  tags: MessageTag[];
  forms: Pick<EventForm, "id" | "name">[];
  mutationData: PuckMutationData;
  eventData: PuckEventData;
}

// Render Puck editor
function Editor({
  initialData,
  tags,
  forms,
  mutationData,
  eventData,
}: BlockEditorProps) {
  const config = getPuckConfig({ tags, forms, eventData });
  return (
    <Puck
      config={config}
      data={initialData}
      overrides={{
        ...overrides,
        iframe: ({ children, document }) => {
          if (document !== undefined) {
            document.body.style.backgroundColor = "white";
            document.body.style.color = "black";
            document.body.style.fontFamily = "Arial, system-ui, sans-serif";
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
