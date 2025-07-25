import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ParticipantTable } from "@/app/dashboard/events/[id]/participants/table/participants-table";
import type { Attribute } from "@/types/attributes";
import type { Participant } from "@/types/participant";

export function renderTable(
  participants: Participant[],
  attributes: Attribute[],
) {
  const user = userEvent.setup();

  render(
    <ParticipantTable
      eventId="100"
      participants={participants}
      attributes={attributes}
      emails={null}
      blocks={null}
    />,
  );

  return { user };
}

export function getDataRows() {
  return screen.getAllByRole("row").slice(1); //Skip header row
}
