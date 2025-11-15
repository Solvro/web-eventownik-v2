"use client";

import HCaptcha from "@hcaptcha/react-hcaptcha";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { loginFormSchema } from "@/types/schemas";

import { login } from "../actions";

function LoginForm() {
  const t = useTranslations("Auth");

  const { toast } = useToast();
  const router = useRouter();
  const searchParameters = useSearchParams();
  const redirectTo = searchParameters.get("redirectTo");

  const [hCaptchaToken, setHCaptchaToken] = useState<string | null>(null);
  const [isAwaitingCaptcha, setIsAwaitingCaptcha] = useState<boolean>(false);
  const [didCaptchaFail, setDidCaptchaFail] = useState<boolean>(false);

  const pendingFormData = useRef<z.infer<typeof loginFormSchema> | null>(null);
  const hCaptchaRef = useRef<HCaptcha>(null);

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
          title: "Logowanie zakończone sukcesem!",
          duration: 2000,
        });
        const redirectUrl = redirectTo ?? "/dashboard/events";
        router.replace(redirectUrl);
      } else {
        toast({
          variant: "destructive",
          title: "O nie! Coś poszło nie tak.",
          description: result.error,
        });
      }
    } catch (error) {
      console.error("Login failed", error);
      toast({
        variant: "destructive",
        title: "O nie! Coś poszło nie tak.",
        description: "Wystąpił błąd serwera. Spróbuj ponownie później.",
      });
    } finally {
      hCaptchaRef.current?.resetCaptcha();
      setIsAwaitingCaptcha(false);
    }
  }

  /**
   * Triggered upon captcha verification
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
   * Form submission after Zod validation
   */
  async function handleFormSubmit(values: z.infer<typeof loginFormSchema>) {
    if (hCaptchaToken === null) {
      pendingFormData.current = values;
      setIsAwaitingCaptcha(true);
      hCaptchaRef.current?.execute();
    } else {
      await submitWithCaptcha(values, hCaptchaToken);
    }
  }

  return (
    <>
      {redirectTo !== null && redirectTo !== "/dashboard/events" && (
        <Alert variant="destructive">
          <AlertCircleIcon className="!text-red-500" />
          <AlertTitle>
            <p className="font-black text-red-500">{t("loginDisclaimer")}</p>
          </AlertTitle>
        </Alert>
      )}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="w-full max-w-sm space-y-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">E-mail</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    disabled={form.formState.isSubmitting || isAwaitingCaptcha}
                    placeholder="E-mail"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-sm text-red-500">
                  {form.formState.errors.email?.message}
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
                  {form.formState.errors.password?.message}
                </FormMessage>
                <FormMessage>
                  <Link
                    href="/auth/forgot-password"
                    className="text-muted-foreground block w-full text-right text-sm leading-none hover:underline"
                  >
                    {t("forgotPassword")}
                  </Link>
                </FormMessage>
              </FormItem>
            )}
          />

          <HCaptcha
            ref={hCaptchaRef}
            sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY ?? ""}
            size="invisible"
            onVerify={handleCaptchaVerify}
            onExpire={() => {
              setHCaptchaToken(null);
              setDidCaptchaFail(true);
              setIsAwaitingCaptcha(false);
            }}
            onClose={() => {
              setDidCaptchaFail(true);
              setIsAwaitingCaptcha(false);
            }}
            onError={(captchaError) => {
              console.error("Captcha error occured:", captchaError);
              setDidCaptchaFail(true);
              setIsAwaitingCaptcha(false);
            }}
          />

          {didCaptchaFail ? (
            <Button
              type="button"
              variant="destructive"
              className="w-full"
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
              disabled={form.formState.isSubmitting || isAwaitingCaptcha}
              className="w-full"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" /> {t("loggingIn")}...
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
