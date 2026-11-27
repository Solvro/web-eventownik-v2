"use client";

import { Copy, Reply } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type { MobileChatReplyTo } from "@/types/mobile";

/** Distance past which letting go of a swipe starts a reply, in px */
const REPLY_AT = 56;
/** The message never travels further than this */
const MAX_OFFSET = 80;
/** Movement below this is still a press, not a drag */
const SLOP = 8;
/** Holding this long opens the message menu */
const HOLD_MS = 450;

function buzz() {
  try {
    navigator.vibrate(10);
  } catch {
    // No vibration on iOS and in desktop browsers
  }
}

interface Gesture {
  /** Touch identifier, or -1 for the mouse */
  id: number;
  startX: number;
  startY: number;
  mode: "pending" | "swipe" | "scroll";
  timer: ReturnType<typeof setTimeout> | undefined;
  passedThreshold: boolean;
}

/**
 * Swipe a message to the right to reply to it, or hold it (right-click on a
 * computer) to open its menu. Vertical movement is left to the list's scroll.
 *
 * Touch goes through native touch listeners, not pointer events: only a
 * non-passive touchmove can stop the browser from turning a slightly diagonal
 * swipe into a scroll, which would otherwise cancel the swipe halfway (iOS).
 */
export function MessageGestures({
  onReply,
  onMenu,
  children,
}: {
  onReply: () => void;
  onMenu: () => void;
  children: React.ReactNode;
}) {
  const [offset, setOffset] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<Gesture | null>(null);
  /** Swallows the click that follows a hold or a swipe */
  const suppressClick = useRef(false);
  // The native listeners are attached once; they read the latest callbacks here
  const callbacks = useRef({ onReply, onMenu });
  useEffect(() => {
    callbacks.current = { onReply, onMenu };
  });

  useEffect(() => {
    const root = rootRef.current;
    if (root === null) {
      return;
    }

    const start = (id: number, x: number, y: number) => {
      globalThis.clearTimeout(gesture.current?.timer);
      suppressClick.current = false;
      const timer = globalThis.setTimeout(() => {
        if (gesture.current?.mode === "pending") {
          gesture.current = null;
          suppressClick.current = true;
          buzz();
          callbacks.current.onMenu();
        }
      }, HOLD_MS);
      gesture.current = {
        id,
        startX: x,
        startY: y,
        mode: "pending",
        timer,
        passedThreshold: false,
      };
    };

    /** Returns true when the movement belongs to the swipe, not the page */
    const move = (id: number, x: number, y: number): boolean => {
      const current = gesture.current;
      if (current?.id !== id) {
        return false;
      }
      const dx = x - current.startX;
      const dy = y - current.startY;
      if (current.mode === "pending") {
        const horizontal = dx > 0 && Math.abs(dx) > Math.abs(dy);
        if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) {
          // Too early to tell; keep the browser from starting a scroll
          // while the finger is heading sideways
          return horizontal;
        }
        globalThis.clearTimeout(current.timer);
        if (horizontal) {
          current.mode = "swipe";
        } else {
          current.mode = "scroll";
          return false;
        }
      }
      if (current.mode !== "swipe") {
        return false;
      }
      // Follows the finger at first, then resists towards the end
      const travel = Math.max(0, dx - SLOP);
      const next = Math.min(
        MAX_OFFSET,
        travel < REPLY_AT ? travel : REPLY_AT + (travel - REPLY_AT) * 0.3,
      );
      if (next >= REPLY_AT && !current.passedThreshold) {
        current.passedThreshold = true;
        buzz();
      } else if (next < REPLY_AT) {
        current.passedThreshold = false;
      }
      setOffset(next);
      return true;
    };

    const end = (commit: boolean) => {
      const current = gesture.current;
      if (current === null) {
        return;
      }
      globalThis.clearTimeout(current.timer);
      gesture.current = null;
      if (current.mode === "swipe") {
        suppressClick.current = true;
        if (commit && current.passedThreshold) {
          callbacks.current.onReply();
        }
      }
      setOffset(0);
    };

    const findTouch = (event: TouchEvent): Touch | undefined => {
      const id = gesture.current?.id;
      return [...event.changedTouches].find((touch) => touch.identifier === id);
    };

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        end(false);
        return;
      }
      const touch = event.touches[0];
      start(touch.identifier, touch.clientX, touch.clientY);
    };
    const onTouchMove = (event: TouchEvent) => {
      const touch = findTouch(event);
      if (
        touch !== undefined &&
        move(touch.identifier, touch.clientX, touch.clientY) &&
        event.cancelable
      ) {
        event.preventDefault();
      }
    };
    const onTouchEnd = (event: TouchEvent) => {
      if (findTouch(event) !== undefined) {
        end(event.type === "touchend");
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button === 0) {
        start(-1, event.clientX, event.clientY);
      }
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && gesture.current?.id === -1) {
        move(-1, event.clientX, event.clientY);
      }
    };
    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && gesture.current?.id === -1) {
        end(event.type === "pointerup");
      }
    };

    root.addEventListener("touchstart", onTouchStart, { passive: true });
    root.addEventListener("touchmove", onTouchMove, { passive: false });
    root.addEventListener("touchend", onTouchEnd);
    root.addEventListener("touchcancel", onTouchEnd);
    root.addEventListener("pointerdown", onPointerDown);
    // The mouse may leave the message while dragging
    globalThis.addEventListener("pointermove", onPointerMove);
    globalThis.addEventListener("pointerup", onPointerUp);
    globalThis.addEventListener("pointercancel", onPointerUp);
    return () => {
      globalThis.clearTimeout(gesture.current?.timer);
      root.removeEventListener("touchstart", onTouchStart);
      root.removeEventListener("touchmove", onTouchMove);
      root.removeEventListener("touchend", onTouchEnd);
      root.removeEventListener("touchcancel", onTouchEnd);
      root.removeEventListener("pointerdown", onPointerDown);
      globalThis.removeEventListener("pointermove", onPointerMove);
      globalThis.removeEventListener("pointerup", onPointerUp);
      globalThis.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative touch-pan-y select-none [-webkit-touch-callout:none]"
      onContextMenu={(event) => {
        // Right-click, and the long press of Android browsers
        event.preventDefault();
        globalThis.clearTimeout(gesture.current?.timer);
        gesture.current = null;
        setOffset(0);
        onMenu();
      }}
      onClickCapture={(event) => {
        if (suppressClick.current) {
          suppressClick.current = false;
          event.stopPropagation();
          event.preventDefault();
        }
      }}
    >
      <span
        aria-hidden
        className="bg-secondary text-foreground absolute top-1/2 left-0 flex size-8 items-center justify-center rounded-full"
        style={{
          opacity: Math.min(1, offset / REPLY_AT),
          transform: `translate(${String(offset / 2 - 32)}px, -50%) scale(${String(offset >= REPLY_AT ? 1.1 : 0.6 + (0.4 * offset) / REPLY_AT)})`,
        }}
      >
        <Reply className="size-4" />
      </span>
      <div
        className={cn(offset === 0 && "transition-transform duration-200")}
        style={{ transform: `translateX(${String(offset)}px)` }}
      >
        {children}
      </div>
    </div>
  );
}

/** The quoted message at the top of a reply */
export function ReplyQuote({
  replyTo,
  onMine,
  onPress,
}: {
  replyTo: MobileChatReplyTo;
  /** True inside the sender's own (accent coloured) bubble */
  onMine: boolean;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={cn(
        "mb-1.5 flex w-full gap-2 rounded-2xl py-2 pr-3 pl-2 text-left",
        onMine ? "bg-black/15" : "bg-secondary",
      )}
    >
      {/* A separate bar, not a left border: a border bends with the corners */}
      <span
        aria-hidden
        className={cn(
          "w-[3px] shrink-0 self-stretch rounded-full",
          onMine
            ? "bg-[var(--mobile-accent-foreground)]/70"
            : "bg-[var(--mobile-accent)]",
        )}
      />
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block truncate text-xs font-bold",
            onMine ? "" : "text-[var(--mobile-accent)]",
          )}
        >
          {replyTo.isMine ? "Ty" : replyTo.senderName}
        </span>
        <span
          className={cn(
            "line-clamp-2 text-sm leading-5 font-medium break-words",
            onMine ? "opacity-80" : "text-muted-foreground",
            replyTo.body === null && "italic",
          )}
        >
          {replyTo.body ?? "Wiadomość została usunięta"}
        </span>
      </span>
    </button>
  );
}

/** Bottom sheet opened by holding a message */
export function MessageActionSheet({
  author,
  body,
  onReply,
  onClose,
}: {
  author: string;
  body: string;
  onReply: () => void;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  /**
   * The finger that held the message lifts after the sheet opened, and the
   * browser turns that into a click on whatever is under it now (the backdrop
   * or a button). Only clicks whose press started inside the sheet count.
   */
  const pressedInside = useRef(false);

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

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      globalThis.setTimeout(onClose, 600);
    } catch {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal
      aria-label={`Wiadomość od ${author}`}
      className="fixed inset-0 z-50 flex flex-col justify-end"
      onPointerDownCapture={() => {
        pressedInside.current = true;
      }}
      onClickCapture={(event) => {
        // detail 0: a click from the keyboard, always intended
        if (!pressedInside.current && event.detail !== 0) {
          event.stopPropagation();
          event.preventDefault();
        }
        pressedInside.current = false;
      }}
    >
      <button
        type="button"
        aria-label="Zamknij"
        onClick={onClose}
        className="animate-in fade-in absolute inset-0 bg-black/40"
      />
      <div className="bg-background animate-in slide-in-from-bottom relative mx-auto w-full max-w-md rounded-t-[32px] px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+1rem)] duration-200">
        <span
          aria-hidden
          className="bg-border mx-auto mb-4 block h-1.5 w-10 rounded-full"
        />
        <div className="bg-card mb-4 rounded-3xl px-4 py-3">
          <p className="text-muted-foreground text-xs font-semibold">
            {author}
          </p>
          <p className="line-clamp-4 text-base leading-6 font-medium break-words whitespace-pre-wrap">
            {body}
          </p>
        </div>
        <div className="bg-card flex flex-col overflow-hidden rounded-3xl">
          <button
            type="button"
            onClick={onReply}
            className="active:bg-secondary flex min-h-14 items-center gap-3 px-5 text-base font-semibold"
          >
            <Reply className="size-5" aria-hidden />
            Odpowiedz
          </button>
          <span className="bg-border mx-5 h-px" aria-hidden />
          <button
            type="button"
            onClick={() => void copy()}
            className="active:bg-secondary flex min-h-14 items-center gap-3 px-5 text-base font-semibold"
          >
            <Copy className="size-5" aria-hidden />
            {copied ? "Skopiowano!" : "Kopiuj tekst"}
          </button>
        </div>
      </div>
    </div>
  );
}
