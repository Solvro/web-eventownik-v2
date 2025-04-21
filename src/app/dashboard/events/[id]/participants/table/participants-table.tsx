"use client";

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
  const columns = useMemo(() => generateColumns(attributes), [attributes]);

  const [globalFilter, setGlobalFilter] = useState<string>("");

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
      // TODO: Allow user to define page size
      pagination: { pageSize: 25, pageIndex: 0 },
      columnVisibility: {
        id: false,
      },
    },
    autoResetPageIndex: false,
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
      {/* TODO: Prevent resizing width of columns */}
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader className="border-border border-b-2">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "border-border border-r-2",
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
