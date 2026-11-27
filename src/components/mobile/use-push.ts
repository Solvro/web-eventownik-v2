"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

import { MobileApiError } from "@/lib/mobile/client";
import {
  disablePush,
  enablePush,
  fetchPushConfig,
  getExistingSubscription,
  getPushSupport,
  resyncSubscription,
} from "@/lib/mobile/push";
import type { PushSupport } from "@/lib/mobile/push";

interface PushDeviceState {
  support: PushSupport;
  permission: NotificationPermission | "unsupported";
  subscribed: boolean;
}

/** Web Push state of this device for the event, plus actions to toggle it */
/** A short reason to show next to "it failed", so a screenshot is enough to diagnose it */
function describeError(error: unknown): string | null {
  if (error instanceof MobileApiError) {
    return `błąd serwera ${error.status.toString()}`;
  }
  if (error instanceof Error) {
    return error.name === "Error" ? error.message.slice(0, 60) : error.name;
  }
  return null;
}

export function useMobilePush(eventSlug: string) {
  const config = useQuery({
    queryKey: ["mobile", eventSlug, "push"],
    queryFn: async () => fetchPushConfig(eventSlug),
    staleTime: 10 * 60_000,
    retry: false,
  });
  // Only known on the client, after mount
  const [device, setDevice] = useState<PushDeviceState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  /** What went wrong, short enough to show: "błąd 500", "NotAllowedError" */
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const support = getPushSupport();
    const permission =
      support === "supported" ? Notification.permission : "unsupported";
    const subscription = await getExistingSubscription(eventSlug).catch(
      () => null,
    );
    setDevice({ support, permission, subscribed: subscription !== null });
  }, [eventSlug]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const serverEnabled =
    config.data?.enabled === true && config.data.publicKey !== null;

  // Make sure the server still knows an existing subscription
  useEffect(() => {
    if (serverEnabled && device?.subscribed === true) {
      void resyncSubscription(eventSlug).catch(() => null);
    }
  }, [serverEnabled, device?.subscribed, eventSlug]);

  const enable = useCallback(async () => {
    const publicKey = config.data?.publicKey;
    if (publicKey === null || publicKey === undefined) {
      return;
    }
    setBusy(true);
    setError(false);
    setErrorDetail(null);
    try {
      await enablePush(eventSlug, publicKey);
    } catch (error_) {
      console.error("[push] enable failed", error_);
      setError(true);
      setErrorDetail(describeError(error_));
    } finally {
      await refresh();
      setBusy(false);
    }
  }, [config.data?.publicKey, eventSlug, refresh]);

  const disable = useCallback(async () => {
    setBusy(true);
    setError(false);
    setErrorDetail(null);
    try {
      await disablePush(eventSlug);
    } catch (error_) {
      console.error("[push] disable failed", error_);
      setError(true);
      setErrorDetail(describeError(error_));
    } finally {
      await refresh();
      setBusy(false);
    }
  }, [eventSlug, refresh]);

  return {
    /** null until both the server config and the device state are known */
    ready: device !== null && config.isSuccess,
    serverEnabled,
    device,
    busy,
    error,
    errorDetail,
    enable,
    disable,
  };
}
