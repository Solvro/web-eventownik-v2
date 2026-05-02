"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { useEffect, useState } from "react";
import sanitizeHtml from "sanitize-html";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const ALERTS_ENDPOINT =
  process.env.NEXT_PUBLIC_SOLVRO_ALERTS_ENDPOINT ??
  "https://alerts.solvro.pl/api/v1/alerts/";
const DISMISSED_STORAGE_KEY = "solvro-alerts-dismissed";
const APP_CODE = process.env.NEXT_PUBLIC_SOLVRO_ALERTS_APP_CODE ?? "eventownik";

type AlertType = "info" | "warning" | "critical";

interface AlertItem {
  id: string;
  title: string;
  content: string;
  alert_type: AlertType;
  link: string;
  open_in_new_tab: boolean;
  is_global: boolean;
  is_dismissable: boolean;
  start_at: string | null;
  end_at: string | null;
}

const ICONS: Record<AlertType, typeof Info> = {
  info: Info,
  warning: AlertTriangle,
  critical: AlertCircle,
};

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "a",
    "b",
    "blockquote",
    "br",
    "code",
    "del",
    "div",
    "em",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hr",
    "i",
    "li",
    "ol",
    "p",
    "pre",
    "s",
    "span",
    "strong",
    "sub",
    "sup",
    "u",
    "ul",
  ],
  allowedAttributes: {
    a: ["href", "title", "target"],
  },
  allowedSchemes: ["http", "https", "mailto"],
};

function readDismissed(): Set<string> {
  if (typeof window === "undefined") {
    return new Set();
  }
  try {
    const raw = window.localStorage.getItem(DISMISSED_STORAGE_KEY);
    if (raw === null) {
      return new Set();
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return new Set();
    }
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

function writeDismissed(ids: Set<string>) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(
      DISMISSED_STORAGE_KEY,
      JSON.stringify([...ids]),
    );
  } catch {
    // ignore storage errors (private mode, quota, etc.)
  }
}

async function fetchAlerts(appCode: string): Promise<AlertItem[]> {
  const url = new URL(ALERTS_ENDPOINT);
  url.searchParams.set("app", appCode);
  const response = await fetch(url.toString());
  if (response.status === 400) {
    throw new Error(
      `Alerts: unknown app code "${appCode}". Check NEXT_PUBLIC_SOLVRO_ALERTS_APP_CODE.`,
    );
  }
  if (!response.ok) {
    throw new Error(`Alerts: request failed (${String(response.status)})`);
  }
  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    return [];
  }
  return data as AlertItem[];
}

function AlertBanner({
  alert,
  onDismiss,
}: {
  alert: AlertItem;
  onDismiss: (id: string) => void;
}) {
  const Icon = ICONS[alert.alert_type];
  const sanitized = sanitizeHtml(alert.content, SANITIZE_OPTIONS);
  const hasLink = alert.link !== "";

  return (
    <Alert variant={alert.alert_type} className="shadow-sm">
      {hasLink ? (
        <a
          href={alert.link}
          target={alert.open_in_new_tab ? "_blank" : undefined}
          rel={alert.open_in_new_tab ? "noopener noreferrer" : undefined}
          aria-label={alert.title === "" ? "Alert link" : alert.title}
          className="absolute inset-0 rounded-lg focus:ring-2 focus:ring-current focus:outline-none"
        />
      ) : null}
      <Icon aria-hidden="true" />
      {alert.title === "" ? null : <AlertTitle>{alert.title}</AlertTitle>}
      <AlertDescription className="prose prose-sm dark:prose-invert max-w-none wrap-break-word">
        <div
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: sanitized }}
        />
      </AlertDescription>
      {alert.is_dismissable ? (
        <button
          type="button"
          onClick={() => {
            onDismiss(alert.id);
          }}
          aria-label="Dismiss alert"
          className="absolute top-2 right-2 rounded p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100 focus:ring-2 focus:ring-current focus:outline-none dark:hover:bg-white/10"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      ) : null}
    </Alert>
  );
}

export function Alerts({ className }: { className?: string } = {}) {
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-you-might-not-need-an-effect/no-initialize-state
    setDismissed(readDismissed());
    // eslint-disable-next-line react-you-might-not-need-an-effect/no-initialize-state
    setHydrated(true);
  }, []);

  const { data, error } = useQuery({
    queryKey: ["alerts", APP_CODE],
    queryFn: async () => fetchAlerts(APP_CODE),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  if (error !== null) {
    console.error(error);
    return null;
  }

  if (!hydrated || data == null || data.length === 0) {
    return null;
  }

  const visible = data.filter((alert) => !dismissed.has(alert.id));
  if (visible.length === 0) {
    return null;
  }

  const handleDismiss = (id: string) => {
    setDismissed((previous) => {
      const next = new Set(previous);
      next.add(id);
      writeDismissed(next);
      return next;
    });
  };

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      {visible.map((alert) => (
        <AlertBanner key={alert.id} alert={alert} onDismiss={handleDismiss} />
      ))}
    </div>
  );
}
