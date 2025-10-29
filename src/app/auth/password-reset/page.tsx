"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
import { resetPasswordSchema } from "@/types/schemas";

import { resetPassword } from "../actions";

function ResetPasswordForm() {
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
        title: "Hasło zostało zresetowane!",
        description: "Możesz się teraz zalogować używając nowego hasła.",
        duration: 5000,
      });
    } else {
      toast({
        variant: "destructive",
        title: "O nie! Coś poszło nie tak.",
        description: result.error,
      });
    }
  }

  if (token == null) {
    return (
      <>
        <div className="space-y-2 text-center">
          <p className="text-3xl font-black">Nieprawidłowy link</p>
          <p className="text-neutral-600">
            Link do resetowania hasła jest nieprawidłowy lub wygasł.
          </p>
        </div>
        <div className="w-full max-w-sm space-y-4">
          <Link
            href="/auth/forgot-password"
            className={`w-full ${buttonVariants({ variant: "default" })}`}
          >
            Wyślij nowy link
          </Link>
          <Link
            href="/auth/login"
            className={`w-full text-neutral-600 ${buttonVariants({
              variant: "link",
            })}`}
          >
            Powrót do logowania
          </Link>
        </div>
      </>
    );
  }

  if (passwordReset) {
    return (
      <>
        <div className="space-y-2 text-center">
          <p className="text-3xl font-black">Hasło zostało zresetowane!</p>
          <p className="text-muted-foreground">
            Możesz się teraz zalogować używając nowego hasła.
          </p>
        </div>
        <div className="w-full max-w-sm space-y-4">
          <Link
            href="/auth/login"
            className={`w-full ${buttonVariants({ variant: "default" })}`}
          >
            Przejdź do logowania
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-2 text-center">
        <p className="text-3xl font-black">Resetowanie hasła</p>
        <p className="text-muted-foreground">
          Wprowadź nowe hasło do swojego konta.
        </p>
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
                <FormLabel className="sr-only">Nowe hasło</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    disabled={form.formState.isSubmitting}
                    placeholder="Nowe hasło"
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
                <FormLabel className="sr-only">Potwierdź hasło</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    disabled={form.formState.isSubmitting}
                    placeholder="Potwierdź hasło"
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
                <Loader2 className="animate-spin" /> Resetowanie...
              </>
            ) : (
              "Zresetuj hasło"
            )}
          </Button>
          <Link
            href="/auth/login"
            className={`w-full text-neutral-600 ${buttonVariants({
              variant: "link",
            })}`}
          >
            Powrót do logowania
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
