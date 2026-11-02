"use client";

import { Loader } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
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
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { translateOrFallback } from "@/i18n/utils";
import type { Attribute } from "@/types/attributes";

export const TicketSchema = z
  .object({
    mode: z.enum(["EVENT", "BLOCK"]),
    attributeUuid: z.string(),
    shownAttributeUuids: z.array(z.string()),
  })
  .superRefine((data, context) => {
    if (data.mode === "BLOCK" && data.attributeUuid === "") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["attributeUuid"],
        message: "targetBlockRequired",
      });
    }
  });

export type TicketFormValues = z.infer<typeof TicketSchema>;

type TicketFormError = "targetBlockRequired";

/** The backend doesn't allow showing these to staff */
const UNSUPPORTED_SHOWN_ATTRIBUTE_TYPES = new Set<Attribute["type"]>([
  "file",
  "drawing",
]);

export function TicketForm({
  form,
  onSubmit,
  attributes,
  targetAttributes,
  isEditing = false,
  loadingText,
  submitText,
  idleIcon: IdleIcon,
}: {
  form: UseFormReturn<TicketFormValues>;
  onSubmit: (data: TicketFormValues) => void;
  /** All attributes of the event */
  attributes: Attribute[];
  /** Block attributes the ticket can target */
  targetAttributes: Attribute[];
  /** The target can't be changed after creation */
  isEditing?: boolean;
  loadingText: string;
  submitText: string;
  idleIcon?: LucideIcon;
}) {
  const t = useTranslations("Tickets");
  const mode = form.watch("mode");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="mode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("ticketType")}</FormLabel>
              <FormControl>
                <Input
                  value={
                    field.value === "EVENT" ? t("eventMode") : t("blockMode")
                  }
                  readOnly
                  disabled
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="shownAttributeUuids"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("displayedAttributes")}</FormLabel>
              <FormDescription>
                {t("displayedAttributesDescription")}
              </FormDescription>
              <FormControl>
                <MultiSelect
                  options={attributes
                    .filter(
                      (attribute) =>
                        !UNSUPPORTED_SHOWN_ATTRIBUTE_TYPES.has(attribute.type),
                    )
                    .map((attribute) => ({
                      label: attribute.name,
                      value: attribute.uuid,
                    }))}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  placeholder={t("selectAttributes")}
                />
              </FormControl>
            </FormItem>
          )}
        />
        {mode === "BLOCK" && (
          <FormField
            control={form.control}
            name="attributeUuid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("targetBlock")}</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isEditing}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("selectTargetBlock")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {targetAttributes.map((attribute) => (
                      <SelectItem key={attribute.uuid} value={attribute.uuid}>
                        {attribute.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-sm text-red-500">
                  {translateOrFallback(
                    t,
                    form.formState.errors.attributeUuid
                      ?.message as TicketFormError,
                  )}
                </FormMessage>
              </FormItem>
            )}
          />
        )}
        <Button
          type="submit"
          variant="eventDefault"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader className="animate-spin" /> {loadingText}
            </>
          ) : (
            <>
              {IdleIcon != null && <IdleIcon />} {submitText}
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
