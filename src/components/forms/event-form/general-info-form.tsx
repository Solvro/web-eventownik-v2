"use client";

import { format, subDays } from "date-fns";
import { CalendarArrowDownIcon, CalendarArrowUpIcon } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

import { WysiwygEditor } from "@/components/editor";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { combineDateAndTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import { OpenCondition } from "@/types/forms";

export const EventFormGeneralInfoSchema = z
  .object({
    name: z.string().nonempty({ message: "Nazwa jest wymagana" }),
    description: z.string().nonempty({ message: "Opis jest wymagany" }),
    openTime: z.string(),
    closeTime: z.string(),
    openDate: z.date(),
    closeDate: z.date(),
    openCondition: z.nativeEnum(OpenCondition),
    isFirstForm: z.boolean().default(false),
    isOpen: z.boolean().default(true),
  })
  .superRefine((schema, context) => {
    if (schema.openCondition === OpenCondition.MANUAL) {
      return;
    }

    if (!schema.openTime) {
      context.addIssue({
        code: "custom",
        path: ["openTime"],
        message: "Godzina rozpoczęcia nie może być pusta",
      });
    }

    if (!schema.closeTime) {
      context.addIssue({
        code: "custom",
        path: ["closeTime"],
        message: "Godzina zakończenia nie może być pusta",
      });
    }

    const open = combineDateAndTime(schema.openDate, schema.openTime);
    const close = combineDateAndTime(schema.closeDate, schema.closeTime);

    if (close < open) {
      context.addIssue({
        code: "custom",
        path: ["closeDate"],
        message: "Data zakończenia musi być po dacie rozpoczęcia",
      });
    }
  });

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
        control={control}
        name="openCondition"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sposób zamknięcia formularza</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={formState.isSubmitting}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz sposób zamknięcia formularza" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value={OpenCondition.MANUAL}>Ręcznie</SelectItem>
                <SelectItem value={OpenCondition.ON_DATE}>
                  Automatycznie (data i godzina)
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage className="text-sm text-red-500">
              {formState.errors.openCondition?.message}
            </FormMessage>
          </FormItem>
        )}
      />

      {watch("openCondition") === OpenCondition.ON_DATE && (
        <div className="flex flex-col gap-x-12 gap-y-8">
          <div className="space-y-2">
            <div className="flex flex-row flex-wrap items-end gap-4">
              <FormField
                control={control}
                name="openDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col max-sm:flex-1">
                    <FormLabel>Data i godzina otwarcia</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="pl-3 text-left font-normal"
                            disabled={formState.isSubmitting}
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
                          disabled={(date) => date <= subDays(new Date(), 1)}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="openTime"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        disabled={formState.isSubmitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormMessage className="text-sm text-red-500">
              {formState.errors.openDate?.message}
            </FormMessage>
            <FormMessage className="text-sm text-red-500">
              {formState.errors.openTime?.message}
            </FormMessage>
          </div>

          <div className="space-y-2">
            <div className="flex flex-row flex-wrap items-end gap-4">
              <FormField
                control={control}
                name="closeDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col max-sm:flex-1">
                    <FormLabel>Data i godzina zamknięcia</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="pl-3 text-left font-normal"
                            disabled={formState.isSubmitting}
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
                          disabled={(date) => date <= subDays(new Date(), 1)}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="closeTime"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="time"
                        disabled={formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormMessage className="text-sm text-red-500">
              {formState.errors.closeDate?.message}
            </FormMessage>
            <FormMessage className="text-sm text-red-500">
              {formState.errors.closeTime?.message}
            </FormMessage>
          </div>
        </div>
      )}

      {watch("openCondition") === OpenCondition.MANUAL && (
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
      )}

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
    </div>
  );
}
