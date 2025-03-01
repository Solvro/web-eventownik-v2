"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Cell } from "@tanstack/react-table";
import type { Dispatch, SetStateAction } from "react";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import type { Attribute } from "@/types/attributes";
import type { FlattenedParticipant } from "@/types/participant";

import { EditParticipantButton } from "./action-components";
import { AttributeInput } from "./attribute-input";

export function EditParticipantForm({
  cells,
  attributes,
  disabled,
  participant,
  setData,
}: {
  cells: Cell<FlattenedParticipant, unknown>[];
  attributes: Attribute[];
  disabled: boolean;
  participantId: string;
  participant: FlattenedParticipant;
  setData: Dispatch<SetStateAction<FlattenedParticipant[]>>;
}) {
  const formSchema = generateDynamicSchema(attributes);
  const defaultValues: Record<string, string | number | boolean | Date | null> =
    {};
  for (const cell of cells) {
    defaultValues[cell.column.id] = cell.getValue() as
      | number
      | string
      | boolean
      | Date
      | null;
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log("SUBMITED", values);
  }
  return (
    <form className="flex flex-col items-center gap-y-2">
      {cells.map((cell) => {
        const attribute = cell.column.columnDef.meta?.attribute;
        return attribute === undefined ? null : (
          <Controller
            disabled={disabled}
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

//EVERYTHING BELOW IS KLOD GENERATED
// Function to create a Zod schema based on the attribute type
function createSchemaForAttribute(attribute: Attribute) {
  const { type, options } = attribute;

  // Base schema that will be refined based on type
  let schema: z.ZodTypeAny;

  switch (type) {
    case "text":
    case "email":
    case "tel":
    case "color": {
      schema = z.string();
      if (type === "email") {
        schema = z.string().email();
      }
      break;
    }

    case "number": {
      schema = z.coerce.number();
      break;
    }

    case "checkbox": {
      schema = z.boolean();
      break;
    }

    case "date":
    case "time":
    case "datetime": {
      schema = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
        message: `Invalid ${type} format`,
      });
      break;
    }

    case "select": {
      schema =
        options != null && options.length > 0
          ? z.enum(options as [string, ...string[]], {
              message: "Niedozwolona wartość",
            })
          : z.string();
      break;
    }

    case "file": {
      //TODO
      // For file inputs, we might want to validate the file object or its properties
      schema = z.any(); // This can be refined based on your file validation needs
      break;
    }

    case "block": {
      throw new Error('Not implemented yet: "block" case');
    }

    default: {
      schema = z.any();
    }
  }

  return schema;
}

// Function to generate a complete schema from all attributes
function generateDynamicSchema(attributes: Attribute[]) {
  const schemaMap: Record<string, z.ZodTypeAny> = {};

  for (const attribute of attributes) {
    schemaMap[attribute.name] = createSchemaForAttribute(attribute);
  }

  return z.object(schemaMap);
}
