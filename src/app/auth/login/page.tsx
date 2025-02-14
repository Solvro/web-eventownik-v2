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
import { loginFormSchema } from "@/types/schemas";

import { login } from "../actions";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  async function onSubmit(values: z.infer<typeof loginFormSchema>) {
    setLoading(true);
    try {
      const result = await login(values);
      if ("errors" in result) {
        toast({
          variant: "destructive",
          title: "O nie! Coś poszło nie tak.",
          description: "Spróbuj zalogować się ponownie.",
        });
      }
    } catch {
      // this error only happens when the client has no internet connection (afaik)
      toast({
        variant: "destructive",
        title: "Brak połączenia z serwerem.",
        description: "Sprawdź swoje połączenie z internetem.",
      });
    }
    setLoading(false);
  }
  return (
    <>
      <div className="space-y-2 text-center">
        <p className="text-3xl font-black">Logowanie organizatora</p>
        <p>Podaj swój email by się zalogować.</p>
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
                    disabled={loading}
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
                    disabled={loading}
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
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="animate-spin" /> Logowanie...
              </>
            ) : (
              "Kontynuuj"
            )}
          </Button>
          <Link
            href="/auth/register"
            className={`w-full text-neutral-600 ${buttonVariants({ variant: "link" })}`}
          >
            Nie masz jeszcze konta? Zarejestruj się
          </Link>
        </form>
      </Form>
    </>
  );
}
