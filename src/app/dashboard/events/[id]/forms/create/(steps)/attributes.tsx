"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

// import { createEventForm } from "../../actions";
import { newEventFormAtom } from "../state";

interface EventAttribute {
  id: number;
  name: string;
}

const EventFormAttributesSchema = z.object({
  attributeIds: z.array(z.number()),
});

function AttributesForm({
  eventId,
  attributes,
  goToPreviousStep,
}: {
  eventId: number;
  attributes: EventAttribute[];
  goToPreviousStep: () => void;
}) {
  const [newEventForm, setNewEventForm] = useAtom(newEventFormAtom);
  const router = useRouter();

  const form = useForm<z.infer<typeof EventFormAttributesSchema>>({
    resolver: zodResolver(EventFormAttributesSchema),
    defaultValues: {
      attributeIds: newEventForm.attributeIds,
    },
  });

  function saveSelectedAttributes() {
    setNewEventForm({ ...newEventForm, ...form.getValues() });
  }

  function onSubmit(values: z.infer<typeof EventFormAttributesSchema>) {
    setNewEventForm({ ...newEventForm, ...values });
    router.replace(`/dashboard/events/${eventId.toString()}/forms/`);
    // TODO: Send request to the backend to create a form. Should be handled when creating events is implemented
    // const result = await createEventForm(eventId.toString(), {
    //   eventId,
    //   ...newEventForm,
    // });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="attributeIds"
          render={() => (
            <FormItem className="space-y-3">
              <FormLabel>Wybierz atrybuty</FormLabel>
              {attributes.map((attribute) => (
                <FormField
                  key={attribute.id}
                  control={form.control}
                  name="attributeIds"
                  render={({ field }) => (
                    <FormItem
                      key={attribute.id}
                      className="flex flex-row items-start space-x-3 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value.includes(attribute.id)}
                          onCheckedChange={(checked) => {
                            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
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
          )}
        />
        <div className="flex justify-between">
          <Button variant="ghost" onClick={goToPreviousStep}>
            <ArrowLeft /> Wróć
          </Button>
          <Button type="submit">
            <Save /> Zapisz
          </Button>
        </div>
      </form>
    </Form>
  );
}

export { AttributesForm };
