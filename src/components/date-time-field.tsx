import { format, subDays } from "date-fns";
import { CalendarArrowDownIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Control, FieldValues, FormState, Path } from "react-hook-form";

import { getDateLocale, translateOrFallback } from "@/i18n/utils";
import { cn } from "@/lib/utils";

import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface FormDateTimeFieldProps<T extends FieldValues> {
  control: Control<T>;
  formState: FormState<T>;
  label: string;
  dateName: Path<T>;
  timeName: Path<T>;
  className?: string;
  disabled?: (date: Date) => boolean;
}

export function FormDateTimeField<T extends FieldValues>({
  control,
  formState,
  label,
  dateName,
  timeName,
  className = "",
  disabled,
}: FormDateTimeFieldProps<T>) {
  const locale = useLocale();
  const t = useTranslations("EventDetails");

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-row flex-wrap items-end gap-4">
        <FormField
          control={control}
          name={dateName}
          render={({ field }) => (
            <FormItem className="flex flex-1 flex-col">
              <FormLabel>{label}</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className="pl-3 text-left font-normal"
                      disabled={formState.isSubmitting}
                    >
                      {format(field.value, "PPP", {
                        locale: getDateLocale(locale),
                      })}
                      <CalendarArrowDownIcon className="ml-auto size-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    className="z-50"
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={
                      disabled ?? ((date) => date <= subDays(new Date(), 1))
                    }
                    locale={getDateLocale(locale)}
                  />
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={timeName}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormControl>
                <Input
                  disabled={formState.isSubmitting}
                  type="time"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <FormMessage className="text-sm text-red-500">
        {translateOrFallback(
          t,
          (formState.errors[dateName] as { message?: string } | undefined)
            ?.message,
        )}
      </FormMessage>

      <FormMessage className="text-sm text-red-500">
        {translateOrFallback(
          t,
          (formState.errors[timeName] as { message?: string } | undefined)
            ?.message,
        )}
      </FormMessage>
    </div>
  );
}
