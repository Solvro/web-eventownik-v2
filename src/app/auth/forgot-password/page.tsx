"use client";

import HCaptcha from "@hcaptcha/react-hcaptcha";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { sendPasswordResetTokenSchema } from "@/types/schemas";

import { sendPasswordResetToken } from "../actions";

export default function ForgotPasswordPage() {
  const t = useTranslations("Auth");

  const { toast } = useToast();
  const [emailSent, setEmailSent] = useState(false);

  const [hCaptchaToken, setHCaptchaToken] = useState<string | null>(null);
  const [isAwaitingCaptcha, setIsAwaitingCaptcha] = useState<boolean>(false);
  const [didCaptchaFail, setDidCaptchaFail] = useState<boolean>(false);

  const pendingFormData = useRef<z.infer<
    typeof sendPasswordResetTokenSchema
  > | null>(null);
  const hCaptchaRef = useRef<HCaptcha>(null);

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
          title: "Email został wysłany!",
          description: "Sprawdź swoją skrzynkę pocztową, aby zresetować hasło.",
          duration: 5000,
        });
      } else {
        toast({
          variant: "destructive",
          title: "O nie! Coś poszło nie tak.",
          description: result.error,
        });
      }
    } catch (error) {
      console.error("Password reset request failed", error);
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
  async function handleFormSubmit(
    values: z.infer<typeof sendPasswordResetTokenSchema>,
  ) {
    if (hCaptchaToken === null) {
      pendingFormData.current = values;
      setIsAwaitingCaptcha(true);
      hCaptchaRef.current?.execute();
    } else {
      await submitWithCaptcha(values, hCaptchaToken);
    }
  }

  if (emailSent) {
    return (
      <>
        <div className="space-y-2 text-center">
          <p className="text-3xl font-black">Email został wysłany!</p>
          <p className="text-muted-foreground">
            Sprawdź swoją skrzynkę pocztową i kliknij w link, aby zresetować
            hasło.
          </p>
        </div>
        <div className="w-full max-w-sm space-y-4">
          <Link
            href="/auth/login"
            className={`w-full ${buttonVariants({ variant: "default" })}`}
          >
            Powrót do logowania
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-2 text-center">
        <p className="text-3xl font-black">{t("resetPasswordTitle")}</p>
        <p className="text-neutral-600">{t("resetPasswordDescription")}</p>
      </div>
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
