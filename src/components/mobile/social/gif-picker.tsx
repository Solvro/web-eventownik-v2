"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useEventSlug } from "@/components/mobile/use-event-slug";
import { mobileApi, mobileKeys } from "@/lib/mobile/client";
import { cn } from "@/lib/utils";
import type { MobileChatGif, MobileGif, MobileGifSearch } from "@/types/mobile";

const SEARCH_DELAY_MS = 400;

function gifsPath(query: string, offset: number): string {
  const parameters = new URLSearchParams({ offset: String(offset) });
  if (query !== "") {
    parameters.set("q", query);
  }
  return `chat/gifs?${parameters.toString()}`;
}

/** A GIF in a message: its size is known up front, so nothing jumps as it loads */
export function ChatGifImage({
  gif,
  className,
}: {
  gif: MobileChatGif;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={gif.url}
      alt="GIF"
      width={gif.width}
      height={gif.height}
      loading="lazy"
      draggable={false}
      className={cn(
        "block h-auto w-[220px] max-w-full rounded-2xl bg-black/10 object-cover",
        className,
      )}
      style={{ aspectRatio: `${String(gif.width)} / ${String(gif.height)}` }}
    />
  );
}

/** Bottom sheet for finding a GIF: trending first, search as you type */
export function GifPicker({
  onPick,
  onClose,
}: {
  onPick: (gif: MobileGif) => void;
  onClose: () => void;
}) {
  const eventSlug = useEventSlug();
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = globalThis.setTimeout(() => {
      setQuery(input.trim());
    }, SEARCH_DELAY_MS);
    return () => {
      globalThis.clearTimeout(timer);
    };
  }, [input]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    globalThis.addEventListener("keydown", onKey);
    return () => {
      globalThis.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const search = useInfiniteQuery({
    queryKey: mobileKeys.gifSearch(eventSlug, query),
    queryFn: async ({ pageParam }) =>
      mobileApi<MobileGifSearch>(eventSlug, gifsPath(query, pageParam)),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextOffset ?? undefined,
    staleTime: 10 * 60_000,
  });
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = search;

  // Loads the next page when the end of the grid comes into view
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (sentinel === null) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries.some((entry) => entry.isIntersecting) &&
          hasNextPage &&
          !isFetchingNextPage
        ) {
          void fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // The same GIF can come back on two pages
  const seen = new Set<string>();
  const gifs: MobileGif[] = [];
  for (const page of search.data?.pages ?? []) {
    for (const gif of page.results) {
      if (!seen.has(gif.id)) {
        seen.add(gif.id);
        gifs.push(gif);
      }
    }
  }

  return (
    <div
      role="dialog"
      aria-modal
      aria-label="Wybierz GIF"
      className="fixed inset-0 z-50 flex flex-col justify-end"
    >
      <button
        type="button"
        aria-label="Zamknij"
        onClick={onClose}
        className="animate-in fade-in absolute inset-0 bg-black/40"
      />
      <div className="bg-background animate-in slide-in-from-bottom relative mx-auto flex h-[75dvh] w-full max-w-md flex-col rounded-t-[32px] pt-3 duration-200">
        <span
          aria-hidden
          className="bg-border mx-auto mb-3 block h-1.5 w-10 shrink-0 rounded-full"
        />
        <div className="flex shrink-0 items-center gap-2 px-4 pb-3">
          <label className="bg-secondary flex h-12 flex-1 items-center gap-2 rounded-3xl px-4">
            <Search
              className="text-muted-foreground size-5 shrink-0"
              aria-hidden
            />
            <input
              value={input}
              onChange={(event) => {
                setInput(event.target.value.slice(0, 50));
              }}
              placeholder="Szukaj GIF-ów"
              aria-label="Szukaj GIF-ów"
              enterKeyHint="search"
              className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-base font-medium outline-none"
            />
            {input === "" ? null : (
              <button
                type="button"
                onClick={() => {
                  setInput("");
                }}
                aria-label="Wyczyść"
                className="text-muted-foreground -mr-2 flex size-9 shrink-0 items-center justify-center rounded-full"
              >
                <X className="size-4" />
              </button>
            )}
          </label>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4">
          {search.isPending ? (
            <div className="flex justify-center py-16">
              <Loader2 className="text-muted-foreground size-6 animate-spin" />
            </div>
          ) : search.isError ? (
            <p className="text-muted-foreground py-16 text-center text-sm font-medium">
              Nie udało się wczytać GIF-ów. Spróbuj za chwilę.
            </p>
          ) : gifs.length === 0 ? (
            <p className="text-muted-foreground py-16 text-center text-sm font-medium">
              Nic nie znaleziono dla „{query}”.
            </p>
          ) : (
            <div className="columns-2 gap-2">
              {gifs.map((gif) => (
                <button
                  key={gif.id}
                  type="button"
                  onClick={() => {
                    onPick(gif);
                  }}
                  aria-label={gif.title === "" ? "GIF" : gif.title}
                  className="mb-2 block w-full overflow-hidden rounded-2xl transition active:scale-95"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={gif.url}
                    alt=""
                    width={gif.width}
                    height={gif.height}
                    loading="lazy"
                    className="bg-secondary block h-auto w-full"
                    style={{
                      aspectRatio: `${String(gif.width)} / ${String(gif.height)}`,
                    }}
                  />
                </button>
              ))}
            </div>
          )}
          <div ref={sentinelRef} className="flex justify-center py-3">
            {isFetchingNextPage ? (
              <Loader2 className="text-muted-foreground size-5 animate-spin" />
            ) : null}
          </div>
        </div>

        <p className="text-muted-foreground shrink-0 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] text-center text-[11px] font-semibold tracking-wide">
          Powered by GIPHY
        </p>
      </div>
    </div>
  );
}
