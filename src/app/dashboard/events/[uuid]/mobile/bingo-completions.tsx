"use client";

import { Loader, RefreshCw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  MobileBingoCompletionAdmin,
  MobileBingoTaskAdmin,
} from "@/types/mobile";

import { deleteBingoCompletion, getBingoCompletions } from "./actions";
import {
  DeleteButton,
  EmptyState,
  LoadError,
  SectionHeader,
  useMobileAction,
} from "./shared";

/** Select value for "no task filter" (Radix Select does not allow "") */
const ALL_TASKS = "all";
/** The server returns at most this many, newest first */
const SERVER_LIMIT = 1000;

/**
 * Organizer view of bingo completions: who ticked which task, when, and the
 * proof photo and note they added, with deletion for moderation.
 */
export function BingoCompletions({
  eventUuid,
  tasks,
  taskFilter,
  onTaskFilterChange,
}: {
  eventUuid: string;
  tasks: MobileBingoTaskAdmin[];
  /** Selected task uuid, or null for all tasks */
  taskFilter: string | null;
  onTaskFilterChange: (taskUuid: string | null) => void;
}) {
  const t = useTranslations("MobileAdmin");
  const locale = useLocale();
  const run = useMobileAction();
  const [completions, setCompletions] = useState<
    MobileBingoCompletionAdmin[] | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    const result = await getBingoCompletions(eventUuid, taskFilter);
    setIsLoading(false);
    if (result.success) {
      setCompletions(result.data);
      setError(null);
    } else {
      setError(result.error);
    }
  }, [eventUuid, taskFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (completions === null || query === "") {
      return completions;
    }
    return completions.filter(
      (completion) =>
        completion.participant.displayName.toLowerCase().includes(query) ||
        completion.participant.email.toLowerCase().includes(query),
    );
  }, [completions, search]);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString(locale, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  return (
    <section id="bingo-completions" className="flex scroll-mt-6 flex-col gap-4">
      <SectionHeader
        title={t("bingo.completionsTitle")}
        description={t("bingo.completionsDescription")}
        action={
          <Button
            variant="outline"
            onClick={() => {
              void load();
            }}
            disabled={isLoading}
          >
            {isLoading ? <Loader className="animate-spin" /> : <RefreshCw />}
            {t("bingo.refresh")}
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Select
          value={taskFilter ?? ALL_TASKS}
          onValueChange={(value) => {
            onTaskFilterChange(value === ALL_TASKS ? null : value);
          }}
        >
          <SelectTrigger
            className="w-full sm:w-72"
            aria-label={t("bingo.filterTask")}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_TASKS}>{t("bingo.allTasks")}</SelectItem>
            {tasks.map((task) => (
              <SelectItem key={task.uuid} value={task.uuid}>
                {task.text}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
          }}
          placeholder={t("bingo.searchPerson")}
          aria-label={t("bingo.searchPerson")}
          className="sm:max-w-xs"
        />
      </div>

      {error === null ? null : (
        <LoadError message={t("loadFailed", { error })} />
      )}

      {visible === null ? (
        error === null ? (
          <Loader className="animate-spin" aria-label={t("loading")} />
        ) : null
      ) : visible.length === 0 ? (
        <EmptyState>
          {search.trim() === ""
            ? t("bingo.noCompletions")
            : t("bingo.noMatches")}
        </EmptyState>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((completion) => (
            <li
              key={completion.uuid}
              className="flex items-start gap-3 rounded-xl border p-3"
            >
              {completion.photoUrl === null ? null : (
                <a
                  href={completion.photoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={completion.photoUrl}
                    alt={t("bingo.proofPhotoBy", {
                      name: completion.participant.displayName,
                    })}
                    className="size-20 rounded-md object-cover"
                    loading="lazy"
                  />
                </a>
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
                <p className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-semibold">
                    {completion.participant.displayName}
                  </span>
                  <span className="text-muted-foreground break-all">
                    {completion.participant.email}
                  </span>
                </p>
                <p>{completion.taskText}</p>
                {completion.note === null ? null : (
                  <p className="text-muted-foreground break-words whitespace-pre-line italic">
                    „{completion.note}”
                  </p>
                )}
                <time
                  dateTime={completion.completedAt}
                  className="text-muted-foreground text-xs tabular-nums"
                >
                  {formatTime(completion.completedAt)}
                </time>
              </div>
              <DeleteButton
                label={t("bingo.deleteCompletion", {
                  name: completion.participant.displayName,
                  task: completion.taskText,
                })}
                description={t("bingo.deleteCompletionDescription")}
                onConfirm={async () => {
                  await run(
                    deleteBingoCompletion(eventUuid, completion.uuid),
                    t("deleted"),
                  );
                  await load();
                }}
              />
            </li>
          ))}
        </ul>
      )}

      {completions !== null && completions.length >= SERVER_LIMIT ? (
        <p className="text-muted-foreground text-sm">
          {t("bingo.shownLimit", { count: SERVER_LIMIT })}
        </p>
      ) : null}
    </section>
  );
}
