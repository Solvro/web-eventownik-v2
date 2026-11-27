"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Camera, ChevronDown, ChevronUp, Loader } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { getDateLocale } from "@/i18n/utils";
import type { MobileBerealPost, MobileBerealRoundAdmin } from "@/types/mobile";

import {
  deleteBerealPost,
  deleteBerealRound,
  getBerealRoundPosts,
  startBerealRound,
} from "./actions";
import {
  DeleteButton,
  EmptyState,
  LoadError,
  SectionHeader,
  SubmitButton,
  useMobileAction,
} from "./shared";

const RoundSchema = z.object({
  prompt: z.string().max(200),
  durationMinutes: z
    .string()
    .regex(/^\d+$/)
    .refine((value) => Number(value) >= 1 && Number(value) <= 120),
});
type RoundValues = z.infer<typeof RoundSchema>;

function RoundPosts({
  eventUuid,
  roundUuid,
}: {
  eventUuid: string;
  roundUuid: string;
}) {
  const t = useTranslations("MobileAdmin");
  const run = useMobileAction();
  const [posts, setPosts] = useState<MobileBerealPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getBerealRoundPosts(eventUuid, roundUuid).then((result) => {
      if (cancelled) {
        return;
      }
      if (result.success) {
        setPosts(result.data);
      } else {
        setError(result.error);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [eventUuid, roundUuid]);

  if (error !== null) {
    return <LoadError message={t("loadFailed", { error })} />;
  }
  if (posts === null) {
    return <Loader className="animate-spin" aria-label={t("loading")} />;
  }
  if (posts.length === 0) {
    return <EmptyState>{t("bereal.noPosts")}</EmptyState>;
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {posts.map((post) => (
        <li
          key={post.uuid}
          className="flex flex-col gap-1 rounded-lg border p-2"
        >
          <div className="relative">
            <a href={post.photoUrl} target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.photoUrl}
                alt={t("bereal.photoBy", { name: post.author.displayName })}
                className="aspect-[3/4] w-full rounded-md object-cover"
                loading="lazy"
              />
            </a>
            {post.selfieUrl === null ? null : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.selfieUrl}
                alt={t("bereal.selfieBy", { name: post.author.displayName })}
                className="absolute top-2 left-2 w-1/3 rounded-md border-2 border-white object-cover"
                loading="lazy"
              />
            )}
          </div>
          <div className="flex items-start gap-1">
            <div className="min-w-0 flex-1 text-sm">
              <p className="truncate font-medium">
                {post.author.displayName}
                {post.isLate ? (
                  <Badge variant="outline" className="ml-1">
                    {t("bereal.late")}
                  </Badge>
                ) : null}
              </p>
              {post.caption === null ? null : (
                <p className="text-muted-foreground break-words">
                  {post.caption}
                </p>
              )}
            </div>
            <DeleteButton
              label={t("bereal.deletePost", { name: post.author.displayName })}
              onConfirm={async () => {
                const result = await run(
                  deleteBerealPost(eventUuid, post.uuid),
                  t("deleted"),
                );
                if (result !== null) {
                  setPosts((current) =>
                    (current ?? []).filter((item) => item.uuid !== post.uuid),
                  );
                }
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function BerealTab({
  eventUuid,
  rounds,
}: {
  eventUuid: string;
  rounds: MobileBerealRoundAdmin[];
}) {
  const t = useTranslations("MobileAdmin");
  const locale = useLocale();
  const run = useMobileAction();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const form = useForm<RoundValues>({
    resolver: zodResolver(RoundSchema),
    defaultValues: { prompt: "", durationMinutes: "5" },
  });

  const sorted = rounds.toSorted(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );
  const formatDate = (iso: string) =>
    format(new Date(iso), "d MMM, HH:mm", { locale: getDateLocale(locale) });

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title={t("bereal.title")}
        description={t("bereal.description")}
      />
      <Form {...form}>
        <form
          className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-end"
          onSubmit={form.handleSubmit(async (values) => {
            const prompt = values.prompt.trim();
            const created = await run(
              startBerealRound(eventUuid, {
                prompt: prompt === "" ? undefined : prompt,
                durationMinutes: Number(values.durationMinutes),
              }),
              t("bereal.started"),
            );
            if (created !== null) {
              form.reset();
              setNow(Date.now());
            }
          })}
        >
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>{t("bereal.prompt")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("bereal.promptPlaceholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="durationMinutes"
            render={({ field }) => (
              <FormItem className="sm:w-40">
                <FormLabel>{t("bereal.duration")}</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min={1} max={120} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <SubmitButton
            isSubmitting={form.formState.isSubmitting}
            icon={<Camera />}
          >
            {t("bereal.start")}
          </SubmitButton>
        </form>
      </Form>
      <h3 className="font-semibold">{t("bereal.history")}</h3>
      {sorted.length === 0 ? (
        <EmptyState>{t("bereal.empty")}</EmptyState>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((round) => {
            const isOpen = expanded === round.uuid;
            const isActive = new Date(round.endsAt).getTime() > now;
            return (
              <li
                key={round.uuid}
                className="flex flex-col gap-3 rounded-xl border p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {round.prompt ?? t("bereal.noPrompt")}
                      {isActive ? (
                        <Badge className="ml-2">{t("bereal.active")}</Badge>
                      ) : null}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {formatDate(round.startedAt)} – {formatDate(round.endsAt)}{" "}
                      · {t("bereal.postsCount", { count: round.postsCount })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-expanded={isOpen}
                    aria-label={
                      isOpen ? t("bereal.hidePosts") : t("bereal.showPosts")
                    }
                    title={
                      isOpen ? t("bereal.hidePosts") : t("bereal.showPosts")
                    }
                    onClick={() => {
                      setExpanded(isOpen ? null : round.uuid);
                    }}
                  >
                    {isOpen ? <ChevronUp /> : <ChevronDown />}
                  </Button>
                  <DeleteButton
                    label={t("bereal.deleteRound")}
                    description={t("bereal.deleteRoundDescription")}
                    onConfirm={async () =>
                      run(
                        deleteBerealRound(eventUuid, round.uuid),
                        t("deleted"),
                      )
                    }
                  />
                </div>
                {isOpen ? (
                  <RoundPosts eventUuid={eventUuid} roundUuid={round.uuid} />
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
