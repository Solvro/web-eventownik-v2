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
import { Fragment, useMemo, useState } from "react";

import { ExportButton } from "@/app/dashboard/events/[id]/participants/table/export-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Attribute } from "@/types/attributes";
import type { Participant } from "@/types/participant";

import { deleteParticipant as deleteParticipantAction } from "../actions";
import { DeleteParticipantDialog } from "./action-components";
import { generateColumns } from "./columns";
import { flattenParticipants } from "./data";
import { EditParticipantForm } from "./edit-participant-form";
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
  eventId,
}: {
  participants: Participant[];
  attributes: Attribute[];
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
      pagination: { pageSize: 15, pageIndex: 0 },
      columnVisibility: {
        id: false,
      },
    },
    autoResetPageIndex: false,
  });

  async function deleteParticipant(participantId: number) {
    setIsQuerying(true);
    const { success, error } = await deleteParticipantAction(
      eventId,
      participantId.toString(),
    );
    setIsQuerying(false);

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
  }
  return (
    <>
      <div className="my-2 flex items-center gap-x-4">
        <h1 className="text-3xl font-bold">Lista uczestników</h1>
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
        <ExportButton eventId={eventId} />
        <div className="ml-auto">
          <span className="mr-2">{getPaginationInfoText(table)}</span>
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
      {/* //TODO prevent resizing width of columns */}
      <Table>
        <TableHeader className="border-b-2 border-border">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "border-r-2 border-border",
                      header.id === "expand" ? "w-16 text-right" : "",
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
            const allVisibleCells = row.getVisibleCells();
            const attributesCells = allVisibleCells.filter(
              (cell) => cell.column.columnDef.meta?.attribute !== undefined,
            );
            //headers structure - [select, email, ...attributes, expand]
            const emailCell = allVisibleCells.at(1);
            return (
              <Fragment key={row.id}>
                <TableRow>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        cell.column.id === "expand" ? "text-right" : "",
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                {row.getIsExpanded() ? (
                  <TableRow
                    key={`${row.id}-edit`}
                    className="border-l-2 border-l-primary"
                  >
                    <TableCell>{null}</TableCell>
                    <TableCell>
                      {emailCell === undefined
                        ? null
                        : flexRender(
                            emailCell.column.columnDef.cell,
                            emailCell.getContext(),
                          )}
                    </TableCell>
                    <TableCell className="p-0" colSpan={attributesCells.length}>
                      <EditParticipantForm
                        cells={attributesCells}
                        eventId={eventId}
                        row={row}
                        setData={setData}
                      ></EditParticipantForm>
                    </TableCell>
                    <TableCell>
                      <div className="flex w-fit flex-col">
                        <DeleteParticipantDialog
                          isQuerying={isQuerying}
                          participantId={row.original.id}
                          deleteParticipant={deleteParticipant}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
      {table.getRowCount() === 0 ? (
        <div className="text-center">
          Nie znaleziono żadnych pasujących wyników
        </div>
      ) : null}
    </>
  );
}
