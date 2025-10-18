"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  CalendarArrowDownIcon,
  CalendarArrowUpIcon,
  Loader,
  Save,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AttributesReorder } from "@/components/attributes-manager";
import { WysiwygEditor } from "@/components/editor";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { UnsavedChangesAlert } from "@/components/unsaved-changes-alert";
import { useToast } from "@/hooks/use-toast";
import { useUnsavedForm } from "@/hooks/use-unsaved";
import type { EventAttribute, FormAttributeBase } from "@/types/attributes";
import type { EventForm } from "@/types/forms";

import { updateEventForm } from "../actions";

const EventFormSchema = z.object({
  name: z.string().nonempty({ message: "Nazwa jest wymagana" }),
  description: z.string().nonempty({ message: "Opis jest wymagany" }),
  startTime: z.string().nonempty("Godzina rozpoczęcia nie może być pusta."),
  endTime: z.string().nonempty("Godzina zakończenia nie może być pusta."),
  startDate: z.date(),
  endDate: z.date(),
  slug: z.string().min(1, { message: "Slug jest wymagany" }),
  isFirstForm: z.boolean(),
  isOpen: z.boolean().default(true),
});

interface EventFormEditFormProps {
  eventId: string;
  formToEdit: EventForm;
  eventAttributes: EventAttribute[];
}

function EventFormEditForm({
  eventId,
  formToEdit,
  eventAttributes,
}: EventFormEditFormProps) {
  const [includedAttributes, setIncludedAttributes] = useState<
    FormAttributeBase[]
  >(formToEdit.attributes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
  const form = useForm<z.infer<typeof EventFormSchema>>({
    resolver: zodResolver(EventFormSchema),
    defaultValues: {
      name: formToEdit.name,
      description: formToEdit.description,
      startTime: `${new Date(formToEdit.startDate).getHours().toString().padStart(2, "0")}:${new Date(formToEdit.startDate).getMinutes().toString().padStart(2, "0")}`,
      endTime: `${new Date(formToEdit.endDate).getHours().toString().padStart(2, "0")}:${new Date(formToEdit.endDate).getMinutes().toString().padStart(2, "0")}`,
      startDate: new Date(formToEdit.startDate),
      endDate: new Date(formToEdit.endDate),
      isFirstForm: formToEdit.isFirstForm,
      isOpen: formToEdit.isOpen,
      slug: formToEdit.slug,
    },
  });
  const { toast } = useToast();

  const { isGuardActive, onCancel, onConfirm } = useUnsavedForm(
    form.formState.isDirty,
  );

  async function onSubmit(values: z.infer<typeof EventFormSchema>) {
    try {
      const result = await updateEventForm(eventId, formToEdit.id.toString(), {
        ...formToEdit,
        ...values,
        attributes: includedAttributes,
      });

      if (result.success) {
        toast({
          title: "Zapisano zmiany w formularzu",
        });
        form.reset();
      } else {
        toast({
          title: "Nie udało się zapisać zmian w formularzu!",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating event form:", error);
      toast({
        title: "Nie udało się zapisać zmian w formularzu!",
        description: "Wystąpił błąd podczas aktualizacji formularza.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <UnsavedChangesAlert
        active={isGuardActive}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex max-w-xl flex-col gap-8">
          <div className="w-full space-y-8">
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nazwa formularza</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Podaj nazwę formularza"
                      // https://github.com/orgs/react-hook-form/discussions/10964?sort=new#discussioncomment-8481087
                      disabled={form.formState.isSubmitting ? true : undefined}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.name?.message}
                  </FormMessage>
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <FormLabel>Data i godzina otwarcia</FormLabel>
              <div className="flex flex-row items-center gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-[240px] pl-3 text-left font-normal"
                              disabled={
                                form.formState.isSubmitting ? true : undefined
                              }
                            >
                              {format(field.value, "PPP")}
                              <CalendarArrowDownIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            className="z-50"
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date: Date) =>
                              new Date(date) <=
                              new Date(form.getValues("startDate"))
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-sm text-red-500">
                        {form.formState.errors.startDate?.message}
                      </FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          disabled={
                            form.formState.isSubmitting ? true : undefined
                          }
                        />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500">
                        {form.formState.errors.startTime?.message}
                      </FormMessage>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="space-y-2">
              <FormLabel>Data i godzina zamknięcia</FormLabel>
              <div className="flex flex-row items-center gap-4">
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-[240px] pl-3 text-left font-normal"
                              disabled={
                                form.formState.isSubmitting ? true : undefined
                              }
                            >
                              {format(field.value, "PPP")}
                              <CalendarArrowUpIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            className="z-50"
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date: Date) =>
                              new Date(date) <=
                              new Date(form.getValues("startDate"))
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-sm text-red-500">
                        {form.formState.errors.endDate?.message}
                      </FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          disabled={
                            form.formState.isSubmitting ? true : undefined
                          }
                        />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500">
                        {form.formState.errors.endTime?.message}
                      </FormMessage>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            {/* TODO: Make the slug auto-generated from the name */}
            <FormField
              name="slug"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="nazwa-formularza"
                      disabled={form.formState.isSubmitting ? true : undefined}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.slug?.message}
                  </FormMessage>
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col gap-8">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opis formularza</FormLabel>
                  <FormDescription>
                    W przypadku formularza rejestracyjnego, zamiast poniższej
                    zawartości wyświetli się opis wydarzenia
                  </FormDescription>
                  <WysiwygEditor
                    content={field.value}
                    onChange={field.onChange}
                    disabled={form.watch("isFirstForm")}
                  />
                  <FormMessage>
                    {form.formState.errors.description?.message}
                  </FormMessage>
                </FormItem>
              )}
            />
            <FormField
              name="isFirstForm"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex w-fit flex-col">
                  <FormLabel>Formularz rejestracyjny?</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="m-0"
                      disabled={form.formState.isSubmitting ? true : undefined}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="isOpen"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex w-fit flex-col">
                  <FormLabel>Włączony?</FormLabel>
                  <FormDescription>
                    Określa, czy formularz przyjmuje nowe zgłoszenia
                  </FormDescription>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="m-0"
                      disabled={form.formState.isSubmitting ? true : undefined}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <AttributesReorder
            attributes={eventAttributes}
            includedAttributes={includedAttributes}
            setIncludedAttributes={setIncludedAttributes}
          />
        </div>
        <Button type="submit" variant="eventDefault">
          {form.formState.isSubmitting ? (
            <Loader className="animate-spin" />
          ) : (
            <Save />
          )}{" "}
          Zapisz
        </Button>
      </form>
    </Form>
  );
}

export { EventFormEditForm };
