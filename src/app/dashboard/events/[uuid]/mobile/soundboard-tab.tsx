"use client";

import { ImageOff, Loader, RefreshCw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { MobileSoundboard } from "@/types/mobile";

import { clearSoundboardPad, getSoundboard } from "./actions";
import { DeleteButton, LoadError, SectionHeader } from "./shared";

/** The nine pads as participants see them, each playable and clearable */
export function SoundboardTab({ eventUuid }: { eventUuid: string }) {
  const t = useTranslations("MobileAdmin");
  const locale = useLocale();
  const [board, setBoard] = useState<MobileSoundboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    const result = await getSoundboard(eventUuid);
    setIsLoading(false);
    if (result.success) {
      setBoard(result.data);
      setError(null);
    } else {
      setError(result.error);
    }
  }, [eventUuid]);

  useEffect(() => {
    void load();
  }, [load]);

  async function clear(slot: number) {
    const result = await clearSoundboardPad(eventUuid, slot);
    if (result.success) {
      setBoard(result.data);
      toast({ title: t("soundboard.cleared") });
    } else {
      toast({
        title: t("actionFailed"),
        description: result.error,
        variant: "destructive",
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title={t("soundboard.title")}
        description={t("soundboard.description")}
        action={
          <Button
            variant="outline"
            onClick={() => {
              void load();
            }}
            disabled={isLoading}
          >
            {isLoading ? <Loader className="animate-spin" /> : <RefreshCw />}
            {t("soundboard.refresh")}
          </Button>
        }
      />
      {error === null ? null : (
        <LoadError message={t("soundboard.loadFailed", { error })} />
      )}
      {board === null ? (
        error === null ? (
          <Loader className="text-muted-foreground mx-auto animate-spin" />
        ) : null
      ) : (
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {board.pads.map((pad, slot) => {
            const number = slot + 1;
            return (
              <li
                // Pads are fixed positions on the board
                // eslint-disable-next-line react/no-array-index-key
                key={slot}
                className="flex flex-col gap-3 rounded-xl border p-4"
              >
                <div className="flex items-start gap-3">
                  {pad?.imageUrl == null ? (
                    <span className="bg-muted text-muted-foreground flex size-14 shrink-0 items-center justify-center rounded-lg">
                      {pad === null ? (
                        <span className="text-sm font-semibold tabular-nums">
                          {number}
                        </span>
                      ) : (
                        <ImageOff className="size-5" aria-hidden />
                      )}
                    </span>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={pad.imageUrl}
                      alt=""
                      className="size-14 shrink-0 rounded-lg object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-muted-foreground text-xs">
                      {t("soundboard.pad", { number })}
                    </p>
                    <p className="truncate font-semibold">
                      {pad === null ? (
                        <span className="text-muted-foreground font-normal">
                          {t("soundboard.empty")}
                        </span>
                      ) : (
                        pad.caption
                      )}
                    </p>
                    {pad === null ? null : (
                      <p className="text-muted-foreground truncate text-xs">
                        {t("soundboard.by", {
                          name:
                            pad.author?.displayName ??
                            t("soundboard.unknownAuthor"),
                        })}
                        {" · "}
                        {new Date(pad.updatedAt).toLocaleString(locale, {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                  {pad === null ? null : (
                    <DeleteButton
                      label={t("soundboard.clear", { number })}
                      description={t("soundboard.clearDescription")}
                      onConfirm={async () => clear(slot)}
                    />
                  )}
                </div>
                {pad === null ? null : (
                  <audio
                    controls
                    preload="none"
                    src={pad.audioUrl}
                    className="h-9 w-full"
                  >
                    <track kind="captions" />
                  </audio>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
