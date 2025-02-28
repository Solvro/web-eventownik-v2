"use client";

import type { Table as TanstackTable } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  FilterX,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
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
import type { FlattenedParticipant, Participant } from "@/types/participant";

import { deleteParticipant as deleteParticipantAction } from "./actions";
import { generateColumns } from "./columns";
import { flattenParticipants } from "./data";

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
      pagination: { pageSize: 2, pageIndex: 0 },
      columnVisibility: {
        id: false,
      },
    },
  });

  async function deleteParticipant(participantId: number) {
    //TODO call to API
    console.log("Participant id which is deleted", participantId);

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
          {table.getRowModel().rows.map((row) => (
            <>
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      cell.column.id === "expand" ? "text-right" : "",
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
              {row.getIsExpanded() ? (
                <TableRow
                  key={`${row.id}-edit`}
                  className="border-l-2 border-l-primary"
                >
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <TableCell key={`${cell.id}-edit`}>
                        {cell.column.id === "expand" ? (
                          <div className="flex w-fit flex-col">
                            <Button variant="outline">
                              <Pencil />
                              Edytuj
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="text-red-500"
                                >
                                  <Trash2 />
                                  Usuń
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="flex flex-col items-center">
                                <AlertDialogHeader className="flex flex-col items-center">
                                  <AlertDialogTitle className="flex flex-col items-center self-center">
                                    <XCircle
                                      strokeWidth={1}
                                      stroke={"red"}
                                      size={64}
                                    />
                                    Jesteś pewny?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-pretty text-center text-foreground">
                                    Na pewno chcesz usunąć tego uczestnika? Tej
                                    operacji nie będzie można cofnąć.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="flex gap-x-4">
                                  <AlertDialogAction
                                    onClick={async () => {
                                      await deleteParticipant(row.original.id);
                                    }}
                                    className={buttonVariants({
                                      variant: "destructive",
                                    })}
                                  >
                                    Usuń
                                  </AlertDialogAction>
                                  <AlertDialogCancel
                                    className={buttonVariants({
                                      variant: "outline",
                                    })}
                                  >
                                    Anuluj
                                  </AlertDialogCancel>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        ) : cell.column.columnDef.meta?.attribute ===
                          undefined ? null : (
                          <>Tu beda inputy</>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ) : null}
            </>
          ))}
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

function getPaginationInfoText(table: TanstackTable<FlattenedParticipant>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  return `${
    table.getPaginationRowModel().rows.length === 0
      ? "0"
      : (pageIndex * pageSize + 1).toString()
  }
  -${Math.min(pageSize * pageIndex + pageSize, table.getRowCount()).toString()} z 
  ${table.getRowCount().toString()}`;
}
