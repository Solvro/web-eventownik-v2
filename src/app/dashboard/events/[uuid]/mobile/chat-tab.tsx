"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader, RefreshCw, Send } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { getDateLocale } from "@/i18n/utils";
import type { MobileChatMessage } from "@/types/mobile";

import { deleteChatMessage, sendChatMessage } from "./actions";
import {
  DeleteButton,
  EmptyState,
  SectionHeader,
  SubmitButton,
  useMobileAction,
} from "./shared";

const MessageSchema = z.object({ body: z.string().trim().min(1).max(2000) });
type MessageValues = z.infer<typeof MessageSchema>;

export function ChatTab({
  eventUuid,
  messages,
}: {
  eventUuid: string;
  messages: MobileChatMessage[];
}) {
  const t = useTranslations("MobileAdmin");
  const locale = useLocale();
  const router = useRouter();
  const run = useMobileAction();
  const [isRefreshing, startRefresh] = useTransition();
  const form = useForm<MessageValues>({
    resolver: zodResolver(MessageSchema),
    defaultValues: { body: "" },
  });

  // Newest first so the latest activity is visible without scrolling
  const sorted = messages.toSorted((a, b) => b.seq - a.seq);

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title={t("chat.title")}
        description={t("chat.description")}
        action={
          <Button
            variant="outline"
            disabled={isRefreshing}
            onClick={() => {
              startRefresh(() => {
                router.refresh();
              });
            }}
          >
            {isRefreshing ? <Loader className="animate-spin" /> : <RefreshCw />}
            {t("chat.refresh")}
          </Button>
        }
      />
      <Form {...form}>
        <form
          className="flex flex-col gap-3 rounded-xl border p-4"
          onSubmit={form.handleSubmit(async (values) => {
            const created = await run(
              sendChatMessage(eventUuid, values.body.trim()),
              t("chat.sent"),
            );
            if (created !== null) {
              form.reset();
            }
          })}
        >
          <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("chat.messageAsOrganizer")}</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={2} />
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
              {t("chat.send")}
            </SubmitButton>
          </div>
        </form>
      </Form>
      {sorted.length === 0 ? (
        <EmptyState>{t("chat.empty")}</EmptyState>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((message) => {
            const author = message.isOrganizer
              ? t("chat.organizer")
              : (message.sender?.displayName ?? t("chat.unknown"));
            return (
              <li
                key={message.uuid}
                className="flex items-start gap-3 rounded-xl border px-4 py-3"
              >
                {message.sender?.photoUrl == null ? null : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={message.sender.photoUrl}
                    alt=""
                    className="size-8 shrink-0 rounded-full object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">{author}</span>
                    {message.isOrganizer ? (
                      <Badge variant="outline" className="ml-2">
                        {t("chat.organizerBadge")}
                      </Badge>
                    ) : null}
                    <span className="text-muted-foreground ml-2 text-xs">
                      {format(new Date(message.createdAt), "d MMM, HH:mm", {
                        locale: getDateLocale(locale),
                      })}
                    </span>
                  </p>
                  <p className="text-sm break-words whitespace-pre-line">
                    {message.body}
                  </p>
                </div>
                <DeleteButton
                  label={t("chat.deleteMessage", { name: author })}
                  onConfirm={async () =>
                    run(
                      deleteChatMessage(eventUuid, message.uuid),
                      t("deleted"),
                    )
                  }
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
