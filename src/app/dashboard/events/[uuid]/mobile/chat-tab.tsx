"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader, RefreshCw, Reply, Send, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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

const MessageSchema = z.object({ body: z.string().trim().min(1).max(1000) });
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
  const [replyTo, setReplyTo] = useState<{
    uuid: string;
    author: string;
    body: string;
  } | null>(null);
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
              sendChatMessage(
                eventUuid,
                values.body.trim(),
                replyTo?.uuid ?? null,
              ),
              t("chat.sent"),
            );
            if (created !== null) {
              form.reset();
              setReplyTo(null);
            }
          })}
        >
          {replyTo === null ? null : (
            <div className="bg-muted flex items-start gap-3 rounded-lg px-3 py-2 text-sm">
              <span
                aria-hidden
                className="w-1 shrink-0 self-stretch rounded-full bg-[var(--event-primary-color)]"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {t("chat.replyingTo", { name: replyTo.author })}
                </p>
                <p className="text-muted-foreground truncate">{replyTo.body}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 shrink-0"
                aria-label={t("chat.cancelReply")}
                onClick={() => {
                  setReplyTo(null);
                }}
              >
                <X />
              </Button>
            </div>
          )}
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
                  {message.replyTo === null ? null : (
                    <p className="text-muted-foreground mt-1 line-clamp-2 border-l-2 pl-2 text-xs">
                      <span className="font-semibold">
                        {t("chat.inReplyTo", {
                          name: message.replyTo.senderName,
                        })}
                      </span>{" "}
                      {message.replyTo.body ?? t("chat.deletedMessage")}
                    </p>
                  )}
                  <p className="text-sm break-words whitespace-pre-line">
                    {message.body}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  aria-label={t("chat.reply", { name: author })}
                  title={t("chat.reply", { name: author })}
                  onClick={() => {
                    setReplyTo({
                      uuid: message.uuid,
                      author,
                      body: message.body,
                    });
                    form.setFocus("body");
                  }}
                >
                  <Reply />
                </Button>
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
