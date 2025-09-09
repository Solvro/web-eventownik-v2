"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Info, Loader2 } from "lucide-react";
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
import { registerFormSchema } from "@/types/schemas";

import { register } from "../actions";

function RegisterForm() {
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

  async function onSubmit(values: z.infer<typeof registerFormSchema>) {
    try {
      const result = await register(values);
      if ("errors" in result) {
        toast({
          variant: "destructive",
          title: "O nie! Coś poszło nie tak.",
          description: "Spróbuj zarejestrować się ponownie.",
        });
      } else {
        const redirectUrl = redirectTo ?? "/dashboard/events";
        router.replace(redirectUrl);
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Brak połączenia z serwerem.",
        description: "Sprawdź swoje połączenie z internetem.",
      });
    }
  }

  return (
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
                  disabled={form.formState.isSubmitting}
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
                  disabled={form.formState.isSubmitting}
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
                <Input
                  placeholder="Imię"
                  disabled={form.formState.isSubmitting}
                  {...field}
                />
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
                <Input
                  placeholder="Nazwisko"
                  disabled={form.formState.isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-sm text-red-500">
                {form.formState.errors.lastName?.message}
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
  );
}

export default function RegisterPage() {
  return (
    <>
      <div className="space-y-2 text-center">
        <p className="text-3xl font-black">Rejestracja organizatora</p>
        <p>Podaj swój email by się zarejestrować.</p>
      </div>
      <Suspense>
        <RegisterForm />
      </Suspense>
      <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 pb-4 text-center text-sm sm:pb-0">
        <Info className="size-6" />
        <p>
          Rejestrując konto, zgadzasz się na warunki zawarte w <br />
          <Link
            href="https://drive.google.com/file/d/1h4f-koiR-Ab2JPrOe7p5JXjohi83mrvB/view"
            className="text-primary/90"
            target="_blank"
          >
            regulaminie platformy
          </Link>
        </p>
      </div>
    </>
  );
}
