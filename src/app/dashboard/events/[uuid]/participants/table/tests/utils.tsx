import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ParticipantTable } from "@/app/dashboard/events/[uuid]/participants/table/participants-table";
import type { Attribute } from "@/types/attributes";
import type { EventEmail } from "@/types/emails";
import type { Participant } from "@/types/participant";

import { Providers } from "./providers";

export function renderTable(
  participants: Participant[],
  attributes: Attribute[],
  emails: EventEmail[] = [],
) {
  const user = userEvent.setup();

  render(
    <ParticipantTable
      eventUuid="e171f4c9-e2be-47fb-831c-ab783c2bf1ff"
      participants={participants}
      attributes={attributes}
      emails={emails}
      blocks={null}
    />,
    { wrapper: Providers },
  );

  const getDataRows = () => {
    return screen.getAllByRole("row").slice(1); //Skip header row
  };

  return {
    user,
    getDataRows,
    getDataRow: (rowIndex: number) => {
      return getDataRows()[rowIndex];
    },
    getExpandedRow: (parentRowIndex: number) => {
      return getDataRows()[parentRowIndex + 1]; // +1 from 'parent' row
    },
    getDisplayedValuesFromColumn: (columnIndex: number) => {
      const rows = getDataRows();
      return rows.map((row) => {
        const cells = within(row).getAllByRole("cell");
        return cells[columnIndex].textContent;
      });
    },
    resetFiltersButton: screen.getByRole("button", {
      name: /resetuj wszystkie filtry/i,
    }),
    resetSortingButton: screen.getByRole("button", {
      name: /resetuj sortowanie/i,
    }),
    exportButton: screen.getByRole("button", { name: /eksportuj/i }),
    globalSearchInput: screen.getByPlaceholderText(/wyszukaj/i),
    sendMailsDialogTrigger: screen.getByRole("button", { name: /wyślij/i }),
  };
}
