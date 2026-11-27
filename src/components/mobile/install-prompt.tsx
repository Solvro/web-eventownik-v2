"use client";

import { Download, EllipsisVertical, Share, SquarePlus, X } from "lucide-react";
import { useEffect, useState } from "react";

import { useMobile } from "./mobile-context";

type Platform =
  | "ios-safari"
  | "ios-other"
  | "android"
  | "in-app-ios"
  | "in-app-android";

/** Chrome's install event; not part of the standard DOM typings */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const SHOW_DELAY_MS = 1500;
/** After "Nie teraz" the prompt stays hidden for this long */
const DISMISS_FOR_MS = 3 * 24 * 60 * 60 * 1000;

function isStandalone(): boolean {
  const iosStandalone =
    "standalone" in navigator &&
    (navigator as { standalone?: boolean }).standalone === true;
  return (
    iosStandalone || globalThis.matchMedia("(display-mode: standalone)").matches
  );
}

/** Returns null on desktop, where there is nothing to install */
function detectPlatform(): Platform | null {
  const userAgent = navigator.userAgent;
  const isIos =
    /iPad|iPhone|iPod/.test(userAgent) ||
    // iPadOS reports itself as a Mac
    (userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1);
  const isAndroid = userAgent.includes("Android");
  // Browsers embedded in social apps cannot add pages to the home screen
  const isInApp = /FBAN|FBAV|FB_IAB|Instagram|Messenger|Line\/|TikTok/i.test(
    userAgent,
  );

  if (isIos) {
    if (isInApp) {
      return "in-app-ios";
    }
    return /CriOS|FxiOS|EdgiOS|OPiOS/.test(userAgent)
      ? "ios-other"
      : "ios-safari";
  }
  if (isAndroid) {
    return isInApp ? "in-app-android" : "android";
  }
  return null;
}

function dismissedKey(eventSlug: string): string {
  return `mobile-install-dismissed-${eventSlug}`;
}

function wasRecentlyDismissed(eventSlug: string): boolean {
  try {
    const value = localStorage.getItem(dismissedKey(eventSlug));
    return value !== null && Date.now() - Number(value) < DISMISS_FOR_MS;
  } catch {
    return false;
  }
}

function Step({
  number,
  children,
}: {
  number: number;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--mobile-accent)] text-xs font-bold text-[var(--mobile-accent-foreground)]">
        {number}
      </span>
      <span className="text-sm leading-5 font-medium">{children}</span>
    </li>
  );
}

function InlineIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="mx-1 inline-flex size-6 items-center justify-center rounded-md bg-white align-middle text-[#2B80FF] [&>svg]:size-4">
      {children}
    </span>
  );
}

function Steps({ platform }: { platform: Platform }) {
  switch (platform) {
    case "ios-safari": {
      return (
        <ol className="flex flex-col gap-3">
          <Step number={1}>
            Stuknij
            <InlineIcon>
              <Share aria-hidden />
            </InlineIcon>
            <b>Udostępnij</b> na pasku przeglądarki
          </Step>
          <Step number={2}>
            Wybierz
            <InlineIcon>
              <SquarePlus aria-hidden />
            </InlineIcon>
            <b>Do ekranu początkowego</b>
          </Step>
          <Step number={3}>
            Potwierdź przyciskiem <b>Dodaj</b>
          </Step>
        </ol>
      );
    }
    case "ios-other": {
      return (
        <ol className="flex flex-col gap-3">
          <Step number={1}>
            Stuknij
            <InlineIcon>
              <Share aria-hidden />
            </InlineIcon>
            <b>Udostępnij</b> obok paska adresu
          </Step>
          <Step number={2}>
            Wybierz <b>Dodaj do ekranu głównego</b>
          </Step>
          <Step number={3}>
            Jeśli nie widzisz tej opcji, otwórz stronę w <b>Safari</b>
          </Step>
        </ol>
      );
    }
    case "android": {
      return (
        <ol className="flex flex-col gap-3">
          <Step number={1}>
            Otwórz menu
            <InlineIcon>
              <EllipsisVertical aria-hidden />
            </InlineIcon>
            w rogu przeglądarki
          </Step>
          <Step number={2}>
            Wybierz <b>Zainstaluj aplikację</b> lub{" "}
            <b>Dodaj do ekranu głównego</b>
          </Step>
          <Step number={3}>
            Potwierdź przyciskiem <b>Zainstaluj</b>
          </Step>
        </ol>
      );
    }
    case "in-app-ios":
    case "in-app-android": {
      const browser = platform === "in-app-ios" ? "Safari" : "Chrome";
      return (
        <ol className="flex flex-col gap-3">
          <Step number={1}>
            Otwórz menu
            <InlineIcon>
              <EllipsisVertical aria-hidden />
            </InlineIcon>
            tej aplikacji
          </Step>
          <Step number={2}>
            Wybierz <b>Otwórz w przeglądarce</b> ({browser})
          </Step>
          <Step number={3}>Tam zainstalujesz aplikację wydarzenia</Step>
        </ol>
      );
    }
  }
}

/**
 * Bottom sheet explaining how to add the event app to the home screen, with
 * steps matched to the visitor's phone and browser. Never shown inside the
 * installed app or on desktop.
 */
export function MobileInstallPrompt() {
  const { eventSlug, config } = useMobile();
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      // Keep Chrome's own mini-infobar away; the sheet offers the button instead
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setPlatform(null);
    };
    globalThis.addEventListener("beforeinstallprompt", onBeforeInstall);
    globalThis.addEventListener("appinstalled", onInstalled);

    const timer = globalThis.setTimeout(() => {
      if (isStandalone() || wasRecentlyDismissed(eventSlug)) {
        return;
      }
      setPlatform(detectPlatform());
    }, SHOW_DELAY_MS);

    return () => {
      globalThis.clearTimeout(timer);
      globalThis.removeEventListener("beforeinstallprompt", onBeforeInstall);
      globalThis.removeEventListener("appinstalled", onInstalled);
    };
  }, [eventSlug]);

  if (platform === null) {
    return null;
  }

  const dismiss = () => {
    try {
      localStorage.setItem(dismissedKey(eventSlug), Date.now().toString());
    } catch {
      // Private mode: the prompt simply comes back on the next visit
    }
    setPlatform(null);
  };

  const install = async () => {
    if (installEvent === null) {
      return;
    }
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    setInstallEvent(null);
    if (choice.outcome === "accepted") {
      setPlatform(null);
    }
  };

  const canInstallDirectly = platform === "android" && installEvent !== null;

  return (
    <div
      role="dialog"
      aria-labelledby="mobile-install-title"
      className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md px-3 pb-[calc(env(safe-area-inset-bottom)+12px)]"
    >
      <div className="rounded-[32px] border border-[#E7E7E7] bg-[#F8F8F8] p-5 shadow-[0_-8px_40px_rgba(0,0,0,0.16)]">
        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/mobile/icon-192.png"
            alt=""
            className="size-12 shrink-0 rounded-2xl"
          />
          <div className="min-w-0 flex-1">
            <h2
              id="mobile-install-title"
              className="text-base leading-5 font-bold"
            >
              Zainstaluj aplikację
            </h2>
            <p className="mt-1 text-sm leading-5 font-medium text-[#6F6F6F]">
              Dodaj „{config.event.name}” do ekranu głównego — będzie zawsze pod
              ręką.
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Zamknij"
            className="-mt-1 -mr-1 flex size-9 shrink-0 items-center justify-center rounded-full text-[#6F6F6F] active:bg-[#E7E7E7]"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        {canInstallDirectly ? (
          <button
            type="button"
            onClick={() => {
              void install();
            }}
            className="mt-4 flex h-[60px] w-full items-center justify-center gap-2 rounded-3xl bg-[#121212] text-base font-semibold tracking-[0.01em] text-white active:opacity-90"
          >
            <Download className="size-5" aria-hidden />
            Zainstaluj
          </button>
        ) : (
          <div className="mt-4">
            <Steps platform={platform} />
          </div>
        )}

        <button
          type="button"
          onClick={dismiss}
          className="mt-3 h-11 w-full rounded-3xl text-sm font-semibold text-[#6F6F6F] active:bg-[#E7E7E7]"
        >
          Nie teraz
        </button>
      </div>
    </div>
  );
}
