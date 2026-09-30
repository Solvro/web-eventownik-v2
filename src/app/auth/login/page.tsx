"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Turnstile } from "@marsidev/react-turnstile";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { AlertCircleIcon, Ban, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Alert, AlertTitle } from "@/components/ui/alert";
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
import type { LoginError } from "@/types/auth";
import { loginFormSchema } from "@/types/schemas";
import type { AuthSchemaErrorKeys } from "@/types/schemas";

import { login } from "../actions";

function LoginForm() {
  const t = useTranslations("Auth");

  const { toast } = useToast();
  const router = useRouter();
  const searchParameters = useSearchParams();
  const redirectTo = searchParameters.get("redirectTo");

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isAwaitingCaptcha, setIsAwaitingCaptcha] = useState<boolean>(false);
  const [didCaptchaFail, setDidCaptchaFail] = useState<boolean>(false);

  const pendingFormData = useRef<z.infer<typeof loginFormSchema> | null>(null);
  const captchaRef = useRef<TurnstileInstance>(null);

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  /**
   * Final stage of form submission with captcha token
   */
  async function submitWithCaptcha(
    values: z.infer<typeof loginFormSchema>,
    token: string,
  ) {
    try {
      const result = await login({ ...values, token });
      if (result.success) {
        toast({
          title: t("loginSuccessful"),
          duration: 2000,
        });
        const redirectUrl = redirectTo ?? "/dashboard/events";
        router.push(redirectUrl);
      } else {
        toast({
          variant: "destructive",
          title: t("somethingWentWrong"),
          description: translateOrFallback(t, result.error as LoginError),
        });
      }
    } catch (error) {
      console.error("Login failed", error);
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
  async function handleFormSubmit(values: z.infer<typeof loginFormSchema>) {
    if (captchaToken === null) {
      pendingFormData.current = values;
      setIsAwaitingCaptcha(true);
    } else {
      await submitWithCaptcha(values, captchaToken);
    }
  }

  return (
    <>
      {redirectTo !== null && redirectTo !== "/dashboard/events" && (
        <Alert variant="destructive">
          <AlertCircleIcon className="!text-red-500" />
          <AlertTitle className="line-clamp-none">
            <p className="font-black text-red-500">{t("loginDisclaimer")}</p>
          </AlertTitle>
        </Alert>
      )}
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">{t("passwordLabel")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    disabled={form.formState.isSubmitting || isAwaitingCaptcha}
                    placeholder={t("passwordLabel")}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-sm text-red-500">
                  {translateOrFallback(
                    t,
                    form.formState.errors.password
                      ?.message as AuthSchemaErrorKeys,
                  )}
                </FormMessage>
                <Link
                  href="/auth/forgot-password"
                  className="text-muted-foreground block w-full text-right text-sm leading-none font-medium hover:underline"
                >
                  {t("forgotPassword")}
                </Link>
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
                  <Loader2 className="animate-spin" /> {t("loggingIn")}
                </>
              ) : isAwaitingCaptcha ? (
                <>
                  <Loader2 className="animate-spin" /> {t("captchaInProgress")}
                </>
              ) : (
                t("continue")
              )}
            </Button>
          )}

          <Link
            href={`/auth/register${redirectTo == null ? "" : `?redirectTo=${encodeURIComponent(redirectTo)}`}`}
            className={`w-full text-neutral-600 ${buttonVariants({
              variant: "link",
            })}`}
          >
            {t("noAccountYet")}
          </Link>
        </form>
      </Form>
    </>
  );
}

// TODO: Why two separate components?
export default function LoginPage() {
  const t = useTranslations("Auth");

  return (
    <>
      <div className="space-y-2 text-center">
        <p className="text-3xl font-black">{t("loginTitle")}</p>
        <p>{t("loginDescription")}</p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </>
  );
}
