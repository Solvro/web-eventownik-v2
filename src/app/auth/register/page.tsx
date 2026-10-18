"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Info, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
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
   * Submit validated credentials using the v3 authentication contract
   */
  async function handleFormSubmit(values: z.infer<typeof registerFormSchema>) {
    try {
      const result = await register(values);
      if ("errors" in result) {
        toast({
          variant: "destructive",
          title: t("somethingWentWrong"),
          description: t("tryRegisterAgain"),
        });
      } else {
        const redirectUrl =
          redirectTo?.startsWith("/dashboard") === true &&
          !redirectTo.includes("\\")
            ? redirectTo
            : "/dashboard/events";
        router.push(redirectUrl);
      }
    } catch (error) {
      console.error("Registration failed", error);
      toast({
        variant: "destructive",
        title: t("noServerConnection"),
        description: t("checkInternetConnection"),
      });
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
                  disabled={form.formState.isSubmitting}
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
                  disabled={form.formState.isSubmitting}
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
                  disabled={form.formState.isSubmitting}
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
                  disabled={form.formState.isSubmitting}
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

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="animate-spin" /> {t("creatingAccount")}
            </>
          ) : (
            t("continue")
          )}
        </Button>

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
