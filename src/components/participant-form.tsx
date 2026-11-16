"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Turnstile } from "@marsidev/react-turnstile";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { Ban, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import type { FieldErrors } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { SubmitFormError } from "@/app/[eventSlug]/actions";
import { AttributeInput } from "@/components/attribute-input";
import { AttributeInputDrawing } from "@/components/attribute-input-drawing";
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
import { translateOrFallback } from "@/i18n/utils";
import {
  cn,
  getSchemaObjectForPublicAttributes,
  legacyTranslate,
} from "@/lib/utils";
import type { Block } from "@/types/blocks";
import type { FormDefinition } from "@/types/forms";
import type { PublicParticipant } from "@/types/participant";

import { Checkbox } from "./ui/checkbox";

function getFieldErrorMessage(
  errors: FieldErrors,
  fieldName: string,
): string | undefined {
  const fieldError = Object.entries(errors).find(
    ([key]) => key === fieldName,
  )?.[1];

  if (fieldError == null || typeof fieldError !== "object") {
    return undefined;
  }

  const message = "message" in fieldError ? fieldError.message : undefined;
  return typeof message === "string" ? message : undefined;
}

interface ParticipantFormProps {
  formDefinitions: FormDefinition[];
  onSubmit: (
    values: Record<string, unknown>,
    files: File[],
  ) => Promise<{
    success: boolean;
    isEmailTaken?: boolean;
    error?: SubmitFormError;
  }>;
  includeEmail?: boolean;
  includeGdpr?: boolean;
  includeTerms?: boolean;
  userData?: PublicParticipant;
  eventBlocks?: Block[];
  editMode?: boolean;
  eventSlug?: string;
  termsLink?: string | null;
}

export function ParticipantForm({
  formDefinitions,
  onSubmit,
  includeEmail = false,
  includeGdpr = false,
  includeTerms = false,
  userData,
  eventBlocks = [],
  editMode = false,
  eventSlug = "",
  termsLink,
}: ParticipantFormProps) {
  const t = useTranslations("Form");
  const tEventDetails = useTranslations("EventDetails");

  const locale = useLocale();
  const router = useRouter();

  const [files, setFiles] = useState<File[]>([]);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isAwaitingCaptcha, setIsAwaitingCaptcha] = useState<boolean>(false);
  const [didCaptchaFail, setDidCaptchaFail] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const sortedFormDefinitions = useMemo(
    () => formDefinitions.toSorted((a, b) => a.order - b.order),
    [formDefinitions],
  );

  const pendingFormData = useRef<z.infer<typeof formSchema> | null>(null);
  const captchaRef = useRef<TurnstileInstance>(null);

  const submitText = editMode ? t("save") : t("register");
  const submittingText = editMode ? t("saving") : t("registering");
  const successMessage = editMode ? t("saved") : t("registrationSuccess");

  const formSchema = z.object({
    ...(includeEmail && { email: z.string().email(t("invalidEmail")) }),
    ...getSchemaObjectForPublicAttributes(formDefinitions),
    ...(includeGdpr && {
      gdprConsent: z.literal<boolean>(true, {
        errorMap: () => ({
          message: t("gdprRequired"),
        }),
      }),
    }),
    ...(includeTerms && {
      termsAccepted: z.literal<boolean>(true, {
        errorMap: () => ({
          message: t("termsRequired"),
        }),
      }),
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...(includeEmail && { email: userData?.email ?? "" }),
      ...userData?.attributes.reduce<Record<string, string | number>>(
        (accumulator, userAttribute) => {
          // Stored files come back as URLs, which the backend rejects as new values.
          // File inputs stay empty, and new uploads are sent separately as tokens
          if (
            userAttribute.attribute.type !== "file" &&
            userAttribute.attribute.type !== "drawing"
          ) {
            accumulator[userAttribute.attributeUuid] = userAttribute.value;
          }
          return accumulator;
        },
        {},
      ),
      ...(includeGdpr && { gdprConsent: false }),
      ...(includeTerms && { termsAccepted: false }),
    },
  });

  function getUserAttribute(attributeUuid: string) {
    return userData?.attributes.find(
      (userAttribute) => userAttribute.attributeUuid === attributeUuid,
    );
  }

  function resetStates() {
    router.refresh();
    form.reset();
    setFiles([]);
    setSuccess(false);
    setIsAwaitingCaptcha(false);
    setDidCaptchaFail(false);
    setCaptchaToken(null);
    pendingFormData.current = null;
  }

  const { toast } = useToast();

  // Temporarily disabled to avoid issues with dirty state not resetting after clearing values
  // useUnsavedForm(form.formState.isDirty);

  /**
   * Fourth, final stage of form submission. Calls onSubmit with the form data and captcha token.
   * If successful, resets form and sets success state.
   */
  async function submitWithCaptcha(
    values: z.infer<typeof formSchema>,
    token: string,
  ) {
    // When editing, send only the fields the participant changed. The backend keeps omitted
    // attributes as they are, while an empty value erases them (and deletes stored files)
    const submittedValues = editMode
      ? Object.fromEntries(
          Object.entries(values).filter(
            ([name]) => form.getFieldState(name).isDirty,
          ),
        )
      : values;

    try {
      const result = await onSubmit(
        { ...submittedValues, "cf-turnstile-response": token },
        files,
      );
      if (result.success) {
        setFiles([]);
        if (editMode) {
          form.reset(values);
        }
        setSuccess(true);
      } else {
        if (includeEmail && result.isEmailTaken === true) {
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
            description:
              result.error?.message ??
              translateOrFallback(
                tEventDetails,
                result.error?.key,
                result.error?.values,
              ) ??
              t("tryAgainLater"),
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
      // Tokens are single-use, so get a fresh one for the next submission
      captchaRef.current?.reset();
      setCaptchaToken(null);
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
    setCaptchaToken(token);
    setDidCaptchaFail(false);

    if (pendingFormData.current !== null) {
      await submitWithCaptcha(pendingFormData.current, token);
      pendingFormData.current = null;
    }
  }

  /**
   * Second stage of form submission after Zod validation.
   * Checks captcha status: the challenge runs in the background as soon as the form renders,
   * so if it's already solved the form is submitted right away, otherwise we wait for it.
   *
   * After this function finishes, `form.formState.isSubmitSuccessful` will be true, that's why
   * we don't rely on it to show the success screen.
   */
  async function handleFormSubmit(values: z.infer<typeof formSchema>) {
    // Validate required file/drawing attributes
    const requiredFileDrawingFormDefinitions = sortedFormDefinitions.filter(
      (attribute) =>
        attribute.isRequired &&
        (attribute.attribute.type === "file" ||
          attribute.attribute.type === "drawing"),
    );

    let hasValidationErrors = false;

    for (const formDefinition of requiredFileDrawingFormDefinitions) {
      const hasFile = files.some(
        (file) => file.name === formDefinition.attribute.uuid,
      );
      const existingValue = getUserAttribute(
        formDefinition.attribute.uuid,
      )?.value;
      const hasExistingValue = existingValue != null && existingValue !== "";

      if (!hasFile && !hasExistingValue) {
        hasValidationErrors = true;
        form.setError(formDefinition.attribute.uuid, {
          message:
            formDefinition.attribute.type === "file"
              ? t("fileUploadRequired")
              : t("drawingRequired"),
        });
      }
    }

    if (hasValidationErrors) {
      return;
    }

    if (captchaToken === null) {
      pendingFormData.current = values;

      setIsAwaitingCaptcha(true);
    } else {
      await submitWithCaptcha(values, captchaToken);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="w-full max-w-md space-y-4"
      >
        {includeEmail ? (
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("email")}{" "}
                  <Tooltip>
                    <TooltipTrigger type="button">
                      <span className="text-red-500">*</span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-(--radix-tooltip-content-available-width) text-wrap">
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

        {sortedFormDefinitions.map((formDefinition) => {
          return (
            <FormField
              key={formDefinition.attribute.uuid}
              control={form.control}
              name={formDefinition.attribute.uuid}
              render={({ field }) => (
                <>
                  <FormItem
                    className={cn(
                      formDefinition.attribute.type === "checkbox" &&
                        "flex flex-row-reverse items-start justify-end space-y-0",
                    )}
                  >
                    <FormLabel htmlFor={formDefinition.attribute.uuid}>
                      {legacyTranslate(formDefinition.attribute.name, locale)}{" "}
                      {formDefinition.isRequired ? (
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
                      {formDefinition.attribute.type === "file" ? (
                        <AttributeInputFile
                          attribute={formDefinition.attribute}
                          field={field}
                          setError={form.control.setError}
                          resetField={form.resetField}
                          setFiles={setFiles}
                          lastUpdate={
                            getUserAttribute(formDefinition.attribute.uuid)
                              ?.updatedAt
                          }
                        />
                      ) : formDefinition.attribute.type === "drawing" ? (
                        <AttributeInputDrawing
                          attribute={formDefinition.attribute}
                          field={field}
                          setError={form.control.setError}
                          resetField={form.resetField}
                          setFiles={setFiles}
                          lastUpdate={
                            getUserAttribute(formDefinition.attribute.uuid)
                              ?.updatedAt
                          }
                        />
                      ) : (
                        <AttributeInput
                          attribute={formDefinition.attribute}
                          isRequired={formDefinition.isRequired}
                          userData={userData}
                          eventBlocks={eventBlocks.filter(
                            (block) =>
                              block.attributeUuid ===
                              formDefinition.attribute.uuid,
                          )}
                          field={field}
                          shouldCheckUserData={editMode}
                        />
                      )}
                    </FormControl>
                  </FormItem>
                  <FormMessage className="text-sm text-red-500">
                    {translateOrFallback(
                      t,
                      getFieldErrorMessage(
                        form.formState.errors,
                        formDefinition.attribute.uuid,
                      ),
                      {
                        name: legacyTranslate(
                          formDefinition.attribute.name,
                          "pl",
                        ),
                      },
                    )}
                  </FormMessage>
                </>
              )}
            />
          );
        })}

        {includeGdpr ? (
          <FormField
            control={form.control}
            name="gdprConsent"
            render={({ field }) => (
              <>
                <FormItem className="flex flex-row-reverse items-start justify-end space-y-0">
                  <FormLabel htmlFor="gdprConsent">
                    {t.rich("gdprNotice", {
                      infoLink: (chunks) => (
                        <Link
                          href={`/${eventSlug}/rodo`}
                          className="text-(--event-primary-color)/90"
                          target="_blank"
                        >
                          {chunks}
                        </Link>
                      ),
                    })}{" "}
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <span className="grow text-red-500">*</span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-(--radix-tooltip-content-available-width) text-wrap">
                        {t("gdprIsRequiredTooltip")}
                      </TooltipContent>
                    </Tooltip>
                  </FormLabel>
                  <FormControl>
                    <Checkbox
                      id={"gdprConsent"}
                      checked={field.value === "true" || field.value === true}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                      }}
                      className="mr-2"
                    />
                  </FormControl>
                </FormItem>
                <FormMessage className="text-sm text-red-500">
                  {form.formState.errors.gdprConsent?.message}
                </FormMessage>
              </>
            )}
          />
        ) : null}

        {includeTerms ? (
          <FormField
            control={form.control}
            name="termsAccepted"
            render={({ field }) => (
              <>
                <FormItem className="flex flex-row-reverse items-start justify-end space-y-0">
                  <FormLabel htmlFor="termsAccepted">
                    {t.rich("termsNotice", {
                      termsLink: (chunks) => (
                        <Link
                          href={termsLink ?? ""}
                          className="text-(--event-primary-color)/90"
                          target="_blank"
                        >
                          {chunks}
                        </Link>
                      ),
                    })}{" "}
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <span className="grow text-red-500">*</span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-(--radix-tooltip-content-available-width) text-wrap">
                        {t("termsIsRequiredTooltip")}
                      </TooltipContent>
                    </Tooltip>
                  </FormLabel>
                  <FormControl>
                    <Checkbox
                      id={"termsAccepted"}
                      checked={field.value === "true" || field.value === true}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                      }}
                      className="mr-2"
                    />
                  </FormControl>
                </FormItem>
                <FormMessage className="text-sm text-red-500">
                  {form.formState.errors.termsAccepted?.message}
                </FormMessage>
              </>
            )}
          />
        ) : null}

        {form.formState.errors.root?.message != null && (
          <FormMessage className="text-center text-sm whitespace-break-spaces text-red-500">
            {form.formState.errors.root.message}
          </FormMessage>
        )}

        <Turnstile
          ref={captchaRef}
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY ?? ""}
          options={{ appearance: "interaction-only", size: "flexible" }}
          onSuccess={handleCaptchaVerify}
          onExpire={() => {
            setCaptchaToken(null);
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
            onClick={(event) => {
              // React reuses this button's DOM node for the submit button, so without this
              // the click would also submit the form once the button re-renders
              event.preventDefault();
              setDidCaptchaFail(false);
              captchaRef.current?.reset();
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
            style={{ viewTransitionName: "register-button" }}
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
