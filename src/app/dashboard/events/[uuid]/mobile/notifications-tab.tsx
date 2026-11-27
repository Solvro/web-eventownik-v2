"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Send } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getDateLocale } from "@/i18n/utils";
import type { MobileNotification } from "@/types/mobile";

import { deleteMobileNotification, sendMobileNotification } from "./actions";
import {
  DeleteButton,
  EmptyState,
  SectionHeader,
  SubmitButton,
  useMobileAction,
} from "./shared";

const NotificationSchema = z.object({
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(2000),
});
type NotificationValues = z.infer<typeof NotificationSchema>;

export function NotificationsTab({
  eventUuid,
  items,
}: {
  eventUuid: string;
  items: MobileNotification[];
}) {
  const t = useTranslations("MobileAdmin");
  const locale = useLocale();
  const run = useMobileAction();
  const form = useForm<NotificationValues>({
    resolver: zodResolver(NotificationSchema),
    defaultValues: { title: "", body: "" },
  });

  const sorted = items.toSorted((a, b) => b.seq - a.seq);

  const onSubmit = async (values: NotificationValues) => {
    const created = await run(
      sendMobileNotification(eventUuid, {
        title: values.title.trim(),
        body: values.body.trim(),
      }),
      t("notifications.sent"),
    );
    if (created !== null) {
      form.reset();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title={t("notifications.title")}
        description={t("notifications.description")}
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 rounded-xl border p-4"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("notifications.titleField")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("notifications.body")}</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <SubmitButton
              isSubmitting={form.formState.isSubmitting}
              icon={<Send />}
            >
              {t("notifications.send")}
            </SubmitButton>
          </div>
        </form>
      </Form>
      <h3 className="font-semibold">{t("notifications.history")}</h3>
      {sorted.length === 0 ? (
        <EmptyState>{t("notifications.empty")}</EmptyState>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((item) => (
            <li
              key={item.uuid}
              className="flex items-start gap-3 rounded-xl border p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm whitespace-pre-line">{item.body}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {format(new Date(item.createdAt), "d MMM, HH:mm", {
                    locale: getDateLocale(locale),
                  })}
                </p>
              </div>
              <DeleteButton
                label={t("deleteItem", { name: item.title })}
                onConfirm={async () =>
                  run(
                    deleteMobileNotification(eventUuid, item.uuid),
                    t("deleted"),
                  )
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
