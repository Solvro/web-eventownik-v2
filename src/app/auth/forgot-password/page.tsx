"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Turnstile } from "@marsidev/react-turnstile";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { Ban, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button, buttonVariants } from "@/components/ui/button";
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
import { translateOrFallback } from "@/i18n/utils";
import type { ResetPassTokenError } from "@/types/auth";
import { sendPasswordResetTokenSchema } from "@/types/schemas";
import type { AuthSchemaErrorKeys } from "@/types/schemas";

import { sendPasswordResetToken } from "../actions";

export default function ForgotPasswordPage() {
  const t = useTranslations("Auth");

  const { toast } = useToast();
  const [emailSent, setEmailSent] = useState(false);

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isAwaitingCaptcha, setIsAwaitingCaptcha] = useState<boolean>(false);
  const [didCaptchaFail, setDidCaptchaFail] = useState<boolean>(false);

  const pendingFormData = useRef<z.infer<
    typeof sendPasswordResetTokenSchema
  > | null>(null);
  const captchaRef = useRef<TurnstileInstance>(null);

  const form = useForm<z.infer<typeof sendPasswordResetTokenSchema>>({
    resolver: zodResolver(sendPasswordResetTokenSchema),
    defaultValues: {
      email: "",
    },
  });

  /**
   * Final stage of form submission with captcha token
   */
  async function submitWithCaptcha(
    values: z.infer<typeof sendPasswordResetTokenSchema>,
    token: string,
  ) {
    try {
      const result = await sendPasswordResetToken({ ...values, token });
      if (result.success) {
        setEmailSent(true);
        toast({
          title: t("emailSent"),
          description: t("checkEmailToResetPassword"),
          duration: 5000,
        });
      } else {
        toast({
          variant: "destructive",
          title: t("somethingWentWrong"),
          description: translateOrFallback(
            t,
            result.error as ResetPassTokenError,
          ),
        });
      }
    } catch (error) {
      console.error("Password reset request failed", error);
      toast({
        variant: "destructive",
        title: t("somethingWentWrong"),
        description: t("serverErrorTryLater"),
      });
    } finally {
      // Tokens are single-use, so get a fresh one for the next submission
      captchaRef.current?.reset();
      setCaptchaToken(null);
      setIsAwaitingCaptcha(false);
    }
  }

  /**
   * Triggered upon captcha verification
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
   * Form submission after Zod validation
   */
  async function handleFormSubmit(
    values: z.infer<typeof sendPasswordResetTokenSchema>,
  ) {
    if (captchaToken === null) {
      pendingFormData.current = values;
      setIsAwaitingCaptcha(true);
    } else {
      await submitWithCaptcha(values, captchaToken);
    }
  }

  if (emailSent) {
    return (
      <>
        <div className="space-y-2 text-center">
          <p className="text-3xl font-black">{t("emailSent")}</p>
          <p className="text-muted-foreground">{t("passwordResetEmailLink")}</p>
        </div>
        <div className="w-full space-y-4">
          <Link
            href="/auth/login"
            className={`w-full ${buttonVariants({ variant: "default" })}`}
          >
            {t("loginReturn")}
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-2 text-center">
        <p className="text-3xl font-black">{t("forgotPassword")}</p>
        <p className="text-neutral-600">{t("forgotPasswordDescription")}</p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="w-full space-y-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">{t("email")}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    disabled={form.formState.isSubmitting || isAwaitingCaptcha}
                    placeholder={t("email")}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-sm text-red-500">
                  {translateOrFallback(
                    t,
                    form.formState.errors.email?.message as AuthSchemaErrorKeys,
                  )}
                </FormMessage>
              </FormItem>
            )}
          />

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
              className="w-full"
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
              disabled={form.formState.isSubmitting || isAwaitingCaptcha}
              className="w-full"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" /> {t("sending")}
                </>
              ) : isAwaitingCaptcha ? (
                <>
                  <Loader2 className="animate-spin" /> {t("captchaInProgress")}
                </>
              ) : (
                t("sendResetLink")
              )}
            </Button>
          )}

          <Link
            href="/auth/login"
            className={`w-full text-neutral-600 ${buttonVariants({
              variant: "link",
            })}`}
          >
            {t("loginReturn")}
          </Link>
        </form>
      </Form>
    </>
  );
}
