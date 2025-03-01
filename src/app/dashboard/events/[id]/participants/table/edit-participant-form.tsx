"use client";

import type { Cell, Row } from "@tanstack/react-table";
import type { Dispatch, SetStateAction } from "react";
import React from "react";
import { Controller, useForm } from "react-hook-form";

import { useToast } from "@/hooks/use-toast";
import type { FlattenedParticipant } from "@/types/participant";

import { updateParticipant } from "../actions";
import { EditParticipantButton } from "./action-components";
import { AttributeInput } from "./attribute-input";

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
  const formDisabled = participant.mode === "view";

  const defaultValues: Record<string, string> = {};
  for (const cell of cells) {
    defaultValues[cell.column.id] =
      (cell.getValue() as string | null | undefined) ?? "";
  }

  const form = useForm({
    defaultValues,
  });

  async function onSubmit(values: Record<string, string>) {
    const { success, error } = await updateParticipant(
      values,
      eventId,
      participant.id.toString(),
    );

    if (!success) {
      toast({
        variant: "destructive",
        title: "Usunięcie uczestnika nie powiodło się!",
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
    <form className="my-2 flex flex-col items-center gap-y-2">
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
                initialValue={
                  cell.getValue() as string | number | boolean | Date | null
                }
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
