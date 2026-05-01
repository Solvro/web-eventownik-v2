"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { useEffect, useState } from "react";
import sanitizeHtml from "sanitize-html";

import { cn } from "@/lib/utils";

const SOLVRO_ALERTS_ENDPOINT = "https://alerts.solvro.pl/api/v1/alerts/";
const DISMISSED_STORAGE_KEY = "solvro-alerts-dismissed";
const DEFAULT_APP_CODE =
  process.env.NEXT_PUBLIC_SOLVRO_ALERTS_APP_CODE ?? "eventownik";

type SolvroAlertType = "info" | "warning" | "critical";

interface SolvroAlert {
  id: string;
  title: string;
  content: string;
  alert_type: SolvroAlertType;
  link: string;
  is_global: boolean;
  is_dismissable: boolean;
  start_at: string | null;
  end_at: string | null;
}

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "a",
    "b",
    "em",
    "i",
    "strong",
    "u",
    "p",
    "br",
    "ul",
    "ol",
    "li",
    "h2",
    "h3",
    "h4",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
  },
  allowedSchemes: ["http", "https", "mailto"],
};

const VARIANT_STYLES: Record<
  SolvroAlertType,
  { container: string; icon: typeof Info; iconClass: string }
> = {
  info: {
    container:
      "border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-100",
    icon: Info,
    iconClass: "text-blue-600 dark:text-blue-300",
  },
  warning: {
    container:
      "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100",
    icon: AlertTriangle,
    iconClass: "text-amber-600 dark:text-amber-300",
  },
  critical: {
    container:
      "border-red-300 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100",
    icon: AlertCircle,
    iconClass: "text-red-600 dark:text-red-300",
  },
};

function readDismissed(): Set<string> {
  if (typeof window === "undefined") {
    return new Set();
  }
  try {
    const raw = window.localStorage.getItem(DISMISSED_STORAGE_KEY);
    if (raw == null) {
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

async function fetchSolvroAlerts(appCode: string): Promise<SolvroAlert[]> {
  const url = new URL(SOLVRO_ALERTS_ENDPOINT);
  url.searchParams.set("app", appCode);
  const response = await fetch(url.toString());
  if (response.status === 400) {
    throw new Error(
      `Solvro Alerts: unknown app code "${appCode}". Check NEXT_PUBLIC_SOLVRO_ALERTS_APP_CODE.`,
    );
  }
  if (!response.ok) {
    throw new Error(
      `Solvro Alerts: request failed (${String(response.status)})`,
    );
  }
  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    return [];
  }
  return data as SolvroAlert[];
}

function isExternalLink(link: string) {
  return /^https?:\/\//i.test(link);
}

function SolvroAlertBanner({
  alert,
  onDismiss,
}: {
  alert: SolvroAlert;
  onDismiss: (id: string) => void;
}) {
  const variant = VARIANT_STYLES[alert.alert_type];
  const Icon = variant.icon;
  const sanitized = sanitizeHtml(alert.content, SANITIZE_OPTIONS);
  const hasLink = alert.link !== "";
  const external = hasLink && isExternalLink(alert.link);

  return (
    <div
      className={cn(
        "relative flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-sm",
        variant.container,
      )}
      role="alert"
    >
      {hasLink ? (
        <a
          href={alert.link}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          aria-label={alert.title === "" ? "Alert link" : alert.title}
          className="absolute inset-0 rounded-lg focus:ring-2 focus:ring-current focus:outline-none"
        />
      ) : null}
      <Icon
        className={cn("mt-0.5 size-5 shrink-0", variant.iconClass)}
        aria-hidden="true"
      />
      <div className="pointer-events-none relative min-w-0 flex-1">
        {alert.title === "" ? null : (
          <div className="font-semibold">{alert.title}</div>
        )}
        <div
          className="solvro-alerts-content [&_a]:underline [&_a]:underline-offset-2"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: sanitized }}
        />
      </div>
      {alert.is_dismissable ? (
        <button
          type="button"
          onClick={() => {
            onDismiss(alert.id);
          }}
          aria-label="Dismiss alert"
          className="relative -mr-1 rounded p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100 focus:ring-2 focus:ring-current focus:outline-none dark:hover:bg-white/10"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

export function SolvroAlerts({ appCode }: { appCode?: string } = {}) {
  const code = appCode ?? DEFAULT_APP_CODE;
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDismissed(readDismissed());
    setHydrated(true);
  }, []);

  const { data } = useQuery({
    queryKey: ["solvro-alerts", code],
    queryFn: async () => fetchSolvroAlerts(code),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

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
    <div className="flex w-full flex-col gap-2" data-slot="solvro-alerts">
      {visible.map((alert) => (
        <SolvroAlertBanner
          key={alert.id}
          alert={alert}
          onDismiss={handleDismiss}
        />
      ))}
    </div>
  );
}
