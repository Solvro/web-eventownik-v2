"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAtomValue } from "jotai";
import { ArrowLeft, Loader2, PlusIcon, TextIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

import { saveEvent } from "../actions";
import { FormContainer } from "../form-container";
import { AttributeTypes, eventAtom } from "../state";

const EventAttributesFormSchema = z.object({
  name: z.string().nonempty("Nazwa nie może być pusta"),
  type: z.enum(AttributeTypes),
});

async function getBase64FromUrl(url: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      // eslint-disable-next-line unicorn/prefer-add-event-listener
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    return base64;
  } catch (error) {
    console.error(
      `[getBase64FromUrl] Failed to get base64 from url ${url}:`,
      error,
    );
    throw new Error(`Failed to get base64 from url ${url}`);
  }
}

export function AttributesForm({
  goToPreviousStep,
}: {
  goToPreviousStep: () => void;
}) {
  const event = useAtomValue(eventAtom);
  const [loading, setLoading] = useState(false);
  const [attributes, setAttributes] = useState<
    z.infer<typeof EventAttributesFormSchema>[]
  >(event.attributes);
  const form = useForm<z.infer<typeof EventAttributesFormSchema>>({
    resolver: zodResolver(EventAttributesFormSchema),
    defaultValues: {
      name: "",
      type: "text",
    },
  });

  const router = useRouter();

  function onSubmit(data: z.infer<typeof EventAttributesFormSchema>) {
    setAttributes([...attributes, data]);
    form.reset();
  }

  async function createEvent() {
    setLoading(true);
    const base64Image = await getBase64FromUrl(event.image);
    const newEventObject = { ...event, attributes, image: base64Image };
    try {
      const result = await saveEvent(newEventObject);
      if ("errors" in result) {
        toast({
          variant: "destructive",
          title: "O nie! Coś poszło nie tak.",
          description: "Spróbuj utworzyć wydarzenie ponownie.",
        });
      } else {
        URL.revokeObjectURL(event.image);
        toast({
          title: "Pomyślnie utworzono nowe wydarzenie",
        });
        setTimeout(() => {
          router.push(`/dashboard/events/${result.id}`);
        }, 200);
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Brak połączenia z serwerem.",
        description: "Sprawdź swoje połączenie z internetem.",
      });
    }
    setLoading(false);
  }
  return (
    <FormContainer
      step="4/4"
      title="Krok 4"
      description="Dodaj atrybuty"
      icon={<TextIcon />}
    >
      <div className="flex w-full flex-col items-center">
        <div className="w-full space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              {attributes.length > 0 && (
                <p className="text-sm font-medium">Atrybuty</p>
              )}
              {attributes.map((attribute) => (
                <div
                  key={attribute.name}
                  className="flex flex-row items-center gap-2"
                >
                  <p className="flex h-12 w-full rounded-xl border border-input bg-transparent px-4 py-3 text-lg shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm">
                    {attribute.name}
                  </p>
                  <p className="flex h-12 w-full rounded-xl border border-input bg-transparent px-4 py-3 text-lg shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm">
                    {attribute.type}
                  </p>
                </div>
              ))}
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-2"
              >
                <FormLabel>Dodaj atrybut</FormLabel>
                <div className="flex flex-row items-center gap-2">
                  <FormField
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Nazwa"
                        disabled={form.formState.isSubmitting}
                      />
                    )}
                  />
                  <FormField
                    name="type"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger
                              disabled={form.formState.isSubmitting}
                              className="h-full capitalize"
                            >
                              <SelectValue placeholder="Wybierz typ atrybutu" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {AttributeTypes.map((value) => (
                              <SelectItem
                                className="capitalize"
                                key={value}
                                value={value}
                              >
                                {value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <Button
                    disabled={form.formState.isSubmitting}
                    type="submit"
                    variant="outline"
                  >
                    <PlusIcon />
                  </Button>
                </div>
              </form>
            </Form>
          </div>
          <div className="flex w-full flex-row justify-between gap-4">
            <Button
              variant="ghost"
              onClick={goToPreviousStep}
              disabled={loading}
            >
              <ArrowLeft /> Wróć
            </Button>
            <Button className="w-min" onClick={createEvent} disabled={loading}>
              {loading ? (
                <>
                  Zapisywanie danych... <Loader2 className="animate-spin" />
                </>
              ) : (
                <>Utwórz wydarzenie</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </FormContainer>
  );
}
