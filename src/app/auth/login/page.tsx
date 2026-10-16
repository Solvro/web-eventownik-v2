"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
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

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  /**
   * Submit validated credentials using the v3 authentication contract
   */
  async function handleFormSubmit(values: z.infer<typeof loginFormSchema>) {
    try {
      const result = await login(values);
      if (result.success) {
        toast({
          title: t("loginSuccessful"),
          duration: 2000,
        });
        const redirectUrl =
          redirectTo?.startsWith("/dashboard") === true &&
          !redirectTo.includes("\\")
            ? redirectTo
            : "/dashboard/events";
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">{t("passwordLabel")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    disabled={form.formState.isSubmitting}
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

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full"
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="animate-spin" /> {t("loggingIn")}
              </>
            ) : (
              t("continue")
            )}
          </Button>

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
