"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import {
  AudioLines,
  Check,
  FileAudio,
  ImagePlus,
  Loader2,
  Mic,
  Pencil,
  Play,
  Plus,
  Square,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useMobile } from "@/components/mobile/mobile-context";
import { MobileScreen } from "@/components/mobile/mobile-screen";
import { useEventSlug } from "@/components/mobile/use-event-slug";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { MobileApiError, mobileApi, mobileKeys } from "@/lib/mobile/client";
import { downscaleImage } from "@/lib/mobile/image";
import { cn } from "@/lib/utils";
import type { MobileSoundboard, MobileSoundboardPad } from "@/types/mobile";

import { ErrorState, Skeleton } from "./states";
import { useObjectUrl } from "./use-object-url";

const SLOTS = 9;
/** Matches the server's limit */
const MAX_CAPTION = 40;
const MAX_RECORDING_MS = 15_000;
const MAX_AUDIO_BYTES = 3 * 1024 * 1024;
const HOLD_MS = 450;
/** Finger movement that turns a press into a scroll */
const HOLD_SLOP = 10;

/** First one the browser can record wins; AAC in MP4 plays everywhere, WebM is Chrome's fallback */
const RECORDING_TYPES = [
  "audio/mp4;codecs=mp4a.40.2",
  "audio/webm;codecs=opus",
  "audio/mp4",
  "audio/webm",
  "audio/ogg;codecs=opus",
];

/** Background of a pad without a picture, so the board is not nine grey squares */
const PAD_COLORS = [
  "bg-[linear-gradient(221deg,#F25C6B_0%,#E8455A_100%)]",
  "bg-[linear-gradient(221deg,#8B5CF6_0%,#6D28D9_100%)]",
  "bg-[linear-gradient(221deg,#F59E0B_0%,#D97706_100%)]",
  "bg-[linear-gradient(221deg,#2F9E8F_0%,#1F7A6E_100%)]",
  "bg-[linear-gradient(221deg,#262626_0%,#343434_100%)]",
  "bg-[linear-gradient(221deg,#0EA5E9_0%,#0369A1_100%)]",
  "bg-[linear-gradient(221deg,#EC4899_0%,#BE185D_100%)]",
  "bg-[linear-gradient(221deg,#22C55E_0%,#15803D_100%)]",
  "bg-[linear-gradient(221deg,#6366F1_0%,#4338CA_100%)]",
];

function extensionFor(mime: string): string {
  if (mime.includes("mp4") || mime.includes("aac")) {
    return "m4a";
  }
  if (mime.includes("ogg")) {
    return "ogg";
  }
  if (mime.includes("mpeg")) {
    return "mp3";
  }
  if (mime.includes("wav")) {
    return "wav";
  }
  return "webm";
}

function formatSeconds(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  return `0:${String(seconds).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Playback
// ---------------------------------------------------------------------------

interface NowPlaying {
  /** Which pad or preview is playing */
  key: string;
  /** Changes on every play, so a replayed sound restarts its progress bar */
  run: number;
  durationMs: number | null;
}

/** One sound at a time: starting a pad stops the previous one, tapping it again stops it */
function usePlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<NowPlaying | null>(null);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlaying(null);
  }, []);

  const play = useCallback(
    (key: string, url: string, durationMs: number | null) => {
      audioRef.current?.pause();
      // A fresh element per play, so events of the previous sound cannot touch this one
      const audio = new Audio(url);
      audioRef.current = audio;
      const run = Date.now();
      const finish = () => {
        setPlaying((current) => (current?.run === run ? null : current));
      };
      audio.addEventListener("ended", finish);
      audio.addEventListener("error", () => {
        finish();
        toast({ variant: "destructive", title: "Nie udało się odtworzyć" });
      });
      audio.addEventListener("loadedmetadata", () => {
        // Recordings without a stored length may still report one once loaded
        if (durationMs === null && Number.isFinite(audio.duration)) {
          setPlaying((current) =>
            current?.run === run
              ? { ...current, durationMs: audio.duration * 1000 }
              : current,
          );
        }
      });
      setPlaying({ key, run, durationMs });
      audio.play().catch(finish);
    },
    [],
  );

  const toggle = useCallback(
    (key: string, url: string, durationMs: number | null) => {
      if (playing?.key === key) {
        stop();
      } else {
        play(key, url, durationMs);
      }
    },
    [play, playing?.key, stop],
  );

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  return { playing, toggle, stop };
}

type Player = ReturnType<typeof usePlayer>;

/** Fills over the length of the sound; pulses when the length is unknown */
function PlayProgress({
  playing,
  className,
}: {
  playing: NowPlaying;
  className?: string;
}) {
  const barRef = useRef<HTMLSpanElement>(null);
  const { durationMs, run } = playing;

  useEffect(() => {
    const bar = barRef.current;
    if (bar === null || durationMs === null) {
      return;
    }
    const animation = bar.animate(
      [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
      { duration: durationMs, easing: "linear", fill: "forwards" },
    );
    return () => {
      animation.cancel();
    };
  }, [durationMs, run]);

  return (
    <span
      className={cn(
        "block h-1 overflow-hidden rounded-full bg-white/30",
        className,
      )}
    >
      <span
        ref={barRef}
        className={cn(
          "block h-full origin-left rounded-full bg-white",
          durationMs === null && "animate-pulse",
        )}
      />
    </span>
  );
}

// ---------------------------------------------------------------------------
// Board
// ---------------------------------------------------------------------------

/** Tap plays, holding (or right-click) opens the editor; a scroll cancels the hold */
function usePadPress(onTap: () => void, onHold: () => void) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const held = useRef(false);

  const cancel = () => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    start.current = null;
  };

  const hold = () => {
    cancel();
    held.current = true;
    if ("vibrate" in navigator) {
      navigator.vibrate(15);
    }
    onHold();
  };

  return {
    onPointerDown: (event: React.PointerEvent) => {
      if (event.button !== 0) {
        return;
      }
      held.current = false;
      start.current = { x: event.clientX, y: event.clientY };
      timer.current = setTimeout(hold, HOLD_MS);
    },
    onPointerMove: (event: React.PointerEvent) => {
      if (
        start.current !== null &&
        Math.hypot(
          event.clientX - start.current.x,
          event.clientY - start.current.y,
        ) > HOLD_SLOP
      ) {
        cancel();
      }
    },
    onPointerUp: cancel,
    onPointerCancel: cancel,
    onPointerLeave: cancel,
    onContextMenu: (event: React.MouseEvent) => {
      event.preventDefault();
      if (!held.current) {
        hold();
      }
    },
    onClick: () => {
      // The click that ends a hold must not also play the sound
      if (held.current) {
        held.current = false;
        return;
      }
      onTap();
    },
  };
}

function Pad({
  slot,
  pad,
  editing,
  playing,
  onPlay,
  onEdit,
}: {
  slot: number;
  pad: MobileSoundboardPad | null;
  editing: boolean;
  playing: NowPlaying | null;
  onPlay: () => void;
  onEdit: () => void;
}) {
  const press = usePadPress(pad === null || editing ? onEdit : onPlay, onEdit);
  const isPlaying = playing !== null && pad !== null;

  if (pad === null) {
    return (
      <button
        type="button"
        {...press}
        aria-label={`Puste pole ${String(slot + 1)}, nagraj dźwięk`}
        className="border-border text-muted-foreground flex aspect-square touch-manipulation flex-col items-center justify-center gap-1.5 rounded-[23px] border-2 border-dashed text-xs font-semibold transition select-none [-webkit-touch-callout:none] active:scale-95"
      >
        <Plus className="size-6" strokeWidth={2} />
        Nagraj
      </button>
    );
  }

  return (
    <button
      type="button"
      {...press}
      aria-label={
        editing ? `Edytuj „${pad.caption}”` : `Odtwórz „${pad.caption}”`
      }
      aria-pressed={editing ? undefined : isPlaying}
      className={cn(
        "relative flex aspect-square touch-manipulation flex-col justify-end overflow-hidden rounded-[23px] p-2.5 text-left text-white transition select-none [-webkit-touch-callout:none] active:scale-95",
        PAD_COLORS[slot % PAD_COLORS.length],
        isPlaying && "scale-[0.97] ring-4 ring-white/80",
      )}
    >
      {pad.imageUrl === null ? (
        <AudioLines
          className="absolute top-2.5 left-2.5 size-5 opacity-70"
          aria-hidden
        />
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pad.imageUrl}
            alt=""
            draggable={false}
            loading="lazy"
            className="pointer-events-none absolute inset-0 size-full object-cover"
          />
          <span
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(0,0,0,0.75)_100%)]"
          />
        </>
      )}
      {editing ? (
        <span className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-black/55">
          <Pencil className="size-3.5" aria-hidden />
        </span>
      ) : null}
      <span className="relative line-clamp-2 text-[13px] leading-[1.2] font-bold [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]">
        {pad.caption}
      </span>
      {isPlaying ? (
        <PlayProgress playing={playing} className="relative mt-1.5" />
      ) : null}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Editor
// ---------------------------------------------------------------------------

interface Recording {
  file: File;
  durationMs: number | null;
}

/** Microphone recording, stopped by the user or after MAX_RECORDING_MS */
function useRecorder(onDone: (recording: Recording) => void) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [elapsed, setElapsed] = useState<number | null>(null);

  const release = useCallback(() => {
    if (tickRef.current !== null) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    for (const track of streamRef.current?.getTracks() ?? []) {
      track.stop();
    }
    streamRef.current = null;
  }, []);

  const stop = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder !== null && recorder.state !== "inactive") {
      recorder.stop();
    }
  }, []);

  const start = useCallback(async () => {
    if (
      typeof MediaRecorder === "undefined" ||
      !("mediaDevices" in navigator)
    ) {
      toast({
        variant: "destructive",
        title: "Ta przeglądarka nie umie nagrywać",
        description: "Wybierz plik z dźwiękiem zamiast nagrania.",
      });
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      toast({
        variant: "destructive",
        title: "Brak dostępu do mikrofonu",
        description: "Zezwól aplikacji na mikrofon w ustawieniach telefonu.",
      });
      return;
    }
    streamRef.current = stream;
    const mimeType = RECORDING_TYPES.find((type) =>
      MediaRecorder.isTypeSupported(type),
    );
    const recorder = new MediaRecorder(
      stream,
      mimeType === undefined ? undefined : { mimeType },
    );
    recorderRef.current = recorder;
    const chunks: Blob[] = [];
    const startedAt = Date.now();
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };
    recorder.onstop = () => {
      const durationMs = Math.min(Date.now() - startedAt, MAX_RECORDING_MS);
      release();
      setElapsed(null);
      recorderRef.current = null;
      const type = recorder.mimeType === "" ? "audio/webm" : recorder.mimeType;
      const file = new File(chunks, "recording", { type: type.split(";")[0] });
      if (file.size > 0) {
        onDone({ file, durationMs });
      }
    };
    recorder.start(250);
    setElapsed(0);
    tickRef.current = setInterval(() => {
      const now = Date.now() - startedAt;
      setElapsed(now);
      if (now >= MAX_RECORDING_MS) {
        stop();
      }
    }, 100);
  }, [onDone, release, stop]);

  // Leaving the editor mid-recording must free the microphone
  useEffect(() => {
    return () => {
      const recorder = recorderRef.current;
      if (recorder !== null && recorder.state !== "inactive") {
        recorder.onstop = null;
        recorder.stop();
      }
      release();
    };
  }, [release]);

  return { elapsed, start, stop };
}

/** Length of a picked file, when the browser can tell */
async function measureDuration(file: File): Promise<number | null> {
  const url = URL.createObjectURL(file);
  try {
    return await new Promise((resolve) => {
      const audio = new Audio();
      audio.preload = "metadata";
      audio.addEventListener("loadedmetadata", () => {
        resolve(
          Number.isFinite(audio.duration)
            ? Math.round(audio.duration * 1000)
            : null,
        );
      });
      audio.addEventListener("error", () => {
        resolve(null);
      });
      audio.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function showSaveError(error: Error) {
  let title = "Nie udało się zapisać";
  if (error instanceof MobileApiError) {
    if (error.status === 413) {
      title = "Plik jest za duży";
    } else if (error.status === 429) {
      title = "Za dużo zmian naraz. Spróbuj za kilka minut.";
    } else if (error.message.includes("audio format")) {
      title = "Ten format dźwięku nie jest obsługiwany";
    }
  }
  toast({ variant: "destructive", title });
}

function PadEditor({
  slot,
  pad,
  player,
  onClose,
}: {
  slot: number;
  pad: MobileSoundboardPad | null;
  player: Player;
  onClose: () => void;
}) {
  const eventSlug = useEventSlug();
  const queryClient = useQueryClient();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [recording, setRecording] = useState<Recording | null>(null);
  const [caption, setCaption] = useState(pad?.caption ?? "");
  const [image, setImage] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const recorder = useRecorder(setRecording);
  const recordingUrl = useObjectUrl(recording?.file ?? null);
  const imagePreview = useObjectUrl(image);
  const shownImage =
    imagePreview ?? (removeImage ? null : (pad?.imageUrl ?? null));
  const isRecording = recorder.elapsed !== null;

  const onSaved = (board: MobileSoundboard) => {
    queryClient.setQueryData(mobileKeys.soundboard(eventSlug), board);
    player.stop();
    onClose();
  };

  const save = useMutation({
    mutationFn: async () => {
      const body = new FormData();
      body.append("caption", caption.trim());
      if (recording !== null) {
        const type = recording.file.type;
        body.append("audio", recording.file, `sound.${extensionFor(type)}`);
        if (recording.durationMs !== null) {
          body.append("durationMs", String(recording.durationMs));
        }
      }
      if (image !== null) {
        body.append("image", await downscaleImage(image), "image.jpg");
      } else if (removeImage) {
        body.append("removeImage", "true");
      }
      return mobileApi<MobileSoundboard>(
        eventSlug,
        `soundboard/pads/${String(slot)}`,
        { method: "PUT", body },
      );
    },
    onSuccess: (board) => {
      toast({ title: pad === null ? "Nagrane! 🎙️" : "Zapisane ✅" });
      onSaved(board);
    },
    onError: showSaveError,
  });

  const clear = useMutation({
    mutationFn: async () =>
      mobileApi<MobileSoundboard>(
        eventSlug,
        `soundboard/pads/${String(slot)}`,
        { method: "DELETE" },
      ),
    onSuccess: (board) => {
      toast({ title: "Pole wyczyszczone" });
      onSaved(board);
    },
    onError: showSaveError,
  });

  const busy = save.isPending || clear.isPending;
  const hasSound = recording !== null || pad !== null;
  const canSave = hasSound && caption.trim() !== "" && !isRecording && !busy;

  const playKey = `editor-${String(slot)}`;
  const previewPlaying = player.playing?.key === playKey;

  return (
    <div className="flex flex-col gap-5">
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file === undefined) {
            return;
          }
          if (file.size > MAX_AUDIO_BYTES) {
            toast({ variant: "destructive", title: "Plik jest za duży" });
            return;
          }
          void measureDuration(file).then((durationMs) => {
            setRecording({ file, durationMs });
          });
        }}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          setImage(event.target.files?.[0] ?? null);
          setRemoveImage(false);
          event.target.value = "";
        }}
      />

      {/* Sound */}
      {isRecording ? (
        <button
          type="button"
          onClick={recorder.stop}
          className="flex h-28 flex-col items-center justify-center gap-2 rounded-3xl bg-[#FF3B30] text-white transition active:scale-[0.99]"
        >
          <span className="flex items-center gap-2 text-base font-bold tabular-nums">
            <span className="size-2.5 animate-pulse rounded-full bg-white" />
            {formatSeconds(recorder.elapsed ?? 0)} /{" "}
            {formatSeconds(MAX_RECORDING_MS)}
          </span>
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            <Square className="size-4 fill-current" aria-hidden />
            Zatrzymaj
          </span>
        </button>
      ) : hasSound ? (
        <div className="bg-secondary flex items-center gap-3 rounded-3xl p-3">
          <button
            type="button"
            onClick={() => {
              const url = recordingUrl ?? pad?.audioUrl;
              if (url !== undefined) {
                player.toggle(
                  playKey,
                  url,
                  recording === null
                    ? (pad?.durationMs ?? null)
                    : recording.durationMs,
                );
              }
            }}
            aria-label={previewPlaying ? "Zatrzymaj" : "Odsłuchaj"}
            className="bg-primary text-primary-foreground flex size-12 shrink-0 items-center justify-center rounded-full transition active:scale-95"
          >
            {previewPlaying ? (
              <Square className="size-4 fill-current" />
            ) : (
              <Play className="size-5 fill-current" />
            )}
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">
              {recording === null ? "Obecny dźwięk" : "Nowe nagranie"}
            </p>
            <p className="text-muted-foreground text-xs font-medium">
              {recording === null
                ? pad?.durationMs == null
                  ? "Dotknij, żeby odsłuchać"
                  : formatSeconds(pad.durationMs)
                : recording.durationMs === null
                  ? "Gotowe do zapisania"
                  : formatSeconds(recording.durationMs)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              player.stop();
              void recorder.start();
            }}
            className="bg-background flex h-10 shrink-0 items-center gap-1.5 rounded-3xl px-3.5 text-sm font-semibold transition active:scale-95"
          >
            <Mic className="size-4" />
            {recording === null ? "Nagraj nowy" : "Od nowa"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => {
              player.stop();
              void recorder.start();
            }}
            className="flex h-28 w-full flex-col items-center justify-center gap-2 rounded-3xl bg-[var(--mobile-accent)] text-[var(--mobile-accent-foreground)] transition active:scale-[0.99]"
          >
            <Mic className="size-7" />
            <span className="text-sm font-semibold">
              Nagraj dźwięk (do {MAX_RECORDING_MS / 1000} s)
            </span>
          </button>
        </div>
      )}
      {isRecording ? null : (
        <button
          type="button"
          onClick={() => audioInputRef.current?.click()}
          className="text-muted-foreground -mt-2 flex items-center justify-center gap-1.5 self-center text-xs font-semibold"
        >
          <FileAudio className="size-3.5" />
          albo wybierz plik z dźwiękiem
        </button>
      )}

      {/* Caption */}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3 px-1">
          <label
            htmlFor="soundboard-caption"
            className="text-foreground text-sm leading-[1.2] font-semibold"
          >
            Podpis
          </label>
          <span className="text-muted-foreground text-xs font-medium tabular-nums">
            {caption.length}/{MAX_CAPTION}
          </span>
        </div>
        <input
          id="soundboard-caption"
          value={caption}
          onChange={(event) => {
            setCaption(event.target.value.slice(0, MAX_CAPTION));
          }}
          maxLength={MAX_CAPTION}
          placeholder="Np. Szef wchodzi na salę"
          enterKeyHint="done"
          className="bg-secondary placeholder:text-muted-foreground h-14 w-full rounded-3xl px-5 text-base font-medium outline-none focus-visible:ring-2 focus-visible:ring-[var(--mobile-accent)]"
        />
      </div>

      {/* Picture */}
      {shownImage === null ? (
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="text-muted-foreground bg-secondary flex h-16 items-center justify-center gap-2 rounded-3xl text-sm font-semibold transition active:scale-[0.99]"
        >
          <ImagePlus className="size-5" />
          Dodaj obrazek (opcjonalnie)
        </button>
      ) : (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={shownImage}
            alt="Obrazek pola"
            className="h-36 w-full rounded-3xl object-cover"
          />
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="flex min-h-9 items-center rounded-[22px] bg-black/60 px-3 text-xs font-semibold text-white"
            >
              Zmień
            </button>
            <button
              type="button"
              onClick={() => {
                setImage(null);
                setRemoveImage(pad?.imageUrl != null);
              }}
              className="flex min-h-9 items-center rounded-[22px] bg-black/60 px-3 text-xs font-semibold text-white"
            >
              Usuń
            </button>
          </div>
        </div>
      )}

      <Button
        disabled={!canSave}
        className="bg-primary text-primary-foreground hover:bg-primary/90 h-[60px] rounded-3xl text-base font-semibold tracking-[0.01em]"
        onClick={() => {
          save.mutate();
        }}
      >
        {save.isPending ? <Loader2 className="animate-spin" /> : <Check />}
        Zapisz
      </Button>

      {pad === null ? null : confirmClear ? (
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={busy}
            className="border-border h-12 flex-1 rounded-3xl font-semibold"
            onClick={() => {
              setConfirmClear(false);
            }}
          >
            Anuluj
          </Button>
          <Button
            disabled={busy}
            className="h-12 flex-1 rounded-3xl bg-[var(--mobile-danger)] font-semibold text-white hover:bg-[var(--mobile-danger)]/90"
            onClick={() => {
              clear.mutate();
            }}
          >
            {clear.isPending ? <Loader2 className="animate-spin" /> : null}
            Tak, wyczyść
          </Button>
        </div>
      ) : (
        <button
          type="button"
          disabled={busy || isRecording}
          onClick={() => {
            setConfirmClear(true);
          }}
          className="flex items-center justify-center gap-1.5 self-center text-sm font-semibold text-[var(--mobile-danger)] disabled:opacity-50"
        >
          <Trash2 className="size-4" />
          Wyczyść pole
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export function SoundboardScreen() {
  const eventSlug = useEventSlug();
  const { surface } = useMobile();
  const player = usePlayer();
  const [editMode, setEditMode] = useState(false);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const query = useQuery({
    queryKey: mobileKeys.soundboard(eventSlug),
    queryFn: async () => mobileApi<MobileSoundboard>(eventSlug, "soundboard"),
    // Others record over pads too
    refetchInterval: 20_000,
    refetchIntervalInBackground: false,
  });

  const pads = query.data?.pads ?? [];
  const editingPad = editingSlot === null ? null : (pads[editingSlot] ?? null);
  const filled = pads.filter((pad) => pad !== null).length;

  const closeEditor = () => {
    if (player.playing?.key.startsWith("editor-") === true) {
      player.stop();
    }
    setEditingSlot(null);
  };

  let content: React.ReactNode;
  if (query.isPending) {
    content = (
      <div className="grid grid-cols-3 gap-2.5 px-5 pt-5">
        {Array.from({ length: SLOTS }, (_, index) => (
          <Skeleton key={index} className="aspect-square rounded-[23px]" />
        ))}
      </div>
    );
  } else if (query.isError) {
    content = <ErrorState onRetry={() => void query.refetch()} />;
  } else {
    content = (
      <div className="flex flex-col gap-5 px-5 pt-5">
        <div className="grid grid-cols-3 gap-2.5">
          {Array.from({ length: SLOTS }, (_, slot) => {
            const pad = pads[slot] ?? null;
            const key = `pad-${String(slot)}`;
            return (
              <Pad
                key={slot}
                slot={slot}
                pad={pad}
                editing={editMode}
                playing={player.playing?.key === key ? player.playing : null}
                onPlay={() => {
                  if (pad !== null) {
                    player.toggle(key, pad.audioUrl, pad.durationMs);
                  }
                }}
                onEdit={() => {
                  player.stop();
                  setEditingSlot(slot);
                }}
              />
            );
          })}
        </div>
        <p className="text-muted-foreground px-2 text-center text-sm leading-5 font-medium">
          {editMode
            ? "Wybierz pole, żeby nagrać je od nowa, zmienić podpis albo obrazek."
            : filled === 0
              ? "Tablica jest pusta. Dotknij pola i nagraj pierwszy dźwięk!"
              : "Dotknij, żeby odtworzyć. Przytrzymaj, żeby nagrać coś swojego."}
        </p>
      </div>
    );
  }

  return (
    <MobileScreen
      title="Soundboard"
      backHref={`/${eventSlug}/app`}
      action={
        query.isSuccess ? (
          <button
            type="button"
            onClick={() => {
              player.stop();
              setEditMode((value) => !value);
            }}
            aria-pressed={editMode}
            className={cn(
              "flex h-11 items-center gap-1.5 rounded-3xl px-4 text-sm font-semibold transition active:scale-95",
              editMode
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground",
            )}
          >
            {editMode ? (
              <>
                <Check className="size-4" />
                Gotowe
              </>
            ) : (
              <>
                <Pencil className="size-4" />
                Edytuj
              </>
            )}
          </button>
        ) : undefined
      }
    >
      {content}
      <Dialog
        open={editingSlot !== null}
        onOpenChange={(open) => {
          if (!open) {
            closeEditor();
          }
        }}
      >
        <DialogContent
          className={cn(
            surface.className,
            "max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2.5rem)] gap-5 overflow-y-auto rounded-[32px] border-0 p-6 tracking-[-0.01em] sm:max-w-sm",
          )}
          style={surface.style}
        >
          {editingSlot === null ? null : (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl leading-[1.3] font-bold">
                  {editingPad === null
                    ? `Pole ${String(editingSlot + 1)}`
                    : editingPad.caption}
                </DialogTitle>
                <DialogDescription>
                  {editingPad === null
                    ? "Nagraj dźwięk, podpisz go i dodaj obrazek, jeśli chcesz. Usłyszy go każdy uczestnik."
                    : `Ostatnio zmienione${
                        editingPad.author === null
                          ? ""
                          : ` przez ${editingPad.author.displayName}`
                      } ${formatDistanceToNow(new Date(editingPad.updatedAt), {
                        addSuffix: true,
                        locale: pl,
                      })}. Możesz je nagrać od nowa albo zmienić podpis.`}
                </DialogDescription>
              </DialogHeader>
              {/* Keyed by pad, so a board refresh mid-edit keeps the recording */}
              <PadEditor
                key={editingSlot}
                slot={editingSlot}
                pad={editingPad}
                player={player}
                onClose={closeEditor}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </MobileScreen>
  );
}
