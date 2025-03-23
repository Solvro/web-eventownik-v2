"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { registerParticipant } from "@/app/[eventSlug]/actions";
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getSchemaObjectForAttributes } from "@/lib/utils";
import type { Event } from "@/types/event";

/* eslint-disable @typescript-eslint/no-unsafe-member-access */

export function RegisterParticipantForm({ event }: { event: Event }) {
  const [files, setFiles] = useState<File[]>([]);
  // generate schema for form based on event.firstForm.attributes
  const registerParticipantFormSchema = z.object({
    email: z.string().email("Nieprawidłowy adres email."),
    ...getSchemaObjectForAttributes(
      event.firstForm?.attributes.sort((a, b) => a.id - b.id) ?? [],
    ), // TODO: change to order after backend changes
  });

  const form = useForm<z.infer<typeof registerParticipantFormSchema>>({
    resolver: zodResolver(registerParticipantFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const { toast } = useToast();

  async function onSubmit(
    values: z.infer<typeof registerParticipantFormSchema>,
  ) {
    try {
      const result = await registerParticipant(values, event, files);
      if (!result.success) {
        if (
          result.errors?.[0]?.rule === "database.unique" &&
          result.errors[0]?.field === "email"
        ) {
          form.setError("email", {
            type: "manual",
            message:
              "Ten adres email jest już zarejestrowany na to wydarzenie.",
          });
          toast({
            variant: "destructive",
            title: "Adres email jest już zajęty",
            description:
              "Ten adres email jest już zarejestrowany na to wydarzenie.",
          });
        } else {
          form.setError("root", {
            type: "manual",
            message:
              "Rejestracja na wydarzenie nie powiodła się.\nSpróbuj ponownie później",
          });
          toast({
            variant: "destructive",
            title: "Rejestracja na wydarzenie nie powiodła się",
            // TODO: More informative message based on error returned from registerParticipant() action
            description: "Spróbuj ponownie później",
          });
        }
      }
      setFiles([]);
    } catch (error) {
      console.error("Participant register failed", error);
      toast({
        variant: "destructive",
        title: "Rejestracja na wydarzenie nie powiodła się",
        description: "Błąd serwera",
      });
    }
  }

  if (event.firstForm === null) {
    return (
      <div>
        <p className="text-sm text-red-500">
          Brak formularza rejestracyjnego dla tego wydarzenia.
        </p>
      </div>
    );
  }

  if (form.formState.isSubmitSuccessful) {
    return (
      <div>
        <h2 className="text-1xl text-center font-bold text-green-500 md:text-2xl">
          Twoja rejestracja przebiegła pomyślnie!
        </h2>
        <br />
        <div className="text-center">
          <Button
            onClick={() => {
              form.reset();
            }}
          >
            Uzupełnij kolejny formularz
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
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  disabled={form.formState.isSubmitting}
                  placeholder="Podaj swój adres e-mail"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-sm text-red-500">
                {form.formState.errors.email?.message}
              </FormMessage>
            </FormItem>
          )}
        />

        {event.firstForm.attributes.map((attribute) => (
          <FormField
            key={attribute.id}
            control={form.control}
            // @ts-expect-error zod schema object are dynamic
            name={attribute.id.toString()}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{attribute.name}</FormLabel>
                <FormControl>
                  {attribute.type === "file" ? (
                    <AttributeInputFile
                      attribute={attribute}
                      /* @ts-expect-error zod schema object are dynamic */
                      field={field}
                      setError={form.control.setError}
                      resetField={form.resetField}
                      files={files}
                      setFiles={setFiles}
                    ></AttributeInputFile>
                  ) : (
                    <AttributeInput
                      attribute={attribute}
                      /* @ts-expect-error zod schema object are dynamic */
                      field={field}
                      setError={form.control.setError}
                      resetField={form.resetField}
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
          <FormMessage className="whitespace-break-spaces text-center text-sm text-red-500">
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
              <Loader2 className="animate-spin" /> Logowanie...
            </>
          ) : (
            "Zapisz się"
          )}
        </Button>
      </form>
    </Form>
  );
}
