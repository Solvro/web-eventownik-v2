"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
import { sendPasswordResetTokenSchema } from "@/types/schemas";

import { sendPasswordResetToken } from "../actions";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<z.infer<typeof sendPasswordResetTokenSchema>>({
    resolver: zodResolver(sendPasswordResetTokenSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(
    values: z.infer<typeof sendPasswordResetTokenSchema>,
  ) {
    const result = await sendPasswordResetToken(values);
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
        <p className="text-3xl font-black">Zapomniałeś hasła?</p>
        <p className="text-neutral-600">
          Podaj swój adres email, a wyślemy Ci link do zresetowania hasła.
        </p>
      </div>
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
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full"
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="animate-spin" /> Wysyłanie...
              </>
            ) : (
              "Wyślij link resetujący"
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
