"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
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
import { useUnsavedForm } from "@/hooks/use-unsaved";
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
  userSlug,
}: {
  attributes: FormAttribute[];
  userData: PublicParticipant;
  originalEventBlocks: PublicBlock[];
  formId: string;
  eventSlug: string;
  userSlug: string;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [eventBlocks, setEventBlocks] = useState(originalEventBlocks);
  const currentBlocksRef = useRef<PublicBlock[]>(originalEventBlocks); // used to prevent unnecessary re-renders
  const isMounted = useRef(true);
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
      ...userData.attributes
        .filter((attribute) => attribute.type !== "file")
        .reduce<Record<string, string>>((accumulator, attribute) => {
          accumulator[attribute.id.toString()] = attribute.meta.pivot_value;
          return accumulator;
        }, {}),
    },
  });

  const { toast } = useToast();

  useUnsavedForm(form.formState.isDirty);

  async function onSubmit(values: z.infer<typeof FormSchema>) {
    try {
      const result = await submitForm(
        values,
        formId,
        eventSlug,
        userSlug,
        files,
      );
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
          description: result.error,
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
    isMounted.current = true;

    async function updateBlocksData() {
      const blockAttributes = attributes.filter(
        (attribute) => attribute.type === "block",
      );
      if (blockAttributes.length === 0) {
        return;
      }

      try {
        const updatedBlocks = (await Promise.all(
          blockAttributes.map(async (attribute) =>
            getEventBlockAttributeBlocks(eventSlug, attribute.id.toString()),
          ),
        )) as unknown as PublicBlock[];

        if (
          isMounted.current &&
          JSON.stringify(currentBlocksRef.current) !==
            JSON.stringify(updatedBlocks)
        ) {
          currentBlocksRef.current = updatedBlocks;
          setEventBlocks(updatedBlocks);
        }
      } finally {
        if (isMounted.current) {
          setTimeout(updateBlocksData, 1000);
        }
      }
    }

    void updateBlocksData();

    return () => {
      isMounted.current = false;
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
            variant="eventDefault"
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
        className="w-full max-w-sm space-y-4 pb-24"
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
                      lastUpdate={
                        userData.attributes.find(
                          (attribute_) => attribute_.id === attribute.id,
                        )?.meta.pivot_updated_at ?? null
                      }
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
          variant="eventDefault"
          disabled={form.formState.isSubmitting}
          className="sticky bottom-4 w-full shadow-lg md:bottom-0"
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
