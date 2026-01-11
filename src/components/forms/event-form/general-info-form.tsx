"use client";

import { useFormContext } from "react-hook-form";
import { z } from "zod";

import { WysiwygEditor } from "@/components/editor";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export const EventFormGeneralInfoSchema = z.object({
  name: z.string().nonempty({ message: "Nazwa jest wymagana" }),
  description: z.string().nonempty({ message: "Opis jest wymagany" }),
  startTime: z.string().nonempty("Godzina rozpoczęcia nie może być pusta."),
  endTime: z.string().nonempty("Godzina zakończenia nie może być pusta."),
  startDate: z.date(),
  endDate: z.date(),
  isFirstForm: z.boolean().default(false),
  isOpen: z.boolean().default(true),
}); /* 
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
  */

interface GeneralInfoFormProps {
  className?: string;
}

export function GeneralInfoForm({ className }: GeneralInfoFormProps) {
  const { control, formState, watch } =
    useFormContext<z.infer<typeof EventFormGeneralInfoSchema>>();

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      <FormField
        name="name"
        control={control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nazwa formularza</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="Podaj nazwę formularza"
                disabled={formState.isSubmitting ? true : undefined}
                {...field}
              />
            </FormControl>
            <FormMessage>{formState.errors.name?.message}</FormMessage>
          </FormItem>
        )}
      />
      {/*
              <div className="space-y-2">
                <FormLabel>Data otwarcia</FormLabel>
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
      {/*
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
                <FormLabel>Data zamknięcia</FormLabel>
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
      {/*
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
              */}
      <FormField
        control={control}
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
              disabled={watch("isFirstForm")}
            />
            <FormMessage>{formState.errors.description?.message}</FormMessage>
          </FormItem>
        )}
      />

      <FormField
        name="isFirstForm"
        control={control}
        render={({ field }) => (
          <FormItem className="flex w-fit flex-col">
            <FormLabel>Formularz rejestracyjny?</FormLabel>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                className="m-0"
                disabled={formState.isSubmitting ? true : undefined}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        name="isOpen"
        control={control}
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
                disabled={formState.isSubmitting ? true : undefined}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
