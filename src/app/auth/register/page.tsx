"use client";

import HCaptcha from "@hcaptcha/react-hcaptcha";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { registerFormSchema } from "@/types/schemas";

import { register } from "../actions";

function RegisterForm() {
  const t = useTranslations("Auth");

  const router = useRouter();
  const searchParameters = useSearchParams();
  const redirectTo = searchParameters.get("redirectTo");

  const [hCaptchaToken, setHCaptchaToken] = useState<string | null>(null);
  const [isAwaitingCaptcha, setIsAwaitingCaptcha] = useState<boolean>(false);
  const [didCaptchaFail, setDidCaptchaFail] = useState<boolean>(false);

  const pendingFormData = useRef<z.infer<typeof registerFormSchema> | null>(
    null,
  );
  const hCaptchaRef = useRef<HCaptcha>(null);

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
          title: "O nie! Coś poszło nie tak.",
          description: "Spróbuj zarejestrować się ponownie.",
        });
      } else {
        const redirectUrl = redirectTo ?? "/dashboard/events";
        router.replace(redirectUrl);
      }
    } catch (error) {
      console.error("Registration failed", error);
      toast({
        variant: "destructive",
        title: "Brak połączenia z serwerem.",
        description: "Sprawdź swoje połączenie z internetem.",
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
  async function handleFormSubmit(values: z.infer<typeof registerFormSchema>) {
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
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">E-mail</FormLabel>
              <FormControl>
                <Input
                  placeholder="E-mail"
                  disabled={form.formState.isSubmitting || isAwaitingCaptcha}
                  type="email"
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
                  placeholder={t("passwordLabel")}
                  disabled={form.formState.isSubmitting || isAwaitingCaptcha}
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-sm text-red-500">
                {form.formState.errors.password?.message}
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
                {form.formState.errors.firstName?.message}
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
                {form.formState.errors.lastName?.message}
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
          }}
          onClose={() => {
            setDidCaptchaFail(true);
          }}
          onError={(captchaError) => {
            console.error("Captcha error occured:", captchaError);
            setDidCaptchaFail(true);
          }}
        />

        {didCaptchaFail ? (
          <Button
            type="button"
            variant="destructive"
            className="w-full"
            onClick={() => {
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
                <Loader2 className="animate-spin" /> {t("creatingAccout")}
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
      <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 pb-4 text-center text-sm sm:pb-0">
        <Info className="size-6" />
        <p>
          Rejestrując konto, zgadzasz się na warunki zawarte w <br />
          <Link
            href="https://drive.google.com/file/d/1h4f-koiR-Ab2JPrOe7p5JXjohi83mrvB/view"
            className="text-primary/90"
            target="_blank"
          >
            regulaminie platformy
          </Link>
        </p>
      </div>
    </>
  );
}
