"use client";

import Script from "next/script";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const TURNSTILE_SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileRenderOptions {
  sitekey: string;
  execution: "render" | "execute";
  appearance: "always" | "execute" | "interaction-only";
  language?: string;
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": (code: string) => void;
  "before-interactive-callback": () => void;
  "after-interactive-callback": () => void;
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  execute: (widgetId: string) => void;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export interface TurnstileHandle {
  /** Starts the challenge; the token arrives through `onVerify`. */
  execute: () => void;
  /** Tokens are single-use: reset after every submission attempt. */
  reset: () => void;
}

interface TurnstileProps {
  sitekey: string;
  language?: string;
  onLoad: () => void;
  onVerify: (token: string) => void;
  onExpire: () => void;
  onError: (code: string) => void;
  /** An interactive challenge became visible. */
  onOpen: () => void;
  /** The interactive challenge was completed and hidden again. */
  onClose: () => void;
}

/**
 * Cloudflare Turnstile in "execute on demand" mode: no work happens until
 * `execute()`, and the widget is only shown when the user must interact.
 */
export const Turnstile = forwardRef<TurnstileHandle, TurnstileProps>(
  (props, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    // Latest callbacks without re-rendering the widget on every parent render.
    const callbacksRef = useRef(props);
    useEffect(() => {
      callbacksRef.current = props;
    });
    const { sitekey, language } = props;

    useImperativeHandle(ref, () => ({
      execute: () => {
        if (window.turnstile === undefined || widgetIdRef.current === null) {
          throw new Error("Turnstile is not ready");
        }
        window.turnstile.execute(widgetIdRef.current);
      },
      reset: () => {
        if (window.turnstile !== undefined && widgetIdRef.current !== null) {
          window.turnstile.reset(widgetIdRef.current);
        }
      },
    }));

    function renderWidget() {
      const api = window.turnstile;
      if (
        api === undefined ||
        containerRef.current === null ||
        widgetIdRef.current !== null
      ) {
        return;
      }
      try {
        widgetIdRef.current = api.render(containerRef.current, {
          sitekey,
          language,
          execution: "execute",
          appearance: "interaction-only",
          callback: (token) => {
            callbacksRef.current.onVerify(token);
          },
          "expired-callback": () => {
            callbacksRef.current.onExpire();
          },
          "error-callback": (code) => {
            callbacksRef.current.onError(code);
          },
          "before-interactive-callback": () => {
            callbacksRef.current.onOpen();
          },
          "after-interactive-callback": () => {
            callbacksRef.current.onClose();
          },
        });
      } catch (error) {
        // `render` throws synchronously for invalid configuration (e.g. a bad
        // site key); report it so the form shows its CAPTCHA error state.
        widgetIdRef.current = null;
        console.error("Turnstile failed to initialize", error);
        callbacksRef.current.onError("render-failed");
        return;
      }
      callbacksRef.current.onLoad();
    }

    useEffect(() => {
      // The script may already be loaded by an earlier mount.
      renderWidget();
      return () => {
        if (window.turnstile !== undefined && widgetIdRef.current !== null) {
          window.turnstile.remove(widgetIdRef.current);
        }
        widgetIdRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sitekey, language]);

    return (
      <>
        <Script
          src={TURNSTILE_SCRIPT_URL}
          strategy="afterInteractive"
          onReady={renderWidget}
          onError={() => {
            callbacksRef.current.onError("script-load-failed");
          }}
        />
        <div ref={containerRef} className="flex justify-center" />
      </>
    );
  },
);
Turnstile.displayName = "Turnstile";
