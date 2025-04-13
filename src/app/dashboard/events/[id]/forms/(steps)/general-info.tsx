"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useAtom } from "jotai";
import { ArrowRight, BookOpenText, CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormContainer } from "@/app/dashboard/(create-event)/form-container";
import { newEventFormAtom } from "@/atoms/new-event-form-atom";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
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
import { Textarea } from "@/components/ui/textarea";

const EventFormGeneralInfoSchema = z.object({
  name: z.string().nonempty({ message: "Nazwa jest wymagana" }),
  description: z.string().nonempty({ message: "Opis jest wymagany" }),
  startTime: z.string().nonempty("Godzina rozpoczęcia nie może być pusta."),
  endTime: z.string().nonempty("Godzina zakończenia nie może być pusta."),
  startDate: z.date(),
  endDate: z.date().refine((date) => date > new Date(), {
    message: "Data zakończenia musi być po dacie rozpoczęcia.",
  }),
  isFirstForm: z.boolean(),
  isOpen: z.boolean(),
});

function GeneralInfoForm({ goToNextStep }: { goToNextStep: () => void }) {
  const [newEventForm, setNewEventForm] = useAtom(newEventFormAtom);

  const form = useForm<z.infer<typeof EventFormGeneralInfoSchema>>({
    resolver: zodResolver(EventFormGeneralInfoSchema),
    defaultValues: {
      name: newEventForm.name,
      description: newEventForm.description,
      startTime: format(newEventForm.startDate, "HH:mm"),
      endTime: format(newEventForm.endDate, "HH:mm"),
      startDate: newEventForm.startDate,
      endDate: newEventForm.endDate,
      isFirstForm: newEventForm.isFirstForm,
      isOpen: newEventForm.isOpen,
    },
  });

  function onSubmit(values: z.infer<typeof EventFormGeneralInfoSchema>) {
    setNewEventForm({ ...newEventForm, ...values });
    goToNextStep();
  }

  return (
    <FormContainer
      description="Podstawowe dane"
      icon={<BookOpenText />}
      step="1/2"
      title="Krok 1"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-8 md:grid-cols-2 md:gap-10">
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
                        {...field}
                        disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.name?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <FormLabel>Data i godzina</FormLabel>
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
                                variant={"outline"}
                                className="w-[240px] pl-3 text-left font-normal"
                                disabled={form.formState.isSubmitting}
                              >
                                {format(field.value, "PPP")}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              className="z-50"
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date <= new Date()}
                            />
                          </PopoverContent>
                        </Popover>
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
                            disabled={form.formState.isSubmitting}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormMessage className="text-sm text-red-500">
                  {form.formState.errors.startDate?.message}
                </FormMessage>
                <FormMessage className="text-sm text-red-500">
                  {form.formState.errors.startTime?.message}
                </FormMessage>
              </div>
              <div className="space-y-2">
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
                                variant={"outline"}
                                className="w-[240px] pl-3 text-left font-normal"
                                disabled={form.formState.isSubmitting}
                              >
                                {format(field.value, "PPP")}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              className="z-50"
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date <
                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                (form.getValues("startDate") === undefined
                                  ? new Date()
                                  : form.getValues("startDate"))
                              }
                            />
                          </PopoverContent>
                        </Popover>
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
                            disabled={form.formState.isSubmitting}
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormMessage className="text-sm text-red-500">
                  {form.formState.errors.endDate?.message}
                </FormMessage>
                <FormMessage className="text-sm text-red-500">
                  {form.formState.errors.endTime?.message}
                </FormMessage>
              </div>
            </div>
            <div className="flex flex-col gap-8">
              {/* TODO: Replace with a WYSIWYG editor */}
              <FormField
                name="description"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="grow">
                    <FormLabel>Dodaj tekst wstępny</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="h-5/6 resize-none"
                        disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.description?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                name="isFirstForm"
                control={form.control}
                disabled={form.formState.isSubmitting}
                render={({ field }) => (
                  <FormItem className="flex w-fit flex-col">
                    <FormLabel>Formularz rejestracyjny?</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="m-0"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="isOpen"
                control={form.control}
                disabled={form.formState.isSubmitting}
                render={({ field }) => (
                  <FormItem className="flex w-fit flex-col">
                    <FormLabel>Włączony?</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="m-0"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="ghost" type="submit">
              <ArrowRight /> Dalej
            </Button>
          </div>
        </form>
      </Form>
    </FormContainer>
  );
}

export { GeneralInfoForm };
