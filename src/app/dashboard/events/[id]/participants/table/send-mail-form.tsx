"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Mail, RefreshCcw, TextIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormContainer } from "@/components/forms/form-container";
import { Button } from "@/components/ui/button";
import {
  Credenza,
  CredenzaClose,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@/components/ui/credenza";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import type { EventEmail } from "@/types/emails";
import type { FlattenedParticipant } from "@/types/participant";

import { sendMail } from "../actions";

const SendMailFormSchema = z.object({
  template: z.string().nonempty({ message: "Wybierz szablon" }),
});

function SendMailForm({
  eventId,
  emails,
  targetParticipants,
}: {
  eventId: string;
  emails: EventEmail[] | null;
  targetParticipants: FlattenedParticipant[];
}) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof SendMailFormSchema>>({
    resolver: zodResolver(SendMailFormSchema),
    defaultValues: {
      template: "",
    },
  });

  async function onSubmit(values: z.infer<typeof SendMailFormSchema>) {
    const result = await sendMail(
      eventId,
      values.template,
      targetParticipants.map((participant) => participant.id),
    );

    if (result.success) {
      toast({
        title: "Wysłano wiadomości",
      });

      // 'router.refresh()' doesn't work here for some reason - using native method instead
      location.reload();
    } else {
      toast({
        title: "Nie udało się wysłać wiadomości!",
        description: result.error,
        variant: "destructive",
      });
    }
  }

  return (
    <Credenza>
      <Tooltip>
        <TooltipTrigger asChild>
          <CredenzaTrigger asChild>
            <Button size="icon" variant="outline" aria-label="Wyślij maila">
              <Mail />
            </Button>
          </CredenzaTrigger>
        </TooltipTrigger>
        <TooltipContent>Wyślij maila</TooltipContent>
      </Tooltip>
      <CredenzaContent aria-describedby={undefined}>
        <CredenzaHeader className="sr-only">
          <CredenzaTitle>Wyślij maila</CredenzaTitle>
        </CredenzaHeader>
        <FormContainer
          description="Wybierz szablon maila"
          icon={<TextIcon />}
          step=""
          title=""
        >
          {emails === null ? (
            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-red-600">Nie udało się pobrać szablonów</p>
              <Button
                variant="outline"
                onClick={() => {
                  location.reload();
                }}
              >
                <RefreshCcw /> Odśwież
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="template"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wybierz szablon z listy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {emails.map((email) => (
                            <SelectItem
                              key={email.id}
                              value={email.id.toString()}
                            >
                              {email.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <h2>
                  Zamierzasz wysłać tą wiadomość do {targetParticipants.length}{" "}
                  uczestników z następującymi adresami:
                </h2>
                <ScrollArea className="h-32">
                  <pre className="bg-muted/70 rounded-md p-4 whitespace-pre-wrap">
                    {targetParticipants
                      .map((participant) => participant.email)
                      .join("\n")}
                  </pre>
                </ScrollArea>

                <div className="flex w-full flex-col justify-end gap-2 md:flex-row">
                  <Button
                    type="submit"
                    variant="eventDefault"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <Loader className="animate-spin" />
                    ) : (
                      <Mail />
                    )}{" "}
                    Wyślij
                  </Button>
                  <CredenzaClose asChild>
                    <Button
                      variant="outline"
                      className="block md:hidden"
                      disabled={form.formState.isSubmitting}
                    >
                      Anuluj
                    </Button>
                  </CredenzaClose>
                </div>
              </form>
            </Form>
          )}
        </FormContainer>
      </CredenzaContent>
    </Credenza>
  );
}

export { SendMailForm };
