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
import type { EventEmail } from "@/types/emails";
import type { Participant } from "@/types/participant";

import {
  deleteParticipant as deleteParticipantAction,
  massDeleteParticipants as massDeleteParticipantsAction,
} from "../actions";
import {
  DeleteParticipantDialog,
  MassDeleteParticipantsDialog,
} from "./action-components";
import { generateColumns } from "./columns";
import { flattenParticipants } from "./data";
import { DownloadAttributeFileButton } from "./download-file-attribute-button";
import { EditParticipantForm } from "./edit-participant-form";
import { SendMailForm } from "./send-mail-form";
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

  async function massDeleteParticipants(_participants: string[]) {
    setIsQuerying(true);
    const response = await massDeleteParticipantsAction(eventId, _participants);

    if (response.success) {
      setData((previousData) => {
        return previousData.filter(
          (participant) => !_participants.includes(participant.id.toString()),
        );
      });
      toast({
        title: "Uczestnicy zostali pomyślnie usunięci",
        description: `Usunięto ${_participants.length.toString()} uczestników`,
      });
    } else {
      toast({
        title: "Wystąpił błąd podczas grupowego usuwania uczestników",
        description: response.error,
      });
    }
    setIsQuerying(false);
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
              // headers structure - [select, email, createdAt, ...attributes, expand]
              const emailCell = allVisibleCells.at(1);
              const createdAtCell = allVisibleCells.at(2);
              return (
                <Fragment key={row.id}>
                  <TableRow>
                    {row.getVisibleCells().map((cell) => {
                      const attribute = cell.column.columnDef.meta?.attribute;
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            cell.column.id === "expand" ? "text-right" : "",
                          )}
                        >
                          {attribute?.type === "file" &&
                          row.original[attribute.id] !== null &&
                          row.original[attribute.id] !== undefined &&
                          row.original[attribute.id] !== "" ? (
                            <DownloadAttributeFileButton
                              attribute={attribute}
                              eventId={eventId}
                              participant={row.original}
                            />
                          ) : (
                            flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                  {row.getIsExpanded() ? (
                    /*
                      TODO Refactor expanded row so it shows only attributes which weren't visible before expanding 
                      (attribute.showInList = false)
                      It will require changes in how the edit form will be handled
                      Use FlattenedParticipant.mode property to render proper UI (editForm/cells)
                    */
                    <TableRow
                      key={`${row.id}-edit`}
                      className="border-l-primary border-l-2"
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
                      <TableCell>
                        {createdAtCell === undefined
                          ? null
                          : flexRender(
                              createdAtCell.column.columnDef.cell,
                              createdAtCell.getContext(),
                            )}
                      </TableCell>
                      <TableCell
                        className="p-0"
                        colSpan={attributesCells.length}
                      >
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
      </div>
      {table.getRowCount() === 0 ? (
        <div className="text-center">
          Nie znaleziono żadnych pasujących wyników
        </div>
      ) : null}
    </>
  );
}
