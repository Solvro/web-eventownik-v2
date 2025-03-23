"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import {
  ArrowLeft,
  ArrowRight,
  EllipsisVertical,
  Loader2,
  PlusIcon,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { FormContainer } from "../form-container";
import { eventAtom } from "../state";

const EventCoorganizersFormSchema = z.object({
  coorganizer: z.string().email("Podaj poprawny adres email"),
});

export function CoorganizersForm({
  goToPreviousStep,
  goToNextStep,
}: {
  goToPreviousStep: () => void;
  goToNextStep: () => void;
}) {
  const [event, setEvent] = useAtom(eventAtom);
  const [coorganizers, setCoorganizers] = useState(event.coorganizers);
  const form = useForm<z.infer<typeof EventCoorganizersFormSchema>>({
    resolver: zodResolver(EventCoorganizersFormSchema),
    defaultValues: {
      coorganizer: "",
    },
  });

  function onSubmit(data: z.infer<typeof EventCoorganizersFormSchema>) {
    setCoorganizers((_coorganizers) => [..._coorganizers, data.coorganizer]);
    form.reset();
  }

  function saveCoorganizers() {
    setEvent((_event) => ({ ..._event, coorganizers }));
    goToNextStep();
  }

  return (
    <FormContainer
      step="3/4"
      title="Krok 3"
      description="Dodaj współorganizatorów"
      icon={<Users />}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p>Współorganizatorzy</p>
          {coorganizers.map((coorganizer) => (
            <div
              key={coorganizer}
              className="flex w-full flex-row items-center justify-between gap-2"
            >
              <p className="border-input file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex h-12 w-full rounded-xl border bg-transparent px-4 py-3 text-lg shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-hidden md:text-sm">
                {coorganizer}
              </p>
              <Button variant="outline">
                <EllipsisVertical />
              </Button>
            </div>
          ))}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-row gap-2"
            >
              <FormField
                name="coorganizer"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        disabled={form.formState.isSubmitting}
                        type="email"
                        placeholder="Podaj adres email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.coorganizer?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <Button type="submit" variant="outline">
                <PlusIcon />
              </Button>
            </form>
          </Form>
        </div>
        <div className="flex flex-row items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={goToPreviousStep}
            disabled={form.formState.isSubmitting}
          >
            <ArrowLeft /> Wróć
          </Button>
          <Button
            className="w-min"
            variant="ghost"
            disabled={form.formState.isSubmitting}
            onClick={saveCoorganizers}
          >
            {form.formState.isSubmitting ? (
              <>
                Zapisywanie danych... <Loader2 className="animate-spin" />
              </>
            ) : (
              <>
                Dalej <ArrowRight />
              </>
            )}
          </Button>
        </div>
      </div>
    </FormContainer>
  );
}
