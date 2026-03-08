"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Mail, RefreshCcw, TextIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormContainer } from "@/components/forms/form-container";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

function SendMailForm({
  eventId,
  emails,
  targetParticipants,
}: {
  eventId: string;
  emails: EventEmail[] | null;
  targetParticipants: FlattenedParticipant[];
}) {
  const t = useTranslations("SendMail");
  const { toast } = useToast();

  const SendMailFormSchema = z.object({
    template: z.string().nonempty({ message: t("selectTemplate") }),
  });

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
        title: t("successTitle"),
      });

      // 'router.refresh()' doesn't work here for some reason - using native method instead
      location.reload();
    } else {
      toast({
        title: t("errorTitle"),
        description: result.error,
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button size="icon" variant="outline" aria-label={t("sendMail")}>
              <Mail />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>{t("sendMail")}</TooltipContent>
      </Tooltip>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader className="sr-only">
          <DialogTitle>{t("sendMail")}</DialogTitle>
        </DialogHeader>
        <FormContainer
          description={t("selectTemplateDescription")}
          icon={<TextIcon />}
          step="1/1"
          title={t("step1")}
        >
          {emails === null ? (
            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-red-600">{t("fetchError")}</p>
              <Button
                variant="outline"
                onClick={() => {
                  location.reload();
                }}
              >
                <RefreshCcw /> {t("refresh")}
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
                            <SelectValue placeholder={t("selectPlaceholder")} />
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
                  {t("confirmRecipients", {
                    count: targetParticipants.length,
                  })}
                </h2>
                <ScrollArea className="h-32">
                  <pre className="bg-muted/70 rounded-md p-4 whitespace-pre-wrap">
                    {targetParticipants
                      .map((participant) => participant.email)
                      .join("\n")}
                  </pre>
                </ScrollArea>

                <div className="flex justify-end">
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
                    {t("send")}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </FormContainer>
      </DialogContent>
    </Dialog>
  );
}

export { SendMailForm };
