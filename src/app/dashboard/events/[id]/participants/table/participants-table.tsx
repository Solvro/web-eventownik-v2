"use client";

import type { RowData } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { useTranslations } from "next-intl";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useParticipantsData } from "@/hooks/use-participants-data";
import { useParticipantsTable } from "@/hooks/use-participants-table";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Attribute } from "@/types/attributes";
import type { Block } from "@/types/blocks";
import type { EventEmail } from "@/types/emails";
import type { Participant } from "@/types/participant";

import { HelpDialog } from "./help-dialog";
import { TableMenu } from "./table-menu";
import { TableRowForm } from "./table-row-form";
import { getAriaSort } from "./utils";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    attribute?: Attribute;
    headerClassName?: string;
    cellClassName?: string;
    showInTable: boolean;
  }

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
  const t = useTranslations("Table");

  const { toast } = useToast();

  const {
    data,
    setData,
    deleteParticipant: deleteParticipantMutation,
    deleteManyParticipants: deleteManyParticipantsMutation,
    isLoading: isQuerying,
  } = useParticipantsData(eventId, participants);

  const { table, globalFilter } = useParticipantsTable({
    data,
    attributes,
    blocks,
    eventId,
    onUpdateData: (rowIndex, value) => {
      setData((previousData) => {
        return previousData.map((row, index) => {
          if (index === rowIndex) {
            return value;
          }
          return row;
        });
      });
    },
  });

  async function deleteParticipant(participantId: number) {
    try {
      const { success, error } = await deleteParticipantMutation(participantId);

      if (!success) {
        toast({
          variant: "destructive",
          title: t("deleteParticipantError"),
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
        title: t("deleteParticipantSuccess"),
        description: error,
      });
    } catch {
      toast({
        title: t("deleteParticipantError"),
        variant: "destructive",
        description: t("deleteParticipantErrorDescription"),
      });
    }
  }

  async function deleteManyParticipants(_participants: string[]) {
    try {
      const response = await deleteManyParticipantsMutation(_participants);

      if (response.success) {
        setData((previousData) => {
          return previousData.filter(
            (participant) => !_participants.includes(participant.id.toString()),
          );
        });
        table.resetRowSelection();
        toast({
          title: t("deleteParticipantsSuccess"),
          description: t("deleteParticipantsSuccessDescription", {
            count: _participants.length,
          }),
        });
      } else {
        toast({
          title: t("deleteParticipantsError"),
          description: response.error,
        });
      }
    } catch {
      toast({
        title: t("deleteParticipantsError"),
        variant: "destructive",
        description: t("deleteParticipantsErrorDescription"),
      });
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex grow justify-between">
          <h1 className="text-3xl font-bold">{t("participantsTableTitle")}</h1>
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
                  className="[&>th:last-of-type]:sticky [&>th:last-of-type]:-right-px [&>th:last-of-type>button]:backdrop-blur-lg"
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
        <div className="text-center">{t("participantsNotFound")}</div>
      ) : null}
    </>
  );
}
