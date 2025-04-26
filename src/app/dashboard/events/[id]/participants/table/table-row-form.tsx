"use client";

import { flexRender } from "@tanstack/react-table";
import type { Cell, Row } from "@tanstack/react-table";
import type { Dispatch, SetStateAction } from "react";
import { Fragment, useEffect } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";

import { AttributeInput } from "@/components/attribute-input";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { FlattenedParticipant } from "@/types/participant";

import { updateParticipant } from "../actions";
import {
  DeleteParticipantDialog,
  EditParticipantButton,
} from "./action-components";
import { DownloadAttributeFileButton } from "./download-file-attribute-button";

interface TableRowFormProps {
  row: Row<FlattenedParticipant>;
  cells: Cell<FlattenedParticipant, unknown>[];
  eventId: string;
  setData: Dispatch<SetStateAction<FlattenedParticipant[]>>;
  isQuerying: boolean;
  deleteParticipant: (participantId: number) => Promise<void>;
}

// Component for each row that handles its own form context
export function TableRowForm({
  row,
  cells,
  eventId,
  setData,
  isQuerying,
  deleteParticipant,
}: TableRowFormProps) {
  const { toast } = useToast();
  const participant = row.original;

  const formDisabled = participant.mode === "view";

  const defaultValues = getDefaultValues(cells);

  const form = useForm({
    defaultValues,
  });

  useEffect(() => {
    form.reset({ ...getDefaultValues(cells) });
  }, [cells, form]);

  async function onSubmit(values: Record<string, string | string[]>) {
    for (const key in values) {
      //Handling multiselect
      if (typeof values[key] === "object") {
        values[key] = values[key].join(",");
      }
    }

    const { success, error } = await updateParticipant(
      values as Record<number, string>,
      eventId,
      participant.id.toString(),
    );

    if (!success) {
      toast({
        variant: "destructive",
        title: "Aktualizacja uczestnika nie powiodła się!",
        description: error,
      });
      return;
    }
    row.toggleExpanded();
    setData((previousData) => {
      return previousData.map((_participant) =>
        _participant.id === participant.id
          ? { ..._participant, ...values, mode: "view" }
          : _participant,
      );
    });
  }

  const isEditMode = row.original.mode === "edit";
  const allVisibleCells = row.getVisibleCells();
  const expandedRowCells = allVisibleCells.filter(
    (cell) =>
      cell.column.columnDef.meta?.attribute !== undefined &&
      !cell.column.columnDef.meta.showInTable,
  );

  return (
    <FormProvider {...form}>
      <Fragment key={row.id}>
        <TableRow
          className={cn(
            "[&>td:last-of-type]:sticky [&>td:last-of-type]:right-[-1px] [&>td:last-of-type>button]:backdrop-blur-lg",
            isEditMode && "bg-accent/30",
          )}
        >
          {row.getVisibleCells().map((cell) => {
            const attribute = cell.column.columnDef.meta?.attribute;
            const isEditableCell = attribute !== undefined && isEditMode;

            return (
              <Fragment key={cell.id}>
                <TableCell
                  key={cell.id}
                  className={cn(
                    cell.column.id === "expand" ? "text-right" : "",
                    cell.column.columnDef.meta?.cellClassName,
                  )}
                >
                  {isEditableCell ? (
                    <Controller
                      disabled={formDisabled}
                      control={form.control}
                      key={cell.id}
                      name={attribute.id.toString()}
                      render={({ field }) => (
                        <AttributeInput
                          field={field}
                          attribute={attribute}
                        ></AttributeInput>
                      )}
                    ></Controller>
                  ) : attribute?.type === "file" &&
                    row.original[attribute.id] !== null &&
                    row.original[attribute.id] !== undefined &&
                    row.original[attribute.id] !== "" ? (
                    <DownloadAttributeFileButton
                      attribute={attribute}
                      eventId={eventId}
                      participant={row.original}
                    />
                  ) : attribute?.type === "textarea" ? (
                    // TODO: Maybe find a better solution for this
                    <div className="w-xs">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </div>
                  ) : (
                    flexRender(cell.column.columnDef.cell, cell.getContext())
                  )}
                </TableCell>
              </Fragment>
            );
          })}
        </TableRow>

        {row.getIsExpanded() && (
          <TableRow className="border-l-primary bg-accent/10 border-l-2">
            <TableCell colSpan={allVisibleCells.length} className="p-4">
              <div className={cn("grid gap-4", `grid-cols-3`)}>
                {expandedRowCells.map((cell) => {
                  const attribute = cell.column.columnDef.meta?.attribute;
                  return attribute === undefined ? null : (
                    <div key={cell.id} className="space-y-1">
                      <div className="text-muted-foreground text-sm font-medium">
                        {attribute.name || attribute.id}
                      </div>
                      <div className="min-h-10">
                        {isEditMode ? (
                          <Controller
                            disabled={formDisabled}
                            control={form.control}
                            key={cell.id}
                            name={attribute.id.toString()}
                            render={({ field }) => (
                              <AttributeInput
                                field={field}
                                attribute={attribute}
                              ></AttributeInput>
                            )}
                          ></Controller>
                        ) : (
                          <div className="py-2">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div className="right-0 col-end-4 flex gap-x-2">
                  <EditParticipantButton
                    disabled={form.formState.isSubmitting}
                    participant={participant}
                    setData={setData}
                    handleSubmit={form.handleSubmit(onSubmit)}
                  />
                  {participant.mode === "view" ? (
                    <DeleteParticipantDialog
                      isQuerying={isQuerying}
                      participantId={row.original.id}
                      deleteParticipant={deleteParticipant}
                    />
                  ) : (
                    <Button
                      variant="outline"
                      className="text-red-500"
                      onClick={(event) => {
                        event.preventDefault();
                        setData((previousData) => {
                          return previousData.map((_participant) =>
                            _participant.id === participant.id
                              ? { ..._participant, mode: "view" }
                              : _participant,
                          );
                        });
                      }}
                    >
                      Anuluj
                    </Button>
                  )}
                </div>
              </div>
            </TableCell>
          </TableRow>
        )}
      </Fragment>
    </FormProvider>
  );
}

function getDefaultValues(cells: Cell<FlattenedParticipant, unknown>[]) {
  const _defaultValues: Record<string, string | string[]> = {};
  for (const cell of cells) {
    const columnAttribute = cell.column.columnDef.meta?.attribute;
    if (columnAttribute !== undefined) {
      if (columnAttribute.type === "multiselect") {
        //cell value is transformed string array (["v1", "v2"] => "v1, v2")
        const cellValue = cell.getValue() as string | undefined;
        _defaultValues[cell.column.id] = cellValue?.split(",") ?? [];
      } else {
        _defaultValues[cell.column.id] =
          (cell.getValue() as string | null | undefined) ?? "";
      }
    }
  }
  return _defaultValues;
}
