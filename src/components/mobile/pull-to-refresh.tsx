"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ArrowDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { useMobile } from "./mobile-context";

/** How far the indicator travels at most, in px */
const MAX_PULL = 96;
/** Releasing past this distance starts a refresh */
const TRIGGER_AT = 64;
/** Finger travel is damped so the pull feels weighted */
const RESISTANCE = 0.5;
/** The spinner stays at least this long, so a fast refresh is still visible */
const MIN_REFRESH_MS = 600;

/**
 * True when the touch started somewhere a downward drag already means
 * something else: a scrolled inner list, a dialog, the camera, the chat, the
 * swipe deck. Those opt out with `data-no-pull-refresh`.
 */
function startsInsideOwnScroller(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }
  if (target.closest("[data-no-pull-refresh], [role='dialog']") !== null) {
    return true;
  }
  for (
    let element: Element | null = target;
    element !== null && element !== document.body;
    element = element.parentElement
  ) {
    if (element.scrollTop > 0) {
      return true;
    }
  }
  return false;
}

/**
 * Pull down at the top of a screen to reload its data. Installed iOS apps have
 * no built-in pull-to-refresh, and the browser's own one reloads the whole
 * page, so the app provides the gesture itself and refetches only its data.
 */
export function MobilePullToRefresh() {
  const { eventSlug } = useMobile();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [distance, setDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Gesture state lives in refs: it changes on every touch event
  const startY = useRef<number | null>(null);
  const distanceRef = useRef(0);
  const refreshingRef = useRef(false);

  useEffect(() => {
    const move = (value: number) => {
      distanceRef.current = value;
      setDistance(value);
    };

    const onTouchStart = (event: TouchEvent) => {
      if (
        refreshingRef.current ||
        event.touches.length !== 1 ||
        globalThis.scrollY > 0 ||
        startsInsideOwnScroller(event.target)
      ) {
        startY.current = null;
        return;
      }
      startY.current = event.touches[0].clientY;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (startY.current === null) {
        return;
      }
      const delta = event.touches[0].clientY - startY.current;
      if (delta <= 0 || globalThis.scrollY > 0) {
        // Scrolling the page normally: this is not a pull
        if (distanceRef.current !== 0) {
          move(0);
        }
        return;
      }
      // Stop the page from rubber-banding along with the indicator
      if (event.cancelable) {
        event.preventDefault();
      }
      setDragging(true);
      move(Math.min(MAX_PULL, delta * RESISTANCE));
    };

    const refresh = async () => {
      refreshingRef.current = true;
      setRefreshing(true);
      move(TRIGGER_AT);
      const startedAt = Date.now();
      try {
        // Every query of this app starts with ["mobile", eventSlug]
        await queryClient.invalidateQueries({
          queryKey: ["mobile", eventSlug],
        });
        // Server-rendered parts, such as the event's settings and colours
        router.refresh();
      } catch {
        // Each screen shows its own error state; nothing to add here
      }
      const remaining = MIN_REFRESH_MS - (Date.now() - startedAt);
      if (remaining > 0) {
        await new Promise((resolve) => {
          globalThis.setTimeout(resolve, remaining);
        });
      }
      refreshingRef.current = false;
      setRefreshing(false);
      move(0);
    };

    const onTouchEnd = () => {
      if (startY.current === null) {
        return;
      }
      startY.current = null;
      setDragging(false);
      if (distanceRef.current >= TRIGGER_AT) {
        void refresh();
      } else {
        move(0);
      }
    };

    // Not passive: the move handler has to cancel the browser's own overscroll
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("touchcancel", onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [eventSlug, queryClient, router]);

  const visible = distance > 0 || refreshing;
  const ready = distance >= TRIGGER_AT;

  return (
    <div
      aria-hidden={!visible}
      role="status"
      className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center pt-[env(safe-area-inset-top)]"
    >
      <div
        className={cn(
          "bg-background text-foreground border-border flex size-10 items-center justify-center rounded-full border shadow-[0_4px_16px_rgba(0,0,0,0.18)]",
          // Follow the finger exactly while dragging, ease back when released
          !dragging && "transition-[transform,opacity] duration-200",
        )}
        style={{
          opacity: visible ? Math.min(1, distance / (TRIGGER_AT / 2)) : 0,
          transform: `translateY(${String(distance - 48)}px)`,
        }}
      >
        {refreshing ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <ArrowDown
            className={cn(
              "size-5 transition-transform duration-150",
              ready && "rotate-180",
            )}
          />
        )}
        <span className="sr-only">
          {refreshing ? "Odświeżanie…" : "Pociągnij, aby odświeżyć"}
        </span>
      </div>
    </div>
  );
}
