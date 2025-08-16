"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, Loader2 } from "lucide-react";
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
import { loginFormSchema } from "@/types/schemas";

import { login } from "../actions";

function LoginForm() {
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

  async function onSubmit(values: z.infer<typeof loginFormSchema>) {
    const result = await login(values);
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
  }

  return (
    <>
      {redirectTo !== null && redirectTo !== "/dashboard/events" && (
        <Alert variant="destructive">
          <AlertCircleIcon className="!text-red-500" />
          <AlertTitle>
            <p className="font-black text-red-500">
              Żeby zarządzać wydarzeniami najpierw musisz się zalogować!
            </p>
          </AlertTitle>
        </Alert>
      )}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
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
                    disabled={form.formState.isSubmitting}
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
                <FormLabel className="sr-only">Hasło</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    disabled={form.formState.isSubmitting}
                    placeholder="Hasło"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-sm text-red-500">
                  {form.formState.errors.password?.message}
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
                <Loader2 className="animate-spin" /> Logowanie...
              </>
            ) : (
              "Kontynuuj"
            )}
          </Button>
          <Link
            href={`/auth/register${redirectTo == null ? "" : `?redirectTo=${encodeURIComponent(redirectTo)}`}`}
            className={`w-full text-neutral-600 ${buttonVariants({
              variant: "link",
            })}`}
          >
            Nie masz jeszcze konta? Zarejestruj się
          </Link>
        </form>
      </Form>
    </>
  );
}

export default function LoginPage() {
  return (
    <>
      <div className="space-y-2 text-center">
        <p className="text-3xl font-black">Logowanie organizatora</p>
        <p>Podaj swój email by się zalogować.</p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </>
  );
}
