"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Turnstile } from "@marsidev/react-turnstile";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { Ban, Info, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";
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
import { toast } from "@/hooks/use-toast";
import { translateOrFallback } from "@/i18n/utils";
import { registerFormSchema } from "@/types/schemas";
import type { AuthSchemaErrorKeys } from "@/types/schemas";

import { register } from "../actions";

function RegisterForm() {
  const t = useTranslations("Auth");

  const router = useRouter();
  const searchParameters = useSearchParams();
  const redirectTo = searchParameters.get("redirectTo");

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isAwaitingCaptcha, setIsAwaitingCaptcha] = useState<boolean>(false);
  const [didCaptchaFail, setDidCaptchaFail] = useState<boolean>(false);

  const pendingFormData = useRef<z.infer<typeof registerFormSchema> | null>(
    null,
  );
  const captchaRef = useRef<TurnstileInstance>(null);

  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  /**
   * Final stage of form submission with captcha token
   */
  async function submitWithCaptcha(
    values: z.infer<typeof registerFormSchema>,
    token: string,
  ) {
    try {
      const result = await register({ ...values, token });
      if ("errors" in result) {
        toast({
          variant: "destructive",
          title: t("somethingWentWrong"),
          description: t("tryRegisterAgain"),
        });
      } else {
        const redirectUrl = redirectTo ?? "/dashboard/events";
        router.push(redirectUrl);
      }
    } catch (error) {
      console.error("Registration failed", error);
      toast({
        variant: "destructive",
        title: t("noServerConnection"),
        description: t("checkInternetConnection"),
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
  async function handleFormSubmit(values: z.infer<typeof registerFormSchema>) {
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
                  placeholder={t("email")}
                  disabled={form.formState.isSubmitting || isAwaitingCaptcha}
                  type="email"
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
                  placeholder={t("passwordLabel")}
                  disabled={form.formState.isSubmitting || isAwaitingCaptcha}
                  type="password"
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
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">{t("nameLabel")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("nameLabel")}
                  disabled={form.formState.isSubmitting || isAwaitingCaptcha}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-sm text-red-500">
                {translateOrFallback(
                  t,
                  form.formState.errors.firstName
                    ?.message as AuthSchemaErrorKeys,
                )}
              </FormMessage>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">{t("surnameLabel")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("surnameLabel")}
                  disabled={form.formState.isSubmitting || isAwaitingCaptcha}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-sm text-red-500">
                {translateOrFallback(
                  t,
                  form.formState.errors.lastName
                    ?.message as AuthSchemaErrorKeys,
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
                <Loader2 className="animate-spin" /> {t("creatingAccount")}
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
          href="/auth/login"
          className={`w-full text-neutral-600 ${buttonVariants({ variant: "link" })}`}
        >
          {t("loginExisting")}
        </Link>
      </form>
    </Form>
  );
}

export default function RegisterPage() {
  const t = useTranslations("Auth");
  return (
    <>
      <div className="space-y-2 text-center">
        <p className="text-3xl font-black">{t("registerTitle")}</p>
        <p>{t("registerDescription")}</p>
      </div>
      <Suspense>
        <RegisterForm />
      </Suspense>
      <p className="text-foreground/50 max-w-sm text-center text-sm">
        <Info className="inline-block size-4 align-[-0.195em]" />{" "}
        {t.rich("termsAgreement", {
          Link: (chunks) => (
            <Link
              href="https://drive.google.com/file/d/1h4f-koiR-Ab2JPrOe7p5JXjohi83mrvB/view"
              className="text-primary/90"
              target="_blank"
            >
              {chunks}
            </Link>
          ),
        })}
      </p>
    </>
  );
}
