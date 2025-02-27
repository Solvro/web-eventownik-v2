"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { registerParticipant } from "@/app/[eventSlug]/actions";
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
import { registerParticipantFormSchema } from "@/types/schemas";

export function RegisterParitcipantForm({ eventId }: { eventId: string }) {
  //TODO fetch additional attributes from API
  const form = useForm<z.infer<typeof registerParticipantFormSchema>>({
    resolver: zodResolver(registerParticipantFormSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
    },
  });
  const { toast } = useToast();

  async function onSubmit(
    values: z.infer<typeof registerParticipantFormSchema>,
  ) {
    try {
      const result = await registerParticipant(values, eventId);
      if (!result.success) {
        toast({
          variant: "destructive",
          title: "Rejestracja na wydarzenie nie powiodła się",
          //TODO more informative message based on error returned from registerParticipant() action
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
              <FormLabel className="sr-only">E-mail</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  disabled={form.formState.isSubmitting}
                  placeholder="E-mail"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-sm text-red-500">
                {form.formState.errors.email?.message}
              </FormMessage>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Imię</FormLabel>
              <FormControl>
                <Input
                  disabled={form.formState.isSubmitting}
                  {...field}
                  placeholder="Imię"
                />
              </FormControl>
              <FormMessage className="text-sm text-red-500">
                {form.formState.errors.firstName?.message}
              </FormMessage>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Nazwisko</FormLabel>
              <FormControl>
                <Input
                  disabled={form.formState.isSubmitting}
                  {...field}
                  placeholder="Nazwisko"
                />
              </FormControl>
              <FormMessage className="text-sm text-red-500">
                {form.formState.errors.lastName?.message}
              </FormMessage>
            </FormItem>
          )}
        />
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
