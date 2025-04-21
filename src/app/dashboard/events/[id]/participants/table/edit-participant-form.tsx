"use client";

import type { Cell, Row } from "@tanstack/react-table";
import type { Dispatch, SetStateAction } from "react";
import React from "react";
import { Controller, useForm } from "react-hook-form";

import { AttributeInput } from "@/components/attribute-input";
import { useToast } from "@/hooks/use-toast";
import type { FlattenedParticipant } from "@/types/participant";

import { updateParticipant } from "../actions";
import { EditParticipantButton } from "./action-components";

export function EditParticipantForm({
  cells,
  eventId,
  setData,
  row,
}: {
  cells: Cell<FlattenedParticipant, unknown>[];
  eventId: string;
  setData: Dispatch<SetStateAction<FlattenedParticipant[]>>;
  row: Row<FlattenedParticipant>;
}) {
  const { toast } = useToast();
  const participant = row.original;
  // TODO wait for backend to implement returning all attributes (also these with showInList == false)
  const formDisabled = participant.mode === "view";

  const defaultValues: Record<string, string | string[]> = {};
  for (const cell of cells) {
    if (cell.column.columnDef.meta?.attribute?.type === "multiselect") {
      //cell value is transformed string array (["v1", "v2"] => "v1, v2")
      const cellValue = cell.getValue() as string | undefined;
      defaultValues[cell.column.id] = cellValue?.split(",") ?? [];
    } else {
      defaultValues[cell.column.id] =
        (cell.getValue() as string | null | undefined) ?? "";
    }
  }

  const form = useForm({
    defaultValues,
  });

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

  return (
    <form className="my-2 flex items-center gap-x-2 justify-self-center">
      {cells.map((cell) => {
        const attribute = cell.column.columnDef.meta?.attribute;
        return attribute === undefined ? null : (
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
        );
      })}
      <EditParticipantButton
        disabled={form.formState.isSubmitting}
        participant={participant}
        setData={setData}
        handleSubmit={form.handleSubmit(onSubmit)}
      />
    </form>
  );
}
