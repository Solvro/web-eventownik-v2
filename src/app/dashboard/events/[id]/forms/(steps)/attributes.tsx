"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { ArrowLeft, Loader, Save, TextIcon } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { FormContainer } from "@/app/dashboard/(create-event)/form-container";
import { newEventFormAtom } from "@/atoms/new-event-form-atom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { EventAttribute } from "@/types/attributes";

import { createEventForm } from "../actions";

// Required for usage of useFieldArray hook
/* eslint-disable @typescript-eslint/restrict-template-expressions */

const attributeConfigSchema = z.object({
  id: z.number(),
  name: z.string(),
  isIncluded: z.boolean(),
  isRequired: z.boolean(),
  isEditable: z.boolean(),
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
  const { toast } = useToast();

  const EventFormAttributesSchema = z.object({
    attributeConfigs: z.array(attributeConfigSchema),
  });

  const form = useForm<z.infer<typeof EventFormAttributesSchema>>({
    resolver: zodResolver(EventFormAttributesSchema),
    defaultValues: {
      attributeConfigs: attributes.map((attribute) => {
        const existingConfig = newEventForm.attributes.find(
          (searchedAttribute) => searchedAttribute.id === attribute.id,
        );
        return {
          id: attribute.id,
          name: attribute.name,
          isRequired: existingConfig?.isRequired ?? true,
          isEditable: existingConfig?.isEditable ?? true,
        };
      }),
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "attributeConfigs",
  });

  function saveSelectedAttributes() {
    const saved = {
      ...newEventForm,
      attributes: form.getValues().attributeConfigs,
    };
    setNewEventForm(saved);
  }

  async function onSubmit(values: z.infer<typeof EventFormAttributesSchema>) {
    const newForm = {
      ...newEventForm,
      attributes: values.attributeConfigs.filter(
        (attribute) => attribute.isIncluded,
      ),
    };

    setNewEventForm(newForm);

    const result = await createEventForm(eventId, newForm);

    if (result.success) {
      toast({
        title: "Dodano nowy formularz",
      });

      setNewEventForm({
        isOpen: true,
        isFirstForm: false,
        description: "",
        name: "",
        slug: "",
        startTime: "",
        endTime: "",
        startDate: new Date(),
        endDate: new Date(),
        attributes: [],
      });

      // 'router.refresh()' doesn't work here for some reason - using native method instead
      location.reload();
    } else {
      toast({
        title: "Nie udało się dodać formularza",
        description: result.error,
        variant: "destructive",
      });
    }
  }

  return (
    <FormContainer
      description="Wybierz atrybuty"
      icon={<TextIcon />}
      step="2/2"
      title="Krok 2"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {fields.map((mappedField, index) => {
            const targetAttribute = attributes.find(
              (searchedAttribute) =>
                searchedAttribute.name === mappedField.name,
            );

            return (
              <div
                key={mappedField.id}
                className="bg-muted/10 space-y-6 rounded-md p-4"
              >
                <FormField
                  control={form.control}
                  name={`attributeConfigs.${index}.isIncluded`}
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="m-0">
                        {targetAttribute?.name}
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <div
                  className={cn(
                    "pointer-events-none flex gap-4 opacity-0 transition-opacity",
                    form.watch(`attributeConfigs.${index}.isIncluded`) &&
                      "pointer-events-auto opacity-100",
                  )}
                >
                  <FormField
                    control={form.control}
                    name={`attributeConfigs.${index}.isRequired`}
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={
                              !form.watch(
                                `attributeConfigs.${index}.isIncluded`,
                              )
                            }
                          />
                        </FormControl>
                        <FormLabel>Obowiązkowe</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`attributeConfigs.${index}.isEditable`}
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={
                              !form.watch(
                                `attributeConfigs.${index}.isIncluded`,
                              )
                            }
                          />
                        </FormControl>
                        <FormLabel>Edytowalne</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            );
          })}
          <div className="flex justify-between">
            <Button
              variant="ghost"
              onClick={() => {
                saveSelectedAttributes();
                goToPreviousStep();
              }}
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
    </FormContainer>
  );
}

export { AttributesForm };
