/* eslint-disable unicorn/prevent-abbreviations */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";

import { useParticipantsData } from "@/hooks/use-participants-data";
import { useParticipantsTable } from "@/hooks/use-participants-table";
import { API_URL } from "@/lib/api";
import { server } from "@/tests/msw/node";
import type { FlattenedParticipant, Participant } from "@/types/participant";
import type {
  V3Attribute as Attribute,
  V3EmailSummary as EventEmail,
} from "@/types/v3";

import { TableMenu } from "../components/buttons/table-menu";
import { ParticipantTable } from "../core/participants-table";
import { Providers } from "./providers";

export const EVENT_UUID = "e171f4c9-e2be-47fb-831c-ab783c2bf1ff";
const EMPTY_BLOCKS: [] = [];

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
  } = useParticipantsData(EVENT_UUID, participants);

  const { table, globalFilter } = useParticipantsTable({
    data,
    attributes,
    blocks: EMPTY_BLOCKS,
    eventUuid: EVENT_UUID,
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
        eventUuid={EVENT_UUID}
        globalFilter={globalFilter}
        isQuerying={isQuerying}
        emails={emails}
        attributes={attributes}
        blocks={EMPTY_BLOCKS}
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
  server.use(
    http.get(`${API_URL}/events/${EVENT_UUID}/attributes`, () =>
      HttpResponse.json({ data: attributes, meta: { hasNextPage: false } }),
    ),
  );

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
