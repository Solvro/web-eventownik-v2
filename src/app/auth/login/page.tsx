"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  async function onSubmit(values: z.infer<typeof loginFormSchema>) {
    try {
      const result = await login(values);
      if (result.success) {
        toast({
          title: "Logowanie zakończone sukcesem!",
          duration: 2000,
        });
        //redirect jest zjebany w authjs v5 dlatego ręcznie to robie na kliencie
        router.replace("/dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "O nie! Coś poszło nie tak.",
          description: result.error,
        });
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
