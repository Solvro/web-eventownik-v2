"use client";

import { CameraOff, Loader2, RefreshCcw, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type Facing = "environment" | "user";

type Phase =
  | { kind: "starting" }
  | { kind: "live" }
  | { kind: "capturing" }
  | { kind: "selfie"; secondsLeft: number }
  | { kind: "error"; denied: boolean };

/** Remembered per tab: whether this device can run two cameras at once. */
const DUAL_KEY = "bereal-dual-camera";
let dualSupportMemo: boolean | null = null;

function readDualSupport(): boolean | null {
  if (dualSupportMemo !== null) {
    return dualSupportMemo;
  }
  try {
    const value = globalThis.sessionStorage.getItem(DUAL_KEY);
    return value === null ? null : value === "1";
  } catch {
    return null;
  }
}

function writeDualSupport(value: boolean) {
  dualSupportMemo = value;
  try {
    globalThis.sessionStorage.setItem(DUAL_KEY, value ? "1" : "0");
  } catch {
    // storage unavailable, the in-memory value is enough
  }
}

const SELFIE_COUNTDOWN_MS = 1500;

/** Whether the in-app camera can be used at all on this page. */
export function canUseInAppCamera(): boolean {
  return (
    typeof navigator !== "undefined" &&
    globalThis.isSecureContext &&
    typeof (navigator.mediaDevices as MediaDevices | undefined)
      ?.getUserMedia === "function"
  );
}

function otherFacing(facing: Facing): Facing {
  return facing === "environment" ? "user" : "environment";
}

function stopStream(stream: MediaStream | null) {
  if (stream === null) {
    return;
  }
  for (const track of stream.getTracks()) {
    track.stop();
  }
}

function isLive(stream: MediaStream | null): boolean {
  const track = stream?.getVideoTracks()[0];
  return track?.readyState === "live" && !track.muted;
}

function streamFacing(stream: MediaStream, requested: Facing): Facing {
  const reported = stream.getVideoTracks()[0]?.getSettings().facingMode;
  return reported === "user" || reported === "environment"
    ? reported
    : requested;
}

function streamDeviceId(stream: MediaStream | null): string | undefined {
  return stream?.getVideoTracks()[0]?.getSettings().deviceId;
}

async function openCamera(
  facing: Facing,
  exact: boolean,
  excludeDeviceId?: string,
): Promise<MediaStream> {
  const size = { width: { ideal: 1920 }, height: { ideal: 1920 } };
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        ...size,
        facingMode: exact ? { exact: facing } : { ideal: facing },
      },
    });
  } catch (error) {
    // Desktop webcams have no facingMode – pick any other device instead.
    if (
      !exact ||
      !(error instanceof Error) ||
      (error.name !== "OverconstrainedError" && error.name !== "NotFoundError")
    ) {
      throw error;
    }
    const devices = await navigator.mediaDevices.enumerateDevices();
    const other = devices.find(
      (device) =>
        device.kind === "videoinput" &&
        device.deviceId !== "" &&
        device.deviceId !== excludeDeviceId,
    );
    if (other === undefined) {
      throw error;
    }
    return navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { ...size, deviceId: { exact: other.deviceId } },
    });
  }
}

async function attach(video: HTMLVideoElement, stream: MediaStream) {
  video.srcObject = stream;
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    await new Promise<void>((resolve) => {
      const done = () => {
        video.removeEventListener("loadeddata", done);
        resolve();
      };
      video.addEventListener("loadeddata", done);
      globalThis.setTimeout(done, 3000);
    });
  }
  try {
    await video.play();
  } catch {
    // autoplay attribute keeps trying; a muted inline video is allowed
  }
}

async function grabFrame(
  video: HTMLVideoElement,
  mirror: boolean,
  name: string,
): Promise<File | null> {
  const width = video.videoWidth;
  const height = video.videoHeight;
  if (width === 0 || height === 0) {
    return null;
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (context === null) {
    return null;
  }
  if (mirror) {
    context.translate(width, 0);
    context.scale(-1, 1);
  }
  context.drawImage(video, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.9);
  });
  return blob === null ? null : new File([blob], name, { type: "image/jpeg" });
}

const wait = async (ms: number) =>
  new Promise<void>((resolve) => globalThis.setTimeout(resolve, ms));

function useRemaining(endsAt: string | undefined): string | null {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = globalThis.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => {
      globalThis.clearInterval(id);
    };
  }, []);
  if (endsAt === undefined) {
    return null;
  }
  const remaining = new Date(endsAt).getTime() - now;
  if (remaining <= 0) {
    return "Po czasie";
  }
  const total = Math.ceil(remaining / 1000);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/**
 * Full-screen BeerReal camera. One shutter press captures the chosen camera
 * and the opposite one – simultaneously when the device can run both, else
 * right after each other with a short "Uśmiech!" countdown.
 */
export function BerealCamera({
  prompt,
  endsAt,
  onClose,
  onCapture,
  onFallback,
}: {
  prompt?: string | null;
  endsAt?: string;
  onClose: () => void;
  onCapture: (photo: File, selfie: File | null) => void;
  onFallback: () => void;
}) {
  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const secondVideoRef = useRef<HTMLVideoElement>(null);
  const mainStreamRef = useRef<MediaStream | null>(null);
  const secondStreamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef(0);
  const hasOtherCameraRef = useRef(true);
  const [facing, setFacing] = useState<Facing>("environment");
  const [mirrorMain, setMirrorMain] = useState(false);
  const [dual, setDual] = useState(false);
  const [phase, setPhase] = useState<Phase>({ kind: "starting" });
  const remaining = useRemaining(endsAt);

  const stopAll = useCallback(() => {
    sessionRef.current += 1;
    stopStream(mainStreamRef.current);
    stopStream(secondStreamRef.current);
    mainStreamRef.current = null;
    secondStreamRef.current = null;
    for (const video of [mainVideoRef.current, secondVideoRef.current]) {
      if (video !== null) {
        video.srcObject = null;
      }
    }
  }, []);

  const start = useCallback(
    async (wanted: Facing) => {
      stopAll();
      const session = sessionRef.current;
      const stale = () => session !== sessionRef.current;
      setPhase({ kind: "starting" });
      setDual(false);
      try {
        const main = await openCamera(wanted, false);
        if (stale()) {
          stopStream(main);
          return;
        }
        mainStreamRef.current = main;
        setMirrorMain(streamFacing(main, wanted) === "user");
        const video = mainVideoRef.current;
        if (video !== null) {
          await attach(video, main);
        }
        if (stale()) {
          return;
        }
        const devices = await navigator.mediaDevices
          .enumerateDevices()
          .catch(() => []);
        const cameras = devices.filter(
          (device) => device.kind === "videoinput",
        );
        hasOtherCameraRef.current = cameras.length !== 1;
        setPhase({ kind: "live" });

        // Try to run the opposite camera at the same time.
        if (!hasOtherCameraRef.current || readDualSupport() === false) {
          return;
        }
        let second: MediaStream | null = null;
        try {
          second = await openCamera(
            otherFacing(wanted),
            true,
            streamDeviceId(main),
          );
        } catch {
          second = null;
        }
        if (stale()) {
          stopStream(second);
          return;
        }
        await wait(400);
        const bothLive =
          second !== null &&
          isLive(second) &&
          isLive(main) &&
          streamDeviceId(second) !== streamDeviceId(main);
        if (stale()) {
          stopStream(second);
          return;
        }
        if (bothLive && second !== null) {
          writeDualSupport(true);
          secondStreamRef.current = second;
          const secondVideo = secondVideoRef.current;
          if (secondVideo !== null) {
            await attach(secondVideo, second);
          }
          if (!stale()) {
            setDual(true);
          }
          return;
        }
        // The device cannot run both cameras (or opening the second one
        // killed the first) – use the sequential capture from now on.
        writeDualSupport(false);
        stopStream(second);
        if (!isLive(main)) {
          await start(wanted);
        }
      } catch (error) {
        if (stale()) {
          return;
        }
        stopAll();
        const name = error instanceof Error ? error.name : "";
        setPhase({
          kind: "error",
          denied: name === "NotAllowedError" || name === "SecurityError",
        });
      }
    },
    [stopAll],
  );

  useEffect(() => {
    void start(facing);
    return stopAll;
  }, [facing, start, stopAll]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        stopAll();
        setPhase({ kind: "starting" });
      } else {
        void start(facing);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [facing, start, stopAll]);

  const shoot = async () => {
    const mainVideo = mainVideoRef.current;
    if (phase.kind !== "live" || mainVideo === null) {
      return;
    }
    const session = sessionRef.current;
    setPhase({ kind: "capturing" });

    const secondVideo = secondVideoRef.current;
    if (dual && secondVideo !== null && isLive(secondStreamRef.current)) {
      const secondStream = secondStreamRef.current;
      const secondMirror =
        secondStream !== null &&
        streamFacing(secondStream, otherFacing(facing)) === "user";
      const [photo, selfie] = await Promise.all([
        grabFrame(mainVideo, mirrorMain, "photo.jpg"),
        grabFrame(secondVideo, secondMirror, "selfie.jpg"),
      ]);
      stopAll();
      if (photo === null) {
        setPhase({ kind: "error", denied: false });
        return;
      }
      onCapture(photo, selfie);
      return;
    }

    const photo = await grabFrame(mainVideo, mirrorMain, "photo.jpg");
    if (photo === null) {
      stopAll();
      setPhase({ kind: "error", denied: false });
      return;
    }
    if (!hasOtherCameraRef.current) {
      stopAll();
      onCapture(photo, null);
      return;
    }

    // Sequential fallback: switch to the opposite camera and count down.
    const excluded = streamDeviceId(mainStreamRef.current);
    stopAll();
    const selfieSession = sessionRef.current;
    if (session + 1 !== selfieSession) {
      return;
    }
    let selfieStream: MediaStream | null = null;
    try {
      selfieStream = await openCamera(otherFacing(facing), true, excluded);
    } catch {
      selfieStream = null;
    }
    if (selfieSession !== sessionRef.current) {
      stopStream(selfieStream);
      return;
    }
    if (selfieStream === null) {
      onCapture(photo, null);
      return;
    }
    mainStreamRef.current = selfieStream;
    const selfieMirror =
      streamFacing(selfieStream, otherFacing(facing)) === "user";
    setMirrorMain(selfieMirror);
    await attach(mainVideo, selfieStream);
    const startedAt = Date.now();
    while (Date.now() - startedAt < SELFIE_COUNTDOWN_MS) {
      if (selfieSession !== sessionRef.current) {
        return;
      }
      setPhase({
        kind: "selfie",
        secondsLeft: Math.max(
          1,
          Math.ceil((SELFIE_COUNTDOWN_MS - (Date.now() - startedAt)) / 1000),
        ),
      });
      await wait(100);
    }
    if (selfieSession !== sessionRef.current) {
      return;
    }
    const selfie = await grabFrame(mainVideo, selfieMirror, "selfie.jpg");
    stopAll();
    onCapture(photo, selfie);
  };

  const close = () => {
    stopAll();
    onClose();
  };

  const busy = phase.kind === "capturing" || phase.kind === "selfie";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Aparat BeerReal"
      className="fixed inset-0 z-[100] flex flex-col bg-black text-white select-none"
    >
      <div className="flex items-start gap-3 px-4 pt-[max(env(safe-area-inset-top),16px)] pb-3">
        <button
          type="button"
          onClick={close}
          aria-label="Zamknij aparat"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/15"
        >
          <X className="size-5" />
        </button>
        <div className="min-w-0 flex-1 pt-0.5 text-center">
          <p className="text-sm font-bold tracking-[-0.01em]">BeerReal</p>
          {prompt != null && prompt !== "" ? (
            <p className="truncate text-xs font-medium text-white/70">
              {prompt}
            </p>
          ) : null}
        </div>
        <span className="flex h-11 min-w-11 shrink-0 items-center justify-center rounded-full bg-white/15 px-3 text-xs font-semibold tabular-nums">
          {remaining ?? ""}
        </span>
      </div>

      <div className="relative mx-3 flex-1 overflow-hidden rounded-[28px] bg-neutral-900">
        <video
          ref={mainVideoRef}
          autoPlay
          playsInline
          muted
          className={cn(
            "size-full object-cover",
            mirrorMain && "-scale-x-100",
            phase.kind === "error" && "hidden",
          )}
        />
        <video
          ref={secondVideoRef}
          autoPlay
          playsInline
          muted
          aria-hidden
          className={cn(
            "absolute top-4 left-4 aspect-[3/4] w-[30%] rounded-[17px] border-[3px] border-white object-cover shadow-[0_4px_16px_rgba(0,0,0,0.35)]",
            facing === "environment" && "-scale-x-100",
            !dual && "hidden",
          )}
        />
        {phase.kind === "starting" || phase.kind === "capturing" ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="size-8 animate-spin text-white/80" />
          </div>
        ) : null}
        {phase.kind === "selfie" ? (
          <div
            aria-live="assertive"
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/20"
          >
            <span className="text-4xl font-extrabold drop-shadow-lg">
              Uśmiech!
            </span>
            <span className="text-7xl leading-none font-extrabold tabular-nums drop-shadow-lg">
              {phase.secondsLeft}
            </span>
          </div>
        ) : null}
        {phase.kind === "error" ? (
          <div
            role="alert"
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center"
          >
            <span className="flex size-16 items-center justify-center rounded-full bg-white/10">
              <CameraOff className="size-7" />
            </span>
            <p className="text-lg leading-6 font-semibold">
              {phase.denied
                ? "Brak dostępu do aparatu"
                : "Nie udało się uruchomić aparatu"}
            </p>
            <p className="text-sm leading-5 text-white/70">
              {phase.denied
                ? "Zezwól na dostęp do aparatu w ustawieniach przeglądarki albo zrób zdjęcie zwykłym aparatem telefonu."
                : "Spróbuj ponownie albo zrób zdjęcie zwykłym aparatem telefonu."}
            </p>
            <button
              type="button"
              onClick={() => {
                stopAll();
                onFallback();
              }}
              className="h-12 rounded-3xl bg-white px-6 text-sm font-semibold text-black"
            >
              Użyj aparatu telefonu
            </button>
            {phase.denied ? null : (
              <button
                type="button"
                onClick={() => void start(facing)}
                className="h-12 rounded-3xl bg-white/15 px-6 text-sm font-semibold"
              >
                Spróbuj ponownie
              </button>
            )}
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between px-10 pt-6 pb-[max(env(safe-area-inset-bottom),28px)]">
        <span className="size-12" aria-hidden />
        <button
          type="button"
          onClick={() => void shoot()}
          disabled={phase.kind !== "live"}
          aria-label="Zrób zdjęcie"
          className="flex size-20 items-center justify-center rounded-full border-[5px] border-white transition active:scale-95 disabled:opacity-50"
        >
          <span className="size-[60px] rounded-full bg-white" />
        </button>
        <button
          type="button"
          onClick={() => {
            setFacing((value) => otherFacing(value));
          }}
          disabled={busy || phase.kind === "error"}
          aria-label="Przełącz aparat"
          className="flex size-12 items-center justify-center rounded-full bg-white/15 disabled:opacity-40"
        >
          <RefreshCcw className="size-5" />
        </button>
      </div>
    </div>
  );
}
