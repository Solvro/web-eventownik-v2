"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { registerParticipant } from "@/app/[eventSlug]/actions";
import { AttributeInput } from "@/components/attribute-input";
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
      const result = await registerParticipant(values, event);
      if (result.success) {
        toast({
          title: "Rejestracja na wydarzenie powiodła się",
          description: "Zostałeś dodany do wydarzenia",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Rejestracja na wydarzenie nie powiodła się",
          // TODO: More informative message based on error returned from registerParticipant() action
          description: "Spróbuj ponownie później",
        });
      }
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
                  {/* @ts-expect-error zod schema object are dynamic */}
                  <AttributeInput attribute={attribute} field={field} />
                </FormControl>
                <FormMessage className="text-sm text-red-500">
                  {/* @ts-expect-error zod schema object are dynamic */}
                  {form.formState.errors[attribute.id.toString()]?.message}
                </FormMessage>
              </FormItem>
            )}
          />
        ))}

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
