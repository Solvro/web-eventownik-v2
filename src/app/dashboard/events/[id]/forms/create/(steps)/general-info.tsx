"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { newEventFormAtom } from "../state";

const EventFormGeneralInfoSchema = z.object({
  name: z.string().min(1, { message: "Nazwa jest wymagana" }),
  description: z.string().min(1, { message: "Opis jest wymagany" }),
  startDate: z.date(),
  endDate: z.date(),
  slug: z.string().min(1, { message: "Slug jest wymagany" }),
  isOpen: z.boolean(),
});

// function getSlug(value: string) {
//   return value ? value.trim().toLowerCase().split(" ").join("-") : "";
// }

function EventFormGeneralInfoStep({
  goToNextStep,
}: {
  goToNextStep: () => void;
}) {
  const [newEventForm, setNewEventForm] = useAtom(newEventFormAtom);

  const form = useForm<z.infer<typeof EventFormGeneralInfoSchema>>({
    resolver: zodResolver(EventFormGeneralInfoSchema),
    defaultValues: {
      name: newEventForm.name,
      description: newEventForm.description,
      startDate: newEventForm.startDate,
      endDate: newEventForm.endDate,
      isOpen: newEventForm.isOpen,
      slug: newEventForm.slug,
    },
  });

  function onSubmit(values: z.infer<typeof EventFormGeneralInfoSchema>) {
    // console.log(values);
    setNewEventForm(values);
    goToNextStep();
  }

  function onError(errors: unknown) {
    console.warn(errors);
    console.warn(form.getValues());
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="space-y-8"
      >
        <div className="grid gap-8 md:grid-cols-2 md:gap-10">
          <div className="space-y-8">
            <FormField
              name="name"
              control={form.control}
              disabled={form.formState.isSubmitting}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nazwa formularza</FormLabel>
                  <Input
                    type="text"
                    placeholder="Podaj nazwę formularza"
                    disabled={form.formState.isSubmitting}
                    {...field}
                  />
                  <FormMessage>
                    {form.formState.errors.name?.message}
                  </FormMessage>
                </FormItem>
              )}
            />
            {/* TODO: Make the slug auto-generated from the name */}
            <FormField
              name="slug"
              control={form.control}
              disabled={form.formState.isSubmitting}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <Input
                    type="text"
                    placeholder="nazwa-formularza"
                    disabled={form.formState.isSubmitting}
                    {...field}
                  />
                  <FormMessage>
                    {form.formState.errors.slug?.message}
                  </FormMessage>
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col gap-8">
            <p>Druga kolumnaaaa</p>
          </div>
        </div>
        <Button variant="ghost" type="submit">
          <ArrowRight /> Dalej
        </Button>
      </form>
    </Form>
  );
}

export { EventFormGeneralInfoStep };
