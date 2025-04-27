"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AttributeInput } from "@/components/attribute-input";
import { AttributeInputFile } from "@/components/attribute-input-file";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { getSchemaObjectForAttributes } from "@/lib/utils";
import type { FormAttribute } from "@/types/attributes";
import type { PublicBlock } from "@/types/blocks";
import type { PublicParticipant } from "@/types/participant";

import { getEventBlockAttributeBlocks, submitForm } from "./actions";

export function FormGenerator({
  attributes,
  userData,
  originalEventBlocks,
  formId,
  eventSlug,
  userId,
}: {
  attributes: FormAttribute[];
  userData: PublicParticipant;
  originalEventBlocks: PublicBlock[];
  formId: string;
  eventSlug: string;
  userId: string;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [eventBlocks, setEventBlocks] = useState(originalEventBlocks);
  // generate schema for form based on attributes
  const FormSchema = z.object({
    ...getSchemaObjectForAttributes(
      attributes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    ),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      ...userData.attributes.reduce<Record<string, string>>(
        (accumulator, attribute) => {
          accumulator[attribute.id.toString()] = attribute.meta.pivot_value;
          return accumulator;
        },
        {},
      ),
    },
  });

  const { toast } = useToast();

  async function onSubmit(values: z.infer<typeof FormSchema>) {
    try {
      const result = await submitForm(values, formId, eventSlug, userId, files);
      if (result.success) {
        setFiles([]);
      } else {
        form.setError("root", {
          type: "manual",
          message:
            "Zapisanie danych formularza nie powiodło się.\nSpróbuj ponownie później",
        });
        toast({
          variant: "destructive",
          title: "Zapisanie danych formularza nie powiodło się",
          description: "Spróbuj ponownie później",
        });
      }
    } catch (error) {
      console.error("Form submission failed", error);
      toast({
        variant: "destructive",
        title: "Zapisanie danych formularza nie powiodło się",
        description: "Błąd serwera",
      });
    }
  }

  useEffect(() => {
    async function updateBlocksData() {
      setEventBlocks(
        (await Promise.all(
          attributes
            .filter((attribute) => attribute.type === "block")
            .map(async (attribute) =>
              getEventBlockAttributeBlocks(eventSlug, attribute.id.toString()),
            ),
        )) as unknown as PublicBlock[],
      );
    }

    const interval = setInterval(async () => {
      await updateBlocksData();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [eventSlug, attributes]);

  if (form.formState.isSubmitSuccessful) {
    return (
      <div>
        <h2 className="text-center text-xl font-bold text-green-500 md:text-2xl">
          Twoja odpowiedź została zapisana!
        </h2>
        <br />
        <div className="text-center">
          <Button
            onClick={() => {
              form.reset();
              location.reload();
            }}
          >
            Edytuj swoją odpowiedź
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-sm space-y-4"
      >
        {attributes.map((attribute) => (
          <FormField
            key={attribute.id}
            control={form.control}
            name={attribute.id.toString()}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{attribute.name}</FormLabel>
                <FormControl>
                  {attribute.type === "file" ? (
                    <AttributeInputFile
                      attribute={attribute}
                      field={field}
                      setError={form.control.setError}
                      resetField={form.resetField}
                      setFiles={setFiles}
                    ></AttributeInputFile>
                  ) : (
                    <AttributeInput
                      attribute={attribute}
                      userData={userData}
                      eventBlocks={eventBlocks.filter(
                        (block) => block.attributeId === attribute.id,
                      )}
                      field={field}
                    />
                  )}
                </FormControl>
                <FormMessage className="text-sm text-red-500">
                  {/* @ts-expect-error zod schema object are dynamic */}
                  {form.formState.errors[attribute.id.toString()]?.message}
                </FormMessage>
              </FormItem>
            )}
          />
        ))}
        {form.formState.errors.root?.message != null && (
          <FormMessage className="text-center text-sm whitespace-break-spaces text-red-500">
            {form.formState.errors.root.message}
          </FormMessage>
        )}
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="animate-spin" /> Zapisywanie...
            </>
          ) : (
            "Zapisz"
          )}
        </Button>
      </form>
    </Form>
  );
}
