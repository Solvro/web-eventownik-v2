"use client";

import { subDays } from "date-fns";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

import { FormDateTimeField } from "@/components/date-time-field";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { translateOrFallback } from "@/i18n/utils";
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

  const { control, formState, watch, getValues } =
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
                  <SelectValue placeholder={t("selectFormClosingMethod")} />
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
        <div className="flex w-full flex-col flex-wrap gap-x-12 gap-y-8 md:flex-row">
          <FormDateTimeField
            control={control}
            formState={formState}
            label={t("openingDateTime")}
            dateName={"openDate"}
            timeName={"openTime"}
            className="flex-1 md:min-w-84"
          />

          <FormDateTimeField
            control={control}
            formState={formState}
            label={t("closingDateTime")}
            dateName={"closeDate"}
            timeName={"closeTime"}
            className="flex-1 md:min-w-84"
            disabled={(date) =>
              date <
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              (getValues("openDate") === undefined
                ? subDays(new Date(), 1)
                : getValues("openDate"))
            }
          />
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
