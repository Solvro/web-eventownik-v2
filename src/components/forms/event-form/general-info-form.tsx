"use client";

import { format, subDays } from "date-fns";
import { CalendarArrowDownIcon, CalendarArrowUpIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
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
import { getDateLocale, translateOrFallback } from "@/i18n/utils";
import { combineDateAndTime } from "@/lib/event-form-utils";
import { cn } from "@/lib/utils";

export const EventFormGeneralInfoSchema = z
  .object({
    name: z.string().nonempty({ message: "nameRequired" }),
    description: z.string(),
    openTime: z.string(),
    closeTime: z.string(),
    openDate: z.date(),
    closeDate: z.date(),
    openCondition: z.enum(["MANUAL", "ON_DATE"]),
    isFirstForm: z.boolean().default(false),
    isOpen: z.boolean().default(true),
  })
  .refine(
    ({ isFirstForm, description }) =>
      isFirstForm || description.trim() !== "<p></p>",
    {
      path: ["description"],
      message: "descriptionRequired",
    },
  )

  .superRefine((schema, context) => {
    if (schema.openCondition === "MANUAL") {
      return;
    }

    if (!schema.openTime) {
      context.addIssue({
        code: "custom",
        path: ["openTime"],
        message: "openTimeRequired",
      });
    }

    if (!schema.closeTime) {
      context.addIssue({
        code: "custom",
        path: ["closeTime"],
        message: "closeTimeRequired",
      });
    }

    const open = combineDateAndTime(schema.openDate, schema.openTime);
    const close = combineDateAndTime(schema.closeDate, schema.closeTime);

    if (close < open) {
      context.addIssue({
        code: "custom",
        path: ["closeDate"],
        message: "closeDateMustBeAfterOpenDate",
      });
    }
  });

interface GeneralInfoFormProps {
  className?: string;
}

export function GeneralInfoForm({ className }: GeneralInfoFormProps) {
  const t = useTranslations("EventDetails");
  const locale = useLocale();

  const { control, formState, watch } =
    useFormContext<z.infer<typeof EventFormGeneralInfoSchema>>();

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      <FormField
        name="name"
        control={control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("formName")}</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder={t("enterFormName")}
                disabled={formState.isSubmitting ? true : undefined}
                {...field}
              />
            </FormControl>
            <FormMessage className="text-sm text-red-500">
              {translateOrFallback(t, formState.errors.name?.message)}
            </FormMessage>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="openCondition"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("formClosingMethod")}</FormLabel>
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
                <SelectItem value="MANUAL">{t("manual")}</SelectItem>
                <SelectItem value="ON_DATE">
                  {t("automaticDateTime")}
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage className="text-sm text-red-500">
              {translateOrFallback(t, formState.errors.openCondition?.message)}
            </FormMessage>
          </FormItem>
        )}
      />

      {watch("openCondition") === "ON_DATE" && (
        <div className="flex flex-col gap-x-12 gap-y-8">
          <div className="space-y-2">
            <div className="flex flex-row flex-wrap items-end gap-4">
              <FormField
                control={control}
                name="openDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col max-sm:flex-1">
                    <FormLabel>{t("openingDateTime")}</FormLabel>
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
                          locale={getDateLocale(locale)}
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
              {translateOrFallback(t, formState.errors.openDate?.message)}
            </FormMessage>
            <FormMessage className="text-sm text-red-500">
              {translateOrFallback(t, formState.errors.openTime?.message)}
            </FormMessage>
          </div>

          <div className="space-y-2">
            <div className="flex flex-row flex-wrap items-end gap-4">
              <FormField
                control={control}
                name="closeDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col max-sm:flex-1">
                    <FormLabel>{t("closingDateTime")}</FormLabel>
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
                          locale={getDateLocale(locale)}
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
              {translateOrFallback(t, formState.errors.closeDate?.message)}
            </FormMessage>
            <FormMessage className="text-sm text-red-500">
              {translateOrFallback(t, formState.errors.closeTime?.message)}
            </FormMessage>
          </div>
        </div>
      )}

      {watch("openCondition") === "MANUAL" && (
        <FormField
          name="isOpen"
          control={control}
          render={({ field }) => (
            <FormItem className="flex w-fit flex-col">
              <FormLabel>{t("isEnabled")}</FormLabel>
              <FormDescription>
                {t("acceptingSubmissionsDescr")}
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
        name="isFirstForm"
        control={control}
        render={({ field }) => (
          <FormItem className="flex w-fit flex-col">
            <FormLabel>{t("isRegistrationForm")}</FormLabel>
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
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("formDescr")}</FormLabel>
            <FormDescription>{t("registrationFormDescr")}</FormDescription>
            <WysiwygEditor
              content={field.value}
              onChange={field.onChange}
              disabled={watch("isFirstForm")}
              placeholder={t("enterFormDescr")}
            />
            <FormMessage className="text-sm text-red-500">
              {translateOrFallback(t, formState.errors.description?.message)}
            </FormMessage>
          </FormItem>
        )}
      />
    </div>
  );
}
