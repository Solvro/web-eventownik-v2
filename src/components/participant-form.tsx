"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AttributeInput } from "@/components/attribute-input";
import { AttributeInputFile } from "@/components/attribute-input-file";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  cn,
  getAttributeLabel,
  getSchemaObjectForAttributes,
} from "@/lib/utils";
import type { FormAttribute } from "@/types/attributes";
import type { PublicBlock } from "@/types/blocks";
import type { PublicParticipant } from "@/types/participant";

interface ErrorObject {
  rule: string;
  field: string;
  message: string;
}

interface ParticipantFormProps {
  attributes: FormAttribute[];
  onSubmit: (
    values: Record<string, unknown>,
    files: File[],
  ) => Promise<{ success: boolean; errors?: ErrorObject[]; error?: string }>;
  successMessage: string;
  submitButtonText: string;
  submittingText: string;
  includeEmail?: boolean;
  userData?: PublicParticipant;
  eventBlocks?: PublicBlock[];
  editMode?: boolean;
}

export function ParticipantForm({
  attributes,
  onSubmit,
  successMessage,
  submitButtonText,
  submittingText,
  includeEmail = false,
  userData,
  eventBlocks = [],
  editMode = false,
}: ParticipantFormProps) {
  const t = useTranslations("Form");
  const locale = useLocale();
  const [files, setFiles] = useState<File[]>([]);
  const router = useRouter();

  // generate schema for form based on attributes
  const formSchema = z.object({
    ...(includeEmail && { email: z.string().email(t("invalidEmail")) }),
    ...getSchemaObjectForAttributes(
      attributes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    ),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...(includeEmail && { email: "" }),
      ...userData?.attributes
        .filter((attribute) => attribute.type !== "file")
        .reduce<Record<string, string>>((accumulator, attribute) => {
          accumulator[attribute.id.toString()] = attribute.meta.pivot_value;
          return accumulator;
        }, {}),
    },
  });

  const { toast } = useToast();

  // temporarily disabled to avoid issues with dirty state not reseting after clearing values
  // useUnsavedForm(form.formState.isDirty);

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await onSubmit(values, files);
      if (result.success) {
        setFiles([]);
        if (editMode) {
          form.reset(values);
        }
      } else {
        if (
          includeEmail &&
          result.errors != null &&
          result.errors.length > 0 &&
          result.errors[0].rule === "database.unique" &&
          result.errors[0].field === "email"
        ) {
          form.setError("email", {
            type: "manual",
            message: t("emailTaken"),
          });
          toast({
            variant: "destructive",
            title: t("emailTakenTitle"),
            description: t("emailTaken"),
          });
        } else {
          form.setError("root", {
            type: "manual",
            message: editMode ? t("editSaveFailed") : t("registrationFailed"),
          });
          toast({
            variant: "destructive",
            title: editMode
              ? t("editSaveFailedTitle")
              : t("registrationFailedTitle"),
            description: result.error ?? t("tryAgainLater"),
          });
        }
      }
    } catch (error) {
      console.error("Form submission failed", error);
      toast({
        variant: "destructive",
        title: editMode
          ? t("editSaveFailedTitle")
          : t("registrationFailedTitle"),
        description: t("serverError"),
      });
    }
  }

  if (form.formState.isSubmitSuccessful) {
    return (
      <div>
        <h2 className="text-center text-xl font-bold text-green-500 md:text-2xl">
          {successMessage}
        </h2>
        <br />
        <div className="text-center">
          <Button
            variant="eventDefault"
            type="button"
            onClick={() => {
              form.reset();
              if (editMode) {
                router.refresh();
              }
            }}
          >
            {editMode ? t("editYourResponse") : t("fillAnotherForm")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="w-full max-w-sm space-y-4 pb-24"
      >
        {includeEmail ? (
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    disabled={form.formState.isSubmitting}
                    placeholder={t("emailPlaceholder")}
                    {...field}
                    value={field.value as string}
                  />
                </FormControl>
                <FormMessage className="text-sm text-red-500">
                  {form.formState.errors.email?.message}
                </FormMessage>
              </FormItem>
            )}
          />
        ) : null}

        {attributes.map((attribute) => (
          <FormField
            key={attribute.id}
            control={form.control}
            name={attribute.id.toString()}
            render={({ field }) => (
              <FormItem
                className={cn(
                  attribute.type === "checkbox" &&
                    "flex flex-row-reverse items-start justify-end space-y-0",
                )}
              >
                <FormLabel htmlFor={attribute.id.toString()}>
                  {includeEmail
                    ? getAttributeLabel(attribute.name, locale)
                    : attribute.name}
                </FormLabel>
                <FormControl>
                  {attribute.type === "file" ? (
                    <AttributeInputFile
                      attribute={attribute}
                      field={field}
                      setError={form.control.setError}
                      resetField={form.resetField}
                      setFiles={setFiles}
                      lastUpdate={
                        userData?.attributes.find(
                          (attribute_) => attribute_.id === attribute.id,
                        )?.meta.pivot_updated_at ?? null
                      }
                    />
                  ) : (
                    <AttributeInput
                      attribute={attribute}
                      userData={userData}
                      eventBlocks={eventBlocks.filter(
                        (block) => block.attributeId === attribute.id,
                      )}
                      field={field}
                    />
                  )}
                </FormControl>
                <FormMessage className="text-sm text-red-500">
                  {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access
                    (form.formState.errors as any)[attribute.id.toString()]
                      ?.message
                  }
                </FormMessage>
              </FormItem>
            )}
          />
        ))}

        {form.formState.errors.root?.message != null && (
          <FormMessage className="text-center text-sm whitespace-break-spaces text-red-500">
            {form.formState.errors.root.message}
          </FormMessage>
        )}

        <Button
          type="submit"
          variant="eventDefault"
          disabled={form.formState.isSubmitting}
          className="sticky bottom-4 w-full shadow-lg md:bottom-0"
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="animate-spin" /> {submittingText}
            </>
          ) : (
            submitButtonText
          )}
        </Button>
      </form>
    </Form>
  );
}
