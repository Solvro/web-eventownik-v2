"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { endOfYesterday, format, isSameDay } from "date-fns";
import { useAtom } from "jotai";
import {
  ArrowRight,
  BookOpenText,
  CalendarArrowDownIcon,
  CalendarArrowUpIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormContainer } from "@/app/dashboard/(create-event)/form-container";
import { newEventFormAtom } from "@/atoms/new-event-form-atom";
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
import { useAutoSave } from "@/hooks/use-autosave";

const EventFormGeneralInfoSchema = z
  .object({
    name: z.string().nonempty({ message: "Nazwa jest wymagana" }),
    description: z.string().nonempty({ message: "Opis jest wymagany" }),
    startTime: z.string().nonempty("Godzina rozpoczęcia nie może być pusta."),
    endTime: z.string().nonempty("Godzina zakończenia nie może być pusta."),
    startDate: z.date(),
    endDate: z.date(),
    isFirstForm: z.boolean().default(false),
    isOpen: z.boolean().default(true),
  })
  .refine(
    (schema) => {
      const startDate = new Date(schema.startDate);
      const endDate = new Date(schema.endDate);

      if (isSameDay(startDate, endDate)) {
        const startTime = Number(schema.startTime.replace(":", "."));
        const endTime = Number(schema.endTime.replace(":", "."));
        // TODO: Should probably check and throw if either of them are already in the past
        return endTime > startTime;
      } else {
        return endDate > startDate;
      }
    },
    {
      path: ["endDate"],
      message: "Data zakończenia musi być po dacie rozpoczęcia.",
    },
  );

function GeneralInfoForm({ goToNextStep }: { goToNextStep: () => void }) {
  const [newEventForm, setNewEventForm] = useAtom(newEventFormAtom);

  const form = useForm<z.infer<typeof EventFormGeneralInfoSchema>>({
    resolver: zodResolver(EventFormGeneralInfoSchema),
    defaultValues: {
      name: newEventForm.name,
      description: newEventForm.description,
      startTime: newEventForm.startTime,
      endTime: newEventForm.endTime,
      startDate: newEventForm.startDate,
      endDate: newEventForm.endDate,
      isFirstForm: newEventForm.isFirstForm,
      isOpen: newEventForm.isOpen,
    },
  });

  useAutoSave(setNewEventForm, form);

  return (
    <FormContainer
      description="Podstawowe dane"
      icon={<BookOpenText />}
      step="1/2"
      title="Krok 1"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(goToNextStep)} className="space-y-8">
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
                                disabled={form.formState.isSubmitting}
                              >
                                {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/strict-boolean-expressions */}
                                {field.value
                                  ? format(field.value, "PPP")
                                  : "Wybierz datę"}
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
                              disabled={(date) => endOfYesterday() > date}
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
                                disabled={form.formState.isSubmitting}
                              >
                                {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/strict-boolean-expressions */}
                                {field.value
                                  ? format(field.value, "PPP")
                                  : "Wybierz datę"}
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
                              disabled={(date) => endOfYesterday() > date}
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
                      className="h-[200px]"
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
                        disabled={form.formState.isSubmitting}
                        className="m-0"
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
                        disabled={form.formState.isSubmitting}
                        className="m-0"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="eventGhost" type="submit">
              <ArrowRight /> Przejdź dalej
            </Button>
          </div>
        </form>
      </Form>
    </FormContainer>
  );
}

export { GeneralInfoForm };
