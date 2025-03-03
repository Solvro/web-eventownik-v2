"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { Loader2, PlusIcon, TextIcon } from "lucide-react";
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

export default function AttributesForm() {
  const router = useRouter();
  const [event, setEvent] = useAtom(eventAtom);
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
  function onSubmit(data: z.infer<typeof EventAttributesFormSchema>) {
    setAttributes([...attributes, data]);
    form.reset();
  }
  async function createEvent() {
    try {
      const result = await saveEvent({ ...event, attributes });
      if ("errors" in result) {
        toast({
          variant: "destructive",
          title: "O nie! Coś poszło nie tak.",
          description: "Spróbuj utworzyć wydarzenie ponownie.",
        });
      } else {
        router.push(`/dashboard/event/share/${result.id}`);
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
    <FormContainer
      step="4/4"
      title="Krok 4"
      description="Dodaj atrybuty"
      icon={<TextIcon />}
    >
      <div className="flex w-full flex-col items-center">
        <div className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              {attributes.length > 0 && (
                <p className="text-sm font-medium">Atrybuty</p>
              )}
              {attributes.map((attribute, key) => (
                <div key={key} className="flex flex-row items-center gap-2">
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
          <div className="flex w-full flex-row justify-end">
            <Button
              className="w-min"
              onClick={createEvent}
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
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
