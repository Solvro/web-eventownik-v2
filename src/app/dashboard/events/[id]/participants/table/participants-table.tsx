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
import { ArrowUpDown, ChevronLeft, ChevronRight, FilterX } from "lucide-react";
import { useMemo, useState } from "react";

import { ExportButton } from "@/app/dashboard/events/[id]/participants/table/export-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  deleteParticipant as deleteParticipantAction,
  massDeleteParticipants as massDeleteParticipantsAction,
} from "../actions";
import { MassDeleteParticipantsDialog } from "./action-components";
import { generateColumns } from "./columns";
import { flattenParticipants } from "./data";
import { SendMailForm } from "./send-mail-form";
import { TableRowForm } from "./table-row-form";
import { getPaginationInfoText } from "./utils";

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

  async function massDeleteParticipants(_participants: string[]) {
    setIsQuerying(true);
    try {
      const response = await massDeleteParticipantsAction(
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
        <div className="flex w-full flex-wrap items-center justify-between gap-x-2">
          <div className="flex items-center gap-x-2">
            <Input
              className="h-10 w-32"
              placeholder="Wyszukaj..."
              value={globalFilter}
              onChange={(event) => {
                table.setGlobalFilter(String(event.target.value));
              }}
            ></Input>
            <Button
              onClick={() => {
                table.resetColumnFilters();
              }}
              size="icon"
              variant="outline"
              title="Resetuj filtry"
            >
              <FilterX />
            </Button>
            <Button
              onClick={() => {
                table.resetSorting();
              }}
              size="icon"
              variant="outline"
              title="Resetuj sortowanie"
            >
              <ArrowUpDown />
            </Button>
            <SendMailForm
              eventId={eventId}
              targetParticipants={table
                .getSelectedRowModel()
                .rows.map((row) => row.original)}
              emails={emails}
            />
            <ExportButton eventId={eventId} />
            <MassDeleteParticipantsDialog
              isQuerying={isQuerying}
              participants={table
                .getSelectedRowModel()
                .rows.map((row) => row.original.id.toString())}
              massDeleteParticipants={massDeleteParticipants}
            />
          </div>
          <div className="ml-auto flex items-center gap-x-2">
            <Select
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
              defaultValue={table.getState().pagination.pageSize.toString()}
            >
              <SelectTrigger className="h-10 w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Wierszy na stronę</SelectLabel>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <span className="mr-2">{getPaginationInfoText(table)}</span>
            <div className="flex gap-x-0">
              <Button
                variant="outline"
                size="icon"
                disabled={!table.getCanPreviousPage()}
                onClick={() => {
                  table.previousPage();
                }}
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={!table.getCanNextPage()}
                onClick={() => {
                  table.nextPage();
                }}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        </div>
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
