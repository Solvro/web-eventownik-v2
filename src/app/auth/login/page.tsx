"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { loginFormSchema } from "@/types";

import { login } from "../actions";

export default function LoginPage() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  async function onSubmit(values: z.infer<typeof loginFormSchema>) {
    toast({
      description: "Logowanie...",
    });
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
                <FormControl>
                  <Input type="email" placeholder="E-mail" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="password" placeholder="Hasło" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            Kontynuuj
          </Button>
          <Button className="w-full text-neutral-600" variant="link" asChild>
            <Link href="/auth/register">
              Nie masz jeszcze konta? Zarejestruj się
            </Link>
          </Button>
        </form>
      </Form>
    </>
  );
}
