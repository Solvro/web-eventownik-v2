"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
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

  const form = useForm<z.infer<typeof sendPasswordResetTokenSchema>>({
    resolver: zodResolver(sendPasswordResetTokenSchema),
    defaultValues: {
      email: "",
    },
  });

  /**
   * Submit validated credentials using the v3 authentication contract
   */
  async function handleFormSubmit(
    values: z.infer<typeof sendPasswordResetTokenSchema>,
  ) {
    try {
      const result = await sendPasswordResetToken(values);
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
                    disabled={form.formState.isSubmitting}
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

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full"
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="animate-spin" /> {t("sending")}
              </>
            ) : (
              t("sendResetLink")
            )}
          </Button>

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
