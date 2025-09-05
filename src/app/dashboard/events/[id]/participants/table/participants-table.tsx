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

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
import type { Block } from "@/types/blocks";
import type { EventEmail } from "@/types/emails";
import type { Participant } from "@/types/participant";

import {
  deleteManyParticipants as deleteManyParticipantsAction,
  deleteParticipant as deleteParticipantAction,
} from "../actions";
import { generateColumns } from "./columns";
import { flattenParticipants } from "./data";
import { HelpDialog } from "./help-dialog";
import { TableMenu } from "./table-menu";
import { TableRowForm } from "./table-row-form";
import { getAriaSort } from "./utils";

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
 * In current implementation sorting is based on alphanumeric (punctuation and symbols < numbers < uppercase letters < lowercase letters) order because every value used for table is a string [SortingFns Docs](https://tanstack.com/table/v8/docs/guide/sorting#sorting-fns)
 */
export function ParticipantTable({
  participants,
  attributes,
  emails,
  blocks,
  eventId,
}: {
  participants: Participant[];
  attributes: Attribute[];
  emails: EventEmail[] | null;
  blocks: (Block | null)[] | null;
  eventId: string;
}) {
  const { toast } = useToast();
  const [isQuerying, setIsQuerying] = useState(false);

  const [data, setData] = useState(() => flattenParticipants(participants));
  const columns = useMemo(
    () => generateColumns(attributes, blocks ?? [], eventId),
    [attributes, eventId, blocks],
  );

  const [globalFilter, setGlobalFilter] = useState<string>("");
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
    enableMultiSort: true,

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
          title: "Nie udało się usunąć uczestnika!",
          description: error,
        });
        return;
      }
      table.resetExpanded();
      setData((previousData) => {
        return previousData.filter(
          (participant) => participant.id !== participantId,
        );
      });
      toast({
        variant: "default",
        title: "Pomyślnie usunięto uczestnika",
        description: error,
      });
    } catch {
      toast({
        title: "Nie udało się usunąć uczestnika!",
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
          title: "Usunięto uczestników",
          description: `Usunięto ${_participants.length.toString()} ${_participants.length === 1 ? "uczestnika" : "uczestników"}`,
        });
      } else {
        toast({
          title: "Nie udało się grupowo usunąć uczestników!",
          description: response.error,
        });
      }
    } catch {
      toast({
        title: "Nie udało się grupowo usunąć uczestników!",
        variant: "destructive",
        description: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie",
      });
    } finally {
      setIsQuerying(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex grow justify-between">
          <h1 className="text-3xl font-bold">Lista uczestników</h1>
          <HelpDialog />
        </div>
        <TableMenu
          table={table}
          eventId={eventId}
          globalFilter={globalFilter}
          isQuerying={isQuerying}
          emails={emails}
          deleteManyParticipants={deleteManyParticipants}
        />
      </div>
      <ScrollArea className="mt-4 w-full">
        <div className="relative">
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
                        aria-sort={getAriaSort(header.column.getIsSorted())}
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
                    blocks={blocks ?? []}
                  ></TableRowForm>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {table.getRowCount() === 0 ? (
        <div className="text-center">
          Nie znaleziono żadnych pasujących wyników
        </div>
      ) : null}
    </>
  );
}
