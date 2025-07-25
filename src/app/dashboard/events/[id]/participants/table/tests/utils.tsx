import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ParticipantTable } from "@/app/dashboard/events/[id]/participants/table/participants-table";
import type { Attribute } from "@/types/attributes";
import type { Participant } from "@/types/participant";

import { Providers } from "./providers";

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
    { wrapper: Providers },
  );

  return { user };
}

export function getDataRows() {
  return screen.getAllByRole("row").slice(1); //Skip header row
}

export function getRow(rowIndex: number) {
  return getDataRows()[rowIndex];
}

export function getSubRow(parentRowIndex: number) {
  return getDataRows()[parentRowIndex + 1]; // +1 from 'parent' row
}
