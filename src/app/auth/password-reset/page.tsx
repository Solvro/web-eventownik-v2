"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
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
import { RESET_ERRORS } from "@/types/auth";
import type { ResetError } from "@/types/auth";
import { resetPasswordSchema } from "@/types/schemas";

import { resetPassword } from "../actions";

function ResetPasswordForm() {
  const t = useTranslations("Auth");
  const { toast } = useToast();
  const searchParameters = useSearchParams();
  const token = searchParameters.get("token");
  const [passwordReset, setPasswordReset] = useState(false);

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token ?? "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
    const result = await resetPassword(values);
    if (result.success) {
      setPasswordReset(true);
      toast({
        title: t("passwordResetSuccess"),
        description: t("loginWithNewPassword"),
        duration: 5000,
      });
    } else {
      toast({
        variant: "destructive",
        title: t("somethingWentWrong"),
        description: RESET_ERRORS.includes(result.error as ResetError)
          ? t(result.error as ResetError)
          : result.error,
      });
    }
  }

  if (token == null) {
    return (
      <>
        <div className="space-y-2 text-center">
          <p className="text-3xl font-black">{t("invalidLink")}</p>
          <p className="text-neutral-600">{t("resetLinkInvalidOrExpired")} </p>
        </div>
        <div className="w-full max-w-sm space-y-4">
          <Link
            href="/auth/forgot-password"
            className={`w-full ${buttonVariants({ variant: "default" })}`}
          >
            {t("sendNewLink")}
          </Link>
          <Link
            href="/auth/login"
            className={`w-full text-neutral-600 ${buttonVariants({
              variant: "link",
            })}`}
          >
            {t("loginReturn")}
          </Link>
        </div>
      </>
    );
  }

  if (passwordReset) {
    return (
      <>
        <div className="space-y-2 text-center">
          <p className="text-3xl font-black">{t("passwordResetSuccess")}</p>
          <p className="text-muted-foreground">{t("loginWithNewPassword")}</p>
        </div>
        <div className="w-full max-w-sm space-y-4">
          <Link
            href="/auth/login"
            className={`w-full ${buttonVariants({ variant: "default" })}`}
          >
            {t("goToLogin")}
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-2 text-center">
        <p className="text-3xl font-black">{t("resettingPassword")}</p>
        <p className="text-muted-foreground">{t("enterNewPassword")}</p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full max-w-sm space-y-4"
        >
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">{t("newPassword")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    disabled={form.formState.isSubmitting}
                    placeholder={t("newPassword")}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-sm text-red-500">
                  {form.formState.errors.newPassword?.message}
                </FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">
                  {t("confirmPassword")}
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    disabled={form.formState.isSubmitting}
                    placeholder={t("confirmPassword")}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-sm text-red-500">
                  {form.formState.errors.confirmPassword?.message}
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
                <Loader2 className="animate-spin" /> {t("resetting")}
              </>
            ) : (
              t("resetPassword")
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

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
