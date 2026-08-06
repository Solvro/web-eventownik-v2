/* eslint-disable unicorn/prevent-abbreviations */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useParticipantsData } from "@/hooks/use-participants-data";
import { useParticipantsTable } from "@/hooks/use-participants-table";
import type { Attribute } from "@/types/attributes";
import type { EventEmail } from "@/types/emails";
import type { FlattenedParticipant, Participant } from "@/types/participant";

import { TableMenu } from "../components/buttons/table-menu";
import { ParticipantTable } from "../core/participants-table";
import { Providers } from "./providers";

function TableWrapper({
  participants,
  attributes,
  emails,
}: {
  participants: Participant[];
  attributes: Attribute[];
  emails: EventEmail[];
}) {
  const {
    data,
    setData,
    deleteManyParticipants,
    isLoading: isQuerying,
  } = useParticipantsData("100", participants);

  const { table, globalFilter } = useParticipantsTable({
    data,
    attributes,
    blocks: [],
    eventId: "100",
    onUpdateData: (rowIndex: number, value: FlattenedParticipant) => {
      setData((prev) =>
        prev.map((row, index) => (index === rowIndex ? value : row)),
      );
    },
  });

  return (
    <>
      <TableMenu
        table={table}
        eventId="100"
        globalFilter={globalFilter}
        isQuerying={isQuerying}
        emails={emails}
        attributes={attributes}
        blocks={[]}
        deleteManyParticipants={async (ids) => {
          await deleteManyParticipants(ids);
          table.resetRowSelection();
        }}
      />
      <ParticipantTable table={table} />
    </>
  );
}

export function renderTable(
  participants: Participant[],
  attributes: Attribute[],
  emails: EventEmail[] = [],
) {
  const user = userEvent.setup();

  render(
    <TableWrapper
      participants={participants}
      attributes={attributes}
      emails={emails}
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
