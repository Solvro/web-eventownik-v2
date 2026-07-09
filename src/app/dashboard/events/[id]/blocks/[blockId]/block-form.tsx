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
import { translateOrFallback } from "@/i18n/translate-or-fallback";

export const BlockSchema = z.object({
  name: z.string().min(1, "blockNameRequired"),
  capacity: z
    .union([
      z.coerce.number().min(1, "blockCapacityMustBeGreaterThanZero"),
      z.literal(""),
    ])
    .optional(),
});

export type BlockFormValues = z.infer<typeof BlockSchema>;

type BlockFormError =
  | "blockNameRequired"
  | "blockCapacityMustBeGreaterThanZero";

export function BlockForm({
  form,
  onSubmit,
  loadingText,
  submitText,
  idleIcon: IdleIcon,
}: {
  form: UseFormReturn<BlockFormValues>;
  onSubmit: (data: BlockFormValues) => void;
  loadingText: string;
  submitText: string;
  idleIcon?: LucideIcon;
}) {
  const t = useTranslations("EventDetails");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("name")}</FormLabel>
              <FormControl>
                <Input placeholder={t("blockName")} {...field} />
              </FormControl>
              <FormMessage className="text-sm text-red-500">
                {translateOrFallback(
                  t,
                  form.formState.errors.name?.message as BlockFormError,
                )}
              </FormMessage>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("maxParticipants")}</FormLabel>
              <FormDescription>{t("leaveEmptyForUnlimited")}</FormDescription>
              <FormControl>
                <Input
                  type="number"
                  placeholder={t("blockCapacity")}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-sm text-red-500">
                {translateOrFallback(
                  t,
                  form.formState.errors.capacity?.message as BlockFormError,
                )}
              </FormMessage>
            </FormItem>
          )}
        />
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
