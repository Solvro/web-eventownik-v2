"use client";

import HCaptcha from "@hcaptcha/react-hcaptcha";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ban, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import React, { useMemo, useRef, useState } from "react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  includeEmail?: boolean;
  userData?: PublicParticipant;
  eventBlocks?: PublicBlock[];
  editMode?: boolean;
}

export function ParticipantForm({
  attributes,
  onSubmit,
  includeEmail = false,
  userData,
  eventBlocks = [],
  editMode = false,
}: ParticipantFormProps) {
  const t = useTranslations("Form");
  const locale = useLocale();

  const [files, setFiles] = useState<File[]>([]);
  const [hCaptchaToken, setHCaptchaToken] = useState<string | null>(null);
  const [isAwaitingCaptcha, setIsAwaitingCaptcha] = useState<boolean>(false);
  const [didCaptchaFail, setDidCaptchaFail] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const sortedAttributes = useMemo(
    () => attributes.toSorted((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [attributes],
  );

  const pendingFormData = useRef<z.infer<typeof formSchema> | null>(null);
  const hCaptchaRef = useRef<HCaptcha>(null);

  const submitText = editMode ? t("save") : t("signUp");
  const submittingText = editMode ? t("saving") : t("registering");
  const successMessage = editMode ? t("saved") : t("registrationSuccess");

  // generate schema for form based on attributes
  const formSchema = z.object({
    ...(includeEmail && { email: z.string().email(t("invalidEmail")) }),
    ...getSchemaObjectForAttributes(attributes),
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

  function resetStates() {
    form.reset();
    setFiles([]);
    setSuccess(false);
    setIsAwaitingCaptcha(false);
    setDidCaptchaFail(false);
    setHCaptchaToken(null);
    pendingFormData.current = null;
  }

  const { toast } = useToast();

  // temporarily disabled to avoid issues with dirty state not reseting after clearing values
  // useUnsavedForm(form.formState.isDirty);

  /**
   * Fourth, final stage of form submission. Calls onSubmit with the form data and captcha token.
   * If successful, resets form and sets success state.
   */
  async function submitWithCaptcha(
    values: z.infer<typeof formSchema>,
    token: string,
  ) {
    try {
      const result = await onSubmit({ ...values, token }, files);
      if (result.success) {
        setFiles([]);
        if (editMode) {
          form.reset(values);
        }
        setSuccess(true);
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
    } finally {
      hCaptchaRef.current?.resetCaptcha();
      // We set it here instead of in `handleCaptchaVerify` to prevent submit button content flash
      setIsAwaitingCaptcha(false);
    }
  }

  if (success) {
    return (
      <div>
        <h2 className="text-center text-xl font-bold text-green-500 md:text-2xl">
          {successMessage}
        </h2>
        <br />
        <div className="text-center">
          <Button variant="eventDefault" type="button" onClick={resetStates}>
            {editMode ? t("editYourResponse") : t("fillAnotherForm")}
          </Button>
        </div>
      </div>
    );
  }

  /**
   * Third stage of form submission. Triggered upon captcha verification.
   * Calls submitWithCaptcha with the captcha token.
   */
  async function handleCaptchaVerify(token: string) {
    setHCaptchaToken(token);
    setDidCaptchaFail(false);

    if (pendingFormData.current !== null) {
      await submitWithCaptcha(pendingFormData.current, token);
      pendingFormData.current = null;
    }
  }

  /**
   * Second stage of form submission after Zod validation.
   * Checks captcha status: executes captcha if not yet verified, and
   * if captcha is verified, submits form right away - noticable in edit mode.
   *
   * After this function finishes, `form.formState.isSubmitSuccessful` will be true, that's why
   * we don't rely on it to show the success screen.
   */
  async function handleFormSubmit(values: z.infer<typeof formSchema>) {
    if (hCaptchaToken === null) {
      pendingFormData.current = values;

      setIsAwaitingCaptcha(true);
      hCaptchaRef.current?.execute();
    } else {
      await submitWithCaptcha(values, hCaptchaToken);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="w-full max-w-sm space-y-4"
      >
        {includeEmail ? (
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Email{" "}
                  <Tooltip>
                    <TooltipTrigger type="button">
                      <span className="text-red-500">*</span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[var(--radix-tooltip-content-available-width)] text-wrap">
                      {t("emailIsRequiredTooltip")}
                    </TooltipContent>
                  </Tooltip>
                </FormLabel>
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

        {sortedAttributes.map((attribute) => (
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
                  {getAttributeLabel(attribute.name, locale)}{" "}
                  {attribute.isRequired ? (
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <span className="text-red-500">*</span>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {t("attributeIsRequiredTooltip")}
                      </TooltipContent>
                    </Tooltip>
                  ) : null}
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

        <HCaptcha
          ref={hCaptchaRef}
          sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY ?? ""}
          size="invisible"
          onVerify={handleCaptchaVerify}
          onExpire={() => {
            setHCaptchaToken(null);
            setDidCaptchaFail(true);
          }}
          onClose={() => {
            setDidCaptchaFail(true);
          }}
          onError={(captchaError) => {
            console.error("Captcha error occurred:", captchaError);
            setDidCaptchaFail(true);
          }}
        />

        {didCaptchaFail ? (
          <Button
            type="button"
            variant="destructive"
            className="sticky bottom-4 w-full shadow-lg md:bottom-0"
            onClick={() => {
              setDidCaptchaFail(false);
              hCaptchaRef.current?.execute();
            }}
          >
            <Ban className="size-8" />
            <span>{t("captchaFailed")}</span>
          </Button>
        ) : (
          <Button
            type="submit"
            variant="eventDefault"
            disabled={form.formState.isSubmitting || isAwaitingCaptcha}
            className="sticky bottom-4 w-full shadow-lg md:bottom-0"
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="animate-spin" /> {submittingText}
              </>
            ) : isAwaitingCaptcha ? (
              <>
                <Loader2 className="animate-spin" /> {t("captchaInProgress")}
              </>
            ) : (
              submitText
            )}
          </Button>
        )}
      </form>
    </Form>
  );
}
