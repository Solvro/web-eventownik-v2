"use client";

import type { EventEmail } from "@/types/emails";

import { EmailTemplateEntry } from "./template-entry";

// TODO(v3): Restore drag-and-drop reordering (`SortableTileGrid`) once the backend
// returns and sorts by the template order, and supports reordering
function SortableEmailGrid({
  templates,
  eventUuid,
}: {
  templates: EventEmail[];
  eventUuid: string;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-8 sm:justify-start">
      {templates.map((template) => (
        <EmailTemplateEntry
          key={template.id}
          emailTemplate={template}
          eventUuid={eventUuid}
        />
      ))}
    </div>
  );
}

export { SortableEmailGrid };
