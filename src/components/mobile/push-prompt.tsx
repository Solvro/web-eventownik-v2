"use client";

import { BellRing, X } from "lucide-react";
import { useEffect, useState } from "react";

import { useMobile } from "./mobile-context";
import { useMobilePush } from "./use-push";

function dismissedKey(eventSlug: string): string {
  return `mobile-push-dismissed-${eventSlug}`;
}

function readDismissed(eventSlug: string): boolean {
  try {
    return localStorage.getItem(dismissedKey(eventSlug)) !== null;
  } catch {
    return false;
  }
}

/**
 * Card on Home offering push notifications. Shown only while the browser can
 * ask (permission "default"), the device has no subscription and the
 * participant has not dismissed it. iPhone/iPad tabs get nothing here: push
 * works there only in the installed app, which the install prompt covers.
 */
export function MobilePushPrompt() {
  const { eventSlug } = useMobile();
  const push = useMobilePush(eventSlug);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(readDismissed(eventSlug));
  }, [eventSlug]);

  const { device } = push;
  if (
    !push.ready ||
    !push.serverEnabled ||
    dismissed ||
    device?.support !== "supported" ||
    device.permission !== "default" ||
    device.subscribed
  ) {
    return null;
  }

  const dismiss = () => {
    try {
      localStorage.setItem(dismissedKey(eventSlug), Date.now().toString());
    } catch {
      // Private mode: the card comes back on the next visit
    }
    setDismissed(true);
  };

  return (
    <section
      aria-labelledby="mobile-push-title"
      className="bg-card flex flex-col gap-4 rounded-[32px] p-6"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--mobile-accent)] text-[var(--mobile-accent-foreground)]">
          <BellRing className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2
            id="mobile-push-title"
            className="text-foreground text-base leading-5 font-bold"
          >
            Włącz powiadomienia
          </h2>
          <p className="text-muted-foreground mt-1 text-sm leading-5 font-medium">
            Dostaniesz powiadomienie o ogłoszeniach, rundach BeerReal, matchach
            i wiadomościach.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Nie teraz"
          className="text-muted-foreground active:bg-border -mt-1 -mr-1 flex size-9 shrink-0 items-center justify-center rounded-full"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>
      {push.error ? (
        <p className="text-muted-foreground text-sm font-medium">
          Nie udało się włączyć powiadomień. Spróbuj ponownie.
        </p>
      ) : null}
      <button
        type="button"
        disabled={push.busy}
        onClick={() => {
          void push.enable();
        }}
        className="bg-primary text-primary-foreground flex h-12 w-full items-center justify-center rounded-3xl text-base font-semibold tracking-[0.01em] transition active:scale-[0.98] disabled:opacity-60"
      >
        {push.busy ? "Włączanie…" : "Włącz powiadomienia"}
      </button>
    </section>
  );
}

/** "Powiadomienia" row of the Profil screen: a per-device switch */
export function MobilePushSetting() {
  const { eventSlug } = useMobile();
  const push = useMobilePush(eventSlug);
  const { device } = push;

  if (!push.ready || !push.serverEnabled || device === null) {
    return null;
  }

  let note: string | null = null;
  if (device.support === "ios-needs-install") {
    note = "Dodaj aplikację do ekranu głównego, aby włączyć powiadomienia.";
  } else if (device.support === "unsupported") {
    note = "Ta przeglądarka nie obsługuje powiadomień.";
  } else if (device.permission === "denied") {
    note = "Powiadomienia są zablokowane w ustawieniach przeglądarki.";
  }

  const checked = device.subscribed && device.permission === "granted";

  return (
    <div className="bg-card flex flex-col gap-2 rounded-3xl p-5">
      <div className="flex items-center gap-3">
        <span id="mobile-push-label" className="flex-1 text-base font-semibold">
          Powiadomienia
        </span>
        {note === null ? (
          <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-labelledby="mobile-push-label"
            disabled={push.busy}
            onClick={() => {
              void (checked ? push.disable() : push.enable());
            }}
            className={
              checked
                ? "relative h-8 w-[52px] shrink-0 rounded-full bg-[var(--mobile-accent)] transition focus-visible:ring-2 focus-visible:ring-[var(--mobile-accent)] focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
                : "bg-secondary border-border relative h-8 w-[52px] shrink-0 rounded-full border transition focus-visible:ring-2 focus-visible:ring-[var(--mobile-accent)] focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
            }
          >
            <span
              aria-hidden
              className={
                checked
                  ? "absolute top-1 left-[24px] size-6 rounded-full bg-[var(--mobile-accent-foreground)] transition-all"
                  : "bg-muted-foreground absolute top-[3px] left-[3px] size-6 rounded-full transition-all"
              }
            />
          </button>
        ) : null}
      </div>
      <p className="text-muted-foreground text-sm leading-5 font-medium">
        {note ??
          (push.error
            ? "Nie udało się zmienić ustawienia. Spróbuj ponownie."
            : "Ogłoszenia, rundy BeerReal, matche i wiadomości na tym urządzeniu.")}
      </p>
    </div>
  );
}
