"use client";

import type { RowData } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Attribute } from "@/types/attributes";
import type { EventEmail } from "@/types/emails";
import type { Participant } from "@/types/participant";

import {
  deleteManyParticipants as deleteManyParticipantsAction,
  deleteParticipant as deleteParticipantAction,
} from "../actions";
import { generateColumns } from "./columns";
import { flattenParticipants } from "./data";
import { TableMenu } from "./table-menu";
import { TableRowForm } from "./table-row-form";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, value: TData) => void;
    isRowLoading: (rowIndex: number) => boolean;
    setRowLoading: (rowIndex: number, isLoading: boolean) => void;
  }
}

/**
 * To seamlessly navigate during working on this component
 * get familiar with [Tanstack Table V8 docs](https://tanstack.com/table/latest/docs/introduction)
 *
 * There is a lot of space to improve since the first version of the component was made in a hurry 😭.
 */
export function ParticipantTable({
  participants,
  attributes,
  emails,
  eventId,
}: {
  participants: Participant[];
  attributes: Attribute[];
  emails: EventEmail[] | null;
  eventId: string;
}) {
  const { toast } = useToast();
  const [isQuerying, setIsQuerying] = useState(false);

  const [data, setData] = useState(() => flattenParticipants(participants));
  const columns = useMemo(
    () => generateColumns(attributes, eventId),
    [attributes, eventId],
  );

  const [globalFilter, setGlobalFilter] = useState<string>("");
  // Then in your component where the table is defined
  const [loadingRows, setLoadingRows] = useState<Record<number, boolean>>({});

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    state: {
      globalFilter,
    },
    initialState: {
      pagination: { pageSize: 25, pageIndex: 0 },
      columnVisibility: {
        id: false,
      },
    },
    autoResetPageIndex: false,

    meta: {
      updateData: (rowIndex, value) => {
        setData((previousData) => {
          return previousData.map((row, index) => {
            if (index === rowIndex) {
              return value;
            }
            return row;
          });
        });
      },
      setRowLoading: (rowIndex, isLoading) => {
        setLoadingRows((previous) => ({
          ...previous,
          [rowIndex]: isLoading,
        }));
      },
      isRowLoading: (rowIndex) => {
        return loadingRows[rowIndex];
      },
    },
  });

  async function deleteParticipant(participantId: number) {
    setIsQuerying(true);
    try {
      const { success, error } = await deleteParticipantAction(
        eventId,
        participantId.toString(),
      );

      if (!success) {
        toast({
          variant: "destructive",
          title: "Usunięcie uczestnika nie powiodło się!",
          description: error,
        });
        return;
      }

      setData((previousData) => {
        return previousData.filter(
          (participant) => participant.id !== participantId,
        );
      });
    } catch {
      toast({
        title: "Usunięcie uczestnika nie powiodło się!",
        variant: "destructive",
        description: "Wystąpił błąd podczas usuwania uczestnika.",
      });
    } finally {
      setIsQuerying(false);
    }
  }

  async function deleteManyParticipants(_participants: string[]) {
    setIsQuerying(true);
    try {
      const response = await deleteManyParticipantsAction(
        eventId,
        _participants,
      );

      if (response.success) {
        setData((previousData) => {
          return previousData.filter(
            (participant) => !_participants.includes(participant.id.toString()),
          );
        });
        table.resetRowSelection();
        toast({
          title: "Uczestnicy zostali pomyślnie usunięci",
          description: `Usunięto ${_participants.length.toString()} ${_participants.length === 1 ? "uczestnika" : "uczestników"}`,
        });
      } else {
        toast({
          title: "Wystąpił błąd podczas grupowego usuwania uczestników",
          description: response.error,
        });
      }
    } catch {
      toast({
        title: "Wystąpił błąd podczas grupowego usuwania uczestników",
        variant: "destructive",
        description: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie",
      });
    } finally {
      setIsQuerying(false);
    }
  }

  return (
    <>
      <div className="my-2 flex flex-wrap items-center gap-4">
        <h1 className="text-3xl font-bold">Lista uczestników</h1>
        <TableMenu
          table={table}
          eventId={eventId}
          globalFilter={globalFilter}
          isQuerying={isQuerying}
          emails={emails}
          deleteManyParticipants={deleteManyParticipants}
        />
      </div>
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader className="border-border border-b-2">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                className="[&>th:last-of-type]:sticky [&>th:last-of-type]:right-[-1px] [&>th:last-of-type>button]:backdrop-blur-lg"
                key={headerGroup.id}
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "border-border bg-background border-r-2",
                        header.id === "expand" ? "w-16 text-right" : "",
                        header.column.columnDef.meta?.headerClassName,
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => {
              return (
                <TableRowForm
                  key={row.id}
                  cells={row.getAllCells()}
                  eventId={eventId}
                  row={row}
                  setData={setData}
                  deleteParticipant={deleteParticipant}
                  isQuerying={isQuerying}
                ></TableRowForm>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {table.getRowCount() === 0 ? (
        <div className="text-center">
          Nie znaleziono żadnych pasujących wyników
        </div>
      ) : null}
    </>
  );
}
