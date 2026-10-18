"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Turnstile } from "@marsidev/react-turnstile";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { Ban, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { SubmitFormError } from "@/app/[eventSlug]/actions";
import { AttributeInput } from "@/components/attribute-input";
import { AttributeInputDrawing } from "@/components/attribute-input-drawing";
import {
  AttributeInputFile,
  fileSchema,
  parseFileValidationErrorMessage,
} from "@/components/attribute-input-file";
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
  getAttributeLabel,
  getSchemaObjectForAttributes,
} from "@/lib/utils";
import type { FormValidationErrors } from "@/lib/utils";
import type { FormControlAttribute } from "@/types/attributes";
import type { PublicBlock } from "@/types/blocks";

interface ErrorObject {
  rule: string;
  field: string;
  message: string;
}

interface ParticipantFormProps {
  attributes: FormControlAttribute[];
  onSubmit: (
    values: Record<string, unknown>,
    files: File[],
  ) => Promise<{
    success: boolean;
    errors?: ErrorObject[];
    error?: SubmitFormError;
  }>;
  includeEmail?: boolean;
  initialValues?: Record<string, unknown>;
  lastUpdated?: Record<string, string>;
  selectedBlockUuids?: string[];
  eventSlug?: string;
  eventBlocks?: PublicBlock[];
  editMode?: boolean;
}

export function ParticipantForm({
  attributes,
  onSubmit,
  includeEmail = false,
  initialValues,
  lastUpdated,
  selectedBlockUuids,
  eventSlug,
  eventBlocks = [],
  editMode = false,
}: ParticipantFormProps) {
  const t = useTranslations("Form");
  const tEventDetails = useTranslations("EventDetails");

  const locale = useLocale();
  const router = useRouter();

  const captchaSitekey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY?.trim() ?? "";
  const [files, setFiles] = useState<File[]>([]);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isAwaitingCaptcha, setIsAwaitingCaptcha] = useState<boolean>(false);
  const [didCaptchaFail, setDidCaptchaFail] = useState<boolean>(false);
  const [isCaptchaReady, setIsCaptchaReady] = useState(false);
  const [isCaptchaOpen, setIsCaptchaOpen] = useState(false);
  const [captchaAttempt, setCaptchaAttempt] = useState(0);
  const [success, setSuccess] = useState<boolean>(false);
  const sortedAttributes = useMemo(
    () => attributes.toSorted((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [attributes],
  );

  const pendingFormData = useRef<z.infer<typeof formSchema> | null>(null);
  const captchaRef = useRef<TurnstileInstance>(null);

  useEffect(() => {
    if (!isAwaitingCaptcha || isCaptchaOpen || captchaToken !== null) {
      return;
    }
    // The SDK can load its script but fail to initialize the widget without
    // emitting onError. Recover if execution never opens or verifies it.
    const timeout = window.setTimeout(() => {
      pendingFormData.current = null;
      setIsAwaitingCaptcha(false);
      setIsCaptchaReady(false);
      setDidCaptchaFail(true);
    }, 15_000);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [isAwaitingCaptcha, isCaptchaOpen, captchaToken]);

  const submitText = editMode ? t("save") : t("register");
  const submittingText = editMode ? t("saving") : t("registering");
  const successMessage = editMode ? t("saved") : t("registrationSuccess");

  // Generate schema for the form based on event attributes
  const formSchema = z.object({
    ...(includeEmail && { email: z.string().email(t("invalidEmail")) }),
    ...getSchemaObjectForAttributes(attributes),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...(includeEmail && { email: "" }),
      ...initialValues,
    },
  });

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
      // Turnstile tokens are single-use: every attempt needs a fresh challenge.
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
   * Checks captcha status: executes captcha if not yet verified, and
   * if captcha is verified, submits form right away - noticable in edit mode.
   *
   * After this function finishes, `form.formState.isSubmitSuccessful` will be true, that's why
   * we don't rely on it to show the success screen.
   */
  async function handleFormSubmit(values: z.infer<typeof formSchema>) {
    // Validate required file/drawing attributes
    const requiredFileDrawingAttributes = sortedAttributes.filter(
      (attribute) =>
        attribute.isRequired &&
        (attribute.type === "file" || attribute.type === "drawing"),
    );

    let hasValidationErrors = false;

    for (const file of files) {
      const validation = fileSchema.safeParse(file);
      if (!validation.success) {
        const issue = validation.error.errors[0].message;
        const parsed = parseFileValidationErrorMessage(issue);
        form.setError(file.name, {
          message:
            parsed === null ? issue : tEventDetails(parsed.key, parsed.values),
        });
        hasValidationErrors = true;
      }
    }

    for (const attribute of requiredFileDrawingAttributes) {
      const hasFile = files.some((file) => file.name === attribute.uuid);
      const hasExistingValue = lastUpdated?.[attribute.uuid] !== undefined;

      if (!hasFile && !hasExistingValue) {
        hasValidationErrors = true;
        form.setError(attribute.uuid, {
          message:
            attribute.type === "file"
              ? t("fileUploadRequired")
              : t("drawingRequired"),
        });
      }
    }

    if (hasValidationErrors) {
      return;
    }

    if (captchaToken === null && !isCaptchaReady) {
      setDidCaptchaFail(true);
      setIsAwaitingCaptcha(false);
      return;
    }

    if (captchaToken === null) {
      pendingFormData.current = values;

      setIsAwaitingCaptcha(true);
      try {
        captchaRef.current?.execute();
      } catch {
        pendingFormData.current = null;
        setIsAwaitingCaptcha(false);
        setIsCaptchaReady(false);
        setDidCaptchaFail(true);
      }
    } else {
      await submitWithCaptcha(values, captchaToken);
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

        {sortedAttributes.map((attribute) => {
          return (
            <FormField
              key={attribute.uuid}
              control={form.control}
              name={attribute.uuid}
              render={({ field }) => (
                <FormItem
                  className={cn(
                    attribute.type === "checkbox" &&
                      "flex flex-row-reverse items-start justify-end space-y-0",
                  )}
                >
                  <FormLabel htmlFor={attribute.uuid}>
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
                        lastUpdate={lastUpdated?.[attribute.uuid] ?? null}
                      />
                    ) : attribute.type === "drawing" ? (
                      <AttributeInputDrawing
                        attribute={attribute}
                        field={field}
                        setError={form.control.setError}
                        resetField={form.resetField}
                        setFiles={setFiles}
                        lastUpdate={lastUpdated?.[attribute.uuid] ?? null}
                      />
                    ) : (
                      <AttributeInput
                        attribute={attribute}
                        selectedBlockUuids={selectedBlockUuids}
                        eventSlug={eventSlug}
                        eventBlocks={eventBlocks.filter(
                          (block) => block.attributeUuid === attribute.uuid,
                        )}
                        field={field}
                        requireSelectionState={editMode}
                      />
                    )}
                  </FormControl>
                  <FormMessage className="text-sm text-red-500">
                    {translateOrFallback(
                      t,
                      (
                        form.formState.errors as Record<
                          string,
                          { message?: string } | undefined
                        >
                      )[attribute.uuid]?.message as FormValidationErrors,
                      { name: getAttributeLabel(attribute.name, "pl") },
                    )}
                  </FormMessage>
                </FormItem>
              )}
            />
          );
        })}

        {form.formState.errors.root?.message != null && (
          <FormMessage className="text-center text-sm whitespace-break-spaces text-red-500">
            {form.formState.errors.root.message}
          </FormMessage>
        )}

        {captchaSitekey === "" ? (
          <p
            role="alert"
            aria-label={t("captchaMisconfigured")}
            className="text-center text-sm text-red-500"
          >
            {t("captchaMisconfigured")}
          </p>
        ) : null}

        {captchaSitekey !== "" && (
          <Turnstile
            key={captchaAttempt}
            onWidgetLoad={() => {
              setIsCaptchaReady(true);
            }}
            ref={captchaRef}
            siteKey={captchaSitekey}
            options={{
              language: locale,
              execution: "execute",
              appearance: "interaction-only",
            }}
            onSuccess={handleCaptchaVerify}
            onBeforeInteractive={() => {
              setIsCaptchaOpen(true);
            }}
            onExpire={() => {
              setCaptchaToken(null);
              setDidCaptchaFail(true);
              setIsAwaitingCaptcha(false);
              pendingFormData.current = null;
            }}
            onAfterInteractive={() => {
              // Turnstile hides the challenge once solved; the token follows via onSuccess.
              setIsCaptchaOpen(false);
            }}
            onError={(captchaError) => {
              setIsCaptchaOpen(false);
              console.error("Captcha error occurred:", captchaError);
              setIsCaptchaReady(false);
              setCaptchaToken(null);
              setDidCaptchaFail(true);
              setIsAwaitingCaptcha(false);
              pendingFormData.current = null;
            }}
          />
        )}

        {didCaptchaFail ? (
          <Button
            type="button"
            variant="destructive"
            className="sticky bottom-4 w-full shadow-lg md:bottom-0"
            onClick={() => {
              setDidCaptchaFail(false);
              setIsAwaitingCaptcha(false);
              setIsCaptchaReady(false);
              setCaptchaToken(null);
              pendingFormData.current = null;
              setCaptchaAttempt((attempt) => attempt + 1);
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
