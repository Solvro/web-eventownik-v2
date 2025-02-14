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
import { toast } from "@/hooks/use-toast";
import { registerFormSchema } from "@/types/schemas";

import { register } from "../actions";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });
  async function onSubmit(values: z.infer<typeof registerFormSchema>) {
    setLoading(true);
    try {
      const result = await register(values);
      if ("errors" in result) {
        toast({
          variant: "destructive",
          title: "O nie! Coś poszło nie tak.",
          description: "Spróbuj zarejestrować się ponownie.",
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
        <p className="text-3xl font-black">Rejestracja organizatora</p>
        <p>Podaj swój email by się zarejestrować.</p>
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
                    placeholder="E-mail"
                    disabled={loading}
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
                <FormLabel className="sr-only">Hasło</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Hasło"
                    disabled={loading}
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
                <FormLabel className="sr-only">Imię</FormLabel>
                <FormControl>
                  <Input placeholder="Imię" disabled={loading} {...field} />
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
                <FormLabel className="sr-only">Nazwisko</FormLabel>
                <FormControl>
                  <Input placeholder="Nazwisko" disabled={loading} {...field} />
                </FormControl>
                <FormMessage className="text-sm text-red-500">
                  {form.formState.errors.lastName?.message}
                </FormMessage>
              </FormItem>
            )}
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="animate-spin" /> Tworzenie konta...
              </>
            ) : (
              "Kontynuuj"
            )}
          </Button>
          <Link
            href="/auth/login"
            className={`w-full text-neutral-600 ${buttonVariants({ variant: "link" })}`}
          >
            Posiadasz już konto? Zaloguj się
          </Link>
        </form>
      </Form>
    </>
  );
}
