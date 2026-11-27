"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { QRCode } from "react-qr-code";

import { useMobile } from "./mobile-context";

/** A real mouse-and-keyboard screen that is too wide for a phone layout */
const DESKTOP_QUERY =
  "(min-width: 768px) and (hover: hover) and (pointer: fine)";

/** Logical size of the phone screen, matching the design frames */
const SCREEN_WIDTH = 402;
const SCREEN_HEIGHT = 874;
const STATUS_BAR_HEIGHT = 54;
/** Black bezel plus the metal band around it */
const BEZEL = 14;
const DEVICE_HEIGHT = SCREEN_HEIGHT + BEZEL * 2;

function subscribeToDesktop(onChange: () => void) {
  const media = globalThis.matchMedia(DESKTOP_QUERY);
  media.addEventListener("change", onChange);
  return () => {
    media.removeEventListener("change", onChange);
  };
}

function useIsDesktop(): boolean {
  return useSyncExternalStore(
    subscribeToDesktop,
    () => globalThis.matchMedia(DESKTOP_QUERY).matches,
    // On the server the device is unknown; phones are the common case
    () => false,
  );
}

function subscribeToNothing() {
  return () => {
    // The embedding never changes during a page's lifetime
  };
}

/** True when this page runs inside the phone frame's iframe */
function useIsFramed(): boolean {
  return useSyncExternalStore(
    subscribeToNothing,
    () => globalThis.self !== globalThis.top,
    () => false,
  );
}

function subscribeToResize(onChange: () => void) {
  globalThis.addEventListener("resize", onChange);
  return () => {
    globalThis.removeEventListener("resize", onChange);
  };
}

/** Shrinks the phone so it always fits the window height */
function useDeviceScale(): number {
  return useSyncExternalStore(
    subscribeToResize,
    () =>
      Math.min(
        1,
        Math.round(((globalThis.innerHeight - 48) / DEVICE_HEIGHT) * 100) / 100,
      ),
    () => 1,
  );
}

function StatusBar() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString("pl-PL", {
          hour: "numeric",
          minute: "2-digit",
        }),
      );
    };
    update();
    const interval = globalThis.setInterval(update, 15_000);
    return () => {
      globalThis.clearInterval(interval);
    };
  }, []);

  return (
    <div
      className="bg-background text-foreground relative flex items-center justify-between px-9 text-[16px] font-semibold"
      style={{ height: STATUS_BAR_HEIGHT }}
      aria-hidden
    >
      <span className="w-14 text-center tabular-nums">{time}</span>
      {/* Dynamic Island */}
      <span className="absolute top-[13px] left-1/2 h-[33px] w-[112px] -translate-x-1/2 rounded-full bg-black" />
      <span className="flex w-16 items-center justify-end gap-1.5">
        {/* Signal */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        {/* Battery */}
        <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
          <rect
            x="0.5"
            y="0.5"
            width="23"
            height="12"
            rx="3.8"
            stroke="currentColor"
            opacity="0.4"
          />
          <rect
            x="2"
            y="2"
            width="20"
            height="9"
            rx="2.5"
            fill="currentColor"
          />
          <rect
            x="25"
            y="4.2"
            width="1.6"
            height="4.6"
            rx="0.8"
            fill="currentColor"
            opacity="0.45"
          />
        </svg>
      </span>
    </div>
  );
}

function SideButton({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`absolute w-[4px] rounded-[2px] bg-gradient-to-r from-[#6f6f73] via-[#b9b9bd] to-[#7d7d81] ${className}`}
    />
  );
}

function PhoneFrame() {
  const { config } = useMobile();
  // Read when the frame appears. The iframe keeps the outer address in step
  // with its own navigation, so a frame that is shown again after the window
  // was narrowed reopens on the page the visitor was on, not the first one.
  const source = useMemo(() => globalThis.location.href, []);
  const scale = useDeviceScale();

  return (
    <div className="bg-secondary text-foreground flex min-h-dvh items-center justify-center gap-16 overflow-hidden px-8">
      <div className="hidden max-w-xs flex-col gap-5 lg:flex">
        <p className="text-muted-foreground text-sm font-semibold tracking-[0.08em] uppercase">
          Eventownik
        </p>
        <h1 className="text-4xl leading-[1.1] font-extrabold">
          {config.event.name}
        </h1>
        <p className="text-muted-foreground text-base leading-6 font-medium">
          Aplikacja wydarzenia działa najlepiej na telefonie. Zeskanuj kod, żeby
          otworzyć ją u siebie, albo korzystaj z podglądu obok.
        </p>
        <div className="w-fit rounded-3xl bg-white p-4">
          <QRCode value={source} size={148} level="M" />
        </div>
      </div>

      <div
        className="relative shrink-0"
        style={{
          width: (SCREEN_WIDTH + BEZEL * 2) * scale,
          height: DEVICE_HEIGHT * scale,
        }}
      >
        <div
          className="absolute top-0 left-0 origin-top-left"
          style={{
            width: SCREEN_WIDTH + BEZEL * 2,
            height: DEVICE_HEIGHT,
            transform: `scale(${scale.toString()})`,
          }}
        >
          {/* Action button, volume up, volume down, side button, camera control */}
          <SideButton className="top-[128px] -left-[3px] h-[34px]" />
          <SideButton className="top-[196px] -left-[3px] h-[62px]" />
          <SideButton className="top-[272px] -left-[3px] h-[62px]" />
          <SideButton className="top-[224px] -right-[3px] h-[102px]" />
          <SideButton className="top-[560px] -right-[3px] h-[46px]" />

          {/* Titanium band */}
          <div className="absolute inset-0 rounded-[68px] bg-gradient-to-br from-[#c9c9cd] via-[#8b8b90] to-[#b4b4b8] shadow-[0_40px_90px_rgba(0,0,0,0.35),0_8px_24px_rgba(0,0,0,0.2)]" />
          {/* Black bezel */}
          <div className="absolute inset-[3px] rounded-[65px] bg-black" />

          <div
            className="bg-background absolute overflow-hidden rounded-[54px]"
            style={{
              top: BEZEL,
              left: BEZEL,
              width: SCREEN_WIDTH,
              height: SCREEN_HEIGHT,
            }}
          >
            <StatusBar />
            <iframe
              src={source}
              title={config.event.name}
              className="block w-full border-0"
              style={{ height: SCREEN_HEIGHT - STATUS_BAR_HEIGHT }}
              allow="camera; clipboard-write"
            />
            {/* Home indicator */}
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-2 left-1/2 h-[5px] w-[139px] -translate-x-1/2 rounded-full bg-black/85 mix-blend-difference invert"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Keeps the address bar of the outer page in step with navigation inside the phone */
function useSyncUrlToParent(isFramed: boolean) {
  const pathname = usePathname();

  useEffect(() => {
    if (!isFramed) {
      return;
    }
    try {
      globalThis.parent.history.replaceState(
        null,
        "",
        `${pathname}${globalThis.location.search}`,
      );
    } catch {
      // Embedded by another origin: nothing to keep in sync
    }
  }, [isFramed, pathname]);
}

/**
 * On a desktop browser the participant app is shown inside a phone frame, as an
 * iframe of the same page, so every screen behaves exactly as on a phone. On
 * phones, and inside that iframe, the app renders directly.
 */
export function MobileDesktopFrame({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  const isDesktop = useIsDesktop();
  const isFramed = useIsFramed();
  useSyncUrlToParent(isFramed);

  if (isDesktop && !isFramed) {
    return <PhoneFrame />;
  }
  return children;
}
