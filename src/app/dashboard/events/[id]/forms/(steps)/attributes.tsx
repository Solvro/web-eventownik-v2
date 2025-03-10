"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { ArrowLeft, Loader, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { newEventFormAtom } from "@/atoms/new-event-form-atom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import type { EventAttribute } from "@/types/attributes";

import { createEventForm } from "../actions";

const EventFormAttributesSchema = z.object({
  attributesIds: z.array(z.number()),
});

function AttributesForm({
  eventId,
  attributes,
  goToPreviousStep,
}: {
  eventId: string;
  attributes: EventAttribute[];
  goToPreviousStep: () => void;
}) {
  const [newEventForm, setNewEventForm] = useAtom(newEventFormAtom);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof EventFormAttributesSchema>>({
    resolver: zodResolver(EventFormAttributesSchema),
    defaultValues: {
      attributesIds: newEventForm.attributes.map((attribute) => attribute.id),
    },
  });

  function saveSelectedAttributes() {
    setNewEventForm({ ...newEventForm, ...form.getValues() });
  }

  async function onSubmit(values: z.infer<typeof EventFormAttributesSchema>) {
    setNewEventForm({ ...newEventForm, ...values });

    const result = await createEventForm(eventId, {
      ...newEventForm,
    });

    if (result.success) {
      toast({
        title: "Dodano nowy formularz",
      });

      // Reset to default values
      setNewEventForm({
        isOpen: true,
        description: "",
        name: "",
        slug: "",
        startTime: "",
        endTime: "",
        startDate: new Date(),
        endDate: new Date(),
        attributes: [],
      });

      router.replace(`/dashboard/events/${eventId.toString()}/forms/`);
    } else {
      toast({
        title: "Nie udało się dodać formularza",
        description: result.error,
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormItem className="space-y-3">
          <FormLabel>Wybierz atrybuty</FormLabel>
          {attributes.map((attribute) => (
            <FormField
              key={attribute.id}
              control={form.control}
              name="attributesIds"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value.includes(attribute.id)}
                      disabled={form.formState.isSubmitting}
                      onCheckedChange={(checked: boolean) => {
                        checked
                          ? field.onChange([...field.value, attribute.id])
                          : field.onChange(
                              field.value.filter(
                                (value) => value !== attribute.id,
                              ),
                            );
                        saveSelectedAttributes();
                      }}
                    />
                  </FormControl>
                  <FormLabel>{attribute.name}</FormLabel>
                </FormItem>
              )}
            />
          ))}
          <FormMessage />
        </FormItem>
        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={goToPreviousStep}
            disabled={form.formState.isSubmitting}
          >
            <ArrowLeft /> Wróć
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <Loader className="animate-spin" />
            ) : (
              <Save />
            )}{" "}
            Zapisz
          </Button>
        </div>
      </form>
    </Form>
  );
}

export { AttributesForm };
