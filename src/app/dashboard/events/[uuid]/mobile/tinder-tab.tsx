"use client";

import { Heart, Loader, RefreshCw, User, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type {
  MobilePerson,
  MobileTinderOverview,
  MobileTinderParticipantSwipes,
  MobileTinderSwipeAdmin,
} from "@/types/mobile";

import { getTinderOverview, getTinderParticipantSwipes } from "./actions";
import { EmptyState, LoadError, SectionHeader } from "./shared";

function Avatar({
  person,
  size = 40,
}: {
  person: MobilePerson;
  size?: number;
}) {
  return person.photoUrl === null ? (
    <span
      className="bg-muted text-muted-foreground flex shrink-0 items-center justify-center rounded-full"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <User className="size-1/2" />
    </span>
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={person.photoUrl}
      alt=""
      className="shrink-0 rounded-full object-cover"
      style={{ width: size, height: size }}
      loading="lazy"
    />
  );
}

function useFormatTime() {
  const locale = useLocale();
  return (iso: string) =>
    new Date(iso).toLocaleString(locale, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
}

function SwipeBadge({ liked }: { liked: boolean }) {
  const t = useTranslations("MobileAdmin.tinder");
  return liked ? (
    <Badge className="border-transparent bg-emerald-600 text-white">
      <Heart aria-hidden />
      {t("liked")}
    </Badge>
  ) : (
    <Badge variant="secondary">
      <X aria-hidden />
      {t("passed")}
    </Badge>
  );
}

/** How the other side answered: a match, a pass, or nothing yet */
function AnswerBadge({
  liked,
  reciprocal,
}: {
  liked: boolean;
  reciprocal: boolean | null;
}) {
  const t = useTranslations("MobileAdmin.tinder");
  if (reciprocal === null) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        {t("notAnswered")}
      </Badge>
    );
  }
  if (liked && reciprocal) {
    return (
      <Badge className="border-transparent bg-pink-600 text-white">
        {t("match")} 🎉
      </Badge>
    );
  }
  return (
    <Badge variant="outline">
      {t("theirAnswer", {
        answer: reciprocal ? t("liked") : t("passed"),
      })}
    </Badge>
  );
}

function SwipeList({
  title,
  empty,
  swipes,
  onSelect,
}: {
  title: string;
  empty: string;
  swipes: MobileTinderSwipeAdmin[];
  onSelect: (participantUuid: string) => void;
}) {
  const t = useTranslations("MobileAdmin.tinder");
  const formatTime = useFormatTime();
  return (
    <section className="flex min-w-0 flex-1 flex-col gap-2">
      <h3 className="font-semibold">
        {title}{" "}
        <span className="text-muted-foreground font-normal tabular-nums">
          ({swipes.length})
        </span>
      </h3>
      {swipes.length === 0 ? (
        <EmptyState>{empty}</EmptyState>
      ) : (
        <ul className="flex flex-col gap-1">
          {swipes.map((swipe) => (
            <li key={swipe.person.participantUuid}>
              <button
                type="button"
                onClick={() => {
                  onSelect(swipe.person.participantUuid);
                }}
                aria-label={t("showSwipes", {
                  name: swipe.person.displayName,
                })}
                className="hover:bg-muted flex w-full items-center gap-3 rounded-lg p-2 text-left"
              >
                <Avatar person={swipe.person} size={36} />
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate text-sm font-medium">
                    {swipe.person.displayName}
                  </span>
                  <span className="flex flex-wrap items-center gap-1">
                    <SwipeBadge liked={swipe.liked} />
                    <AnswerBadge
                      liked={swipe.liked}
                      reciprocal={swipe.reciprocal}
                    />
                  </span>
                </span>
                <time
                  dateTime={swipe.swipedAt}
                  className="text-muted-foreground shrink-0 text-xs tabular-nums"
                >
                  {formatTime(swipe.swipedAt)}
                </time>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Swipes of one participant; keyed by participant, so state starts fresh */
function ParticipantSwipesBody({
  eventUuid,
  participantUuid,
  onSelect,
}: {
  eventUuid: string;
  participantUuid: string;
  onSelect: (participantUuid: string) => void;
}) {
  const t = useTranslations("MobileAdmin");
  const [data, setData] = useState<MobileTinderParticipantSwipes | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getTinderParticipantSwipes(eventUuid, participantUuid).then(
      (result) => {
        if (cancelled) {
          return;
        }
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error);
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [eventUuid, participantUuid]);

  const person = data?.participant;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          {person === undefined ? (
            t("tinder.title")
          ) : (
            <>
              <Avatar person={person} size={44} />
              <span className="flex min-w-0 flex-col">
                <span className="truncate">{person.displayName}</span>
                <span className="text-muted-foreground truncate text-sm font-normal">
                  {person.email}
                </span>
              </span>
            </>
          )}
        </DialogTitle>
        <DialogDescription>
          {person === undefined
            ? t("loading")
            : [
                t("tinder.likesGiven", { count: person.likesGiven }),
                t("tinder.passesGiven", { count: person.passesGiven }),
                t("tinder.likesReceived", { count: person.likesReceived }),
                t("tinder.matchesCount", { count: person.matchesCount }),
              ].join(" · ")}
        </DialogDescription>
      </DialogHeader>

      {error === null ? null : (
        <LoadError message={t("loadFailed", { error })} />
      )}
      {data === null ? (
        error === null ? (
          <Loader className="animate-spin" aria-label={t("loading")} />
        ) : null
      ) : (
        <div className="flex flex-col gap-6 md:flex-row">
          <SwipeList
            title={t("tinder.givenTitle")}
            empty={t("tinder.noGiven")}
            swipes={data.given}
            onSelect={onSelect}
          />
          <SwipeList
            title={t("tinder.receivedTitle")}
            empty={t("tinder.noReceived")}
            swipes={data.received}
            onSelect={onSelect}
          />
        </div>
      )}
    </>
  );
}

/** Dialog with one participant's swipes, both directions */
function ParticipantSwipes({
  eventUuid,
  participantUuid,
  onSelect,
  onClose,
}: {
  eventUuid: string;
  participantUuid: string | null;
  onSelect: (participantUuid: string) => void;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={participantUuid !== null}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl">
        {participantUuid === null ? null : (
          <ParticipantSwipesBody
            key={participantUuid}
            eventUuid={eventUuid}
            participantUuid={participantUuid}
            onSelect={onSelect}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function PersonButton({
  person,
  onSelect,
}: {
  person: MobilePerson;
  onSelect: (participantUuid: string) => void;
}) {
  const t = useTranslations("MobileAdmin.tinder");
  return (
    <button
      type="button"
      onClick={() => {
        onSelect(person.participantUuid);
      }}
      aria-label={t("showSwipes", { name: person.displayName })}
      className="hover:bg-muted flex min-w-0 items-center gap-2 rounded-lg p-1 pr-2 text-left"
    >
      <Avatar person={person} size={32} />
      <span className="truncate text-sm font-medium">{person.displayName}</span>
    </button>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border p-4">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-2xl font-bold tabular-nums">{value}</span>
    </div>
  );
}

/**
 * Organizer view of Tinderownik: totals, every match, and each participant's
 * activity; picking a person shows how they swiped and how others swiped on them.
 */
export function TinderTab({ eventUuid }: { eventUuid: string }) {
  const t = useTranslations("MobileAdmin");
  const formatTime = useFormatTime();
  const [overview, setOverview] = useState<MobileTinderOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    const result = await getTinderOverview(eventUuid);
    setIsLoading(false);
    if (result.success) {
      setOverview(result.data);
      setError(null);
    } else {
      setError(result.error);
    }
  }, [eventUuid]);

  useEffect(() => {
    void load();
  }, [load]);

  const people = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (overview === null || query === "") {
      return overview?.people ?? null;
    }
    return overview.people.filter(
      (person) =>
        person.displayName.toLowerCase().includes(query) ||
        person.email.toLowerCase().includes(query),
    );
  }, [overview, search]);

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title={t("tinder.title")}
        description={t("tinder.description")}
        action={
          <Button
            variant="outline"
            onClick={() => {
              void load();
            }}
            disabled={isLoading}
          >
            {isLoading ? <Loader className="animate-spin" /> : <RefreshCw />}
            {t("tinder.refresh")}
          </Button>
        }
      />

      {error === null ? null : (
        <LoadError message={t("loadFailed", { error })} />
      )}

      {overview === null ? (
        error === null ? (
          <Loader className="animate-spin" aria-label={t("loading")} />
        ) : null
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat
              label={t("tinder.statOptedIn")}
              value={overview.totals.optedIn}
            />
            <Stat
              label={t("tinder.statSwipes")}
              value={overview.totals.swipes}
            />
            <Stat label={t("tinder.statLikes")} value={overview.totals.likes} />
            <Stat
              label={t("tinder.statMatches")}
              value={overview.totals.matches}
            />
          </div>

          <section className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold">
              {t("tinder.matchesTitle")}
            </h3>
            {overview.matches.length === 0 ? (
              <EmptyState>{t("tinder.noMatches")}</EmptyState>
            ) : (
              <ul className="grid gap-2 lg:grid-cols-2">
                {overview.matches.map((match) => (
                  <li
                    key={`${match.a.participantUuid}:${match.b.participantUuid}`}
                    className="flex items-center gap-2 rounded-xl border p-2"
                  >
                    <PersonButton person={match.a} onSelect={setSelected} />
                    <Heart
                      className="size-4 shrink-0 fill-pink-600 text-pink-600"
                      aria-label={t("tinder.match")}
                    />
                    <PersonButton person={match.b} onSelect={setSelected} />
                    <time
                      dateTime={match.matchedAt}
                      className="text-muted-foreground ml-auto shrink-0 pr-2 text-xs tabular-nums"
                    >
                      {formatTime(match.matchedAt)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <h3 className="text-lg font-semibold">
                {t("tinder.peopleTitle")}
              </h3>
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                }}
                placeholder={t("tinder.searchPerson")}
                aria-label={t("tinder.searchPerson")}
                className="sm:max-w-xs"
              />
            </div>
            {people === null || people.length === 0 ? (
              <EmptyState>
                {search.trim() === ""
                  ? t("tinder.noPeople")
                  : t("tinder.noPeopleMatches")}
              </EmptyState>
            ) : (
              <ul className="flex flex-col gap-2">
                {people.map((person) => (
                  <li key={person.participantUuid}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(person.participantUuid);
                      }}
                      aria-label={t("tinder.showSwipes", {
                        name: person.displayName,
                      })}
                      className={cn(
                        "hover:bg-muted flex w-full flex-col gap-3 rounded-xl border p-3 text-left sm:flex-row sm:items-center",
                        !person.tinderOptIn && "opacity-70",
                      )}
                    >
                      <span className="flex min-w-0 flex-1 items-center gap-3">
                        <Avatar person={person} />
                        <span className="flex min-w-0 flex-col">
                          <span className="flex items-center gap-2 truncate font-medium">
                            {person.displayName}
                            {person.tinderOptIn ? null : (
                              <Badge variant="outline">
                                {t("tinder.hidden")}
                              </Badge>
                            )}
                          </span>
                          <span className="text-muted-foreground truncate text-sm">
                            {person.email}
                          </span>
                        </span>
                      </span>
                      <span className="flex flex-wrap gap-1 text-xs">
                        <Badge variant="secondary">
                          {t("tinder.likesGiven", {
                            count: person.likesGiven,
                          })}
                        </Badge>
                        <Badge variant="secondary">
                          {t("tinder.passesGiven", {
                            count: person.passesGiven,
                          })}
                        </Badge>
                        <Badge variant="secondary">
                          {t("tinder.likesReceived", {
                            count: person.likesReceived,
                          })}
                        </Badge>
                        <Badge
                          className={cn(
                            person.matchesCount > 0
                              ? "border-transparent bg-pink-600 text-white"
                              : "",
                          )}
                          variant={
                            person.matchesCount > 0 ? "default" : "secondary"
                          }
                        >
                          {t("tinder.matchesCount", {
                            count: person.matchesCount,
                          })}
                        </Badge>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <ParticipantSwipes
        eventUuid={eventUuid}
        participantUuid={selected}
        onSelect={setSelected}
        onClose={() => {
          setSelected(null);
        }}
      />
    </div>
  );
}
