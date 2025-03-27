"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AttributeInput } from "@/components/attribute-input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { getSchemaObjectForAttributes } from "@/lib/utils";
import type { FormAttribute } from "@/types/attributes";

import { submitForm } from "./actions";

export function FormGenerator({
  attributes,
  formId,
  eventSlug,
  userId,
}: {
  attributes: FormAttribute[];
  formId: string;
  eventSlug: string;
  userId: string;
}) {
  // generate schema for form based on attributes
  const FormSchema = z.object({
    ...getSchemaObjectForAttributes(attributes.sort((a, b) => a.id - b.id)), // TODO: change to order after backend changes
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
    },
  });

  const { toast } = useToast();

  async function onSubmit(values: z.infer<typeof FormSchema>) {
    try {
      const result = await submitForm(values, formId, eventSlug, userId);
      if (!result.success) {
        form.setError("root", {
          type: "manual",
          message:
            "Zapisanie danych formularza nie powiodło się.\nSpróbuj ponownie później",
        });
        toast({
          variant: "destructive",
          title: "Zapisanie danych formularza nie powiodło się",
          description: "Spróbuj ponownie później",
        });
      }
    } catch (error) {
      console.error("Form submission failed", error);
      toast({
        variant: "destructive",
        title: "Zapisanie danych formularza nie powiodło się",
        description: "Błąd serwera",
      });
    }
  }

  if (form.formState.isSubmitSuccessful) {
    return (
      <div>
        <h2 className="text-center text-xl font-bold text-green-500 md:text-2xl">
          Twoja odpowiedź została zapisana!
        </h2>
        <br />
        <div className="text-center">
          <Button
            onClick={() => {
              form.reset();
            }}
          >
            Uzupełnij kolejny formularz
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-sm space-y-4"
      >
        {attributes
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((attribute) => (
            <FormField
              key={attribute.id}
              control={form.control}
              name={attribute.id.toString()}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{attribute.name}</FormLabel>
                  <FormControl>
                    <AttributeInput attribute={attribute} field={field} />
                  </FormControl>
                  <FormMessage className="text-sm text-red-500">
                    {/* @ts-expect-error zod schema object are dynamic */}
                    {form.formState.errors[attribute.id.toString()]?.message}
                  </FormMessage>
                </FormItem>
              )}
            />
          ))}
        {form.formState.errors.root?.message != null && (
          <FormMessage className="text-center text-sm whitespace-break-spaces text-red-500">
            {form.formState.errors.root.message}
          </FormMessage>
        )}
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="animate-spin" /> Zapisywanie...
            </>
          ) : (
            "Zapisz"
          )}
        </Button>
      </form>
    </Form>
  );
}
