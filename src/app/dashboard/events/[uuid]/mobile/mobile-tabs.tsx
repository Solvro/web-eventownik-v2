"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useState } from "react";

import type {
  MobileAppConfig,
  MobileBerealRoundAdmin,
  MobileBingoTaskAdmin,
  MobileChatMessage,
  MobileFaqItem,
  MobileNotification,
  MobileScheduleItem,
  MobileSosContact,
} from "@/types/mobile";

import type { MobileActionResult } from "./actions";
import { BerealTab } from "./bereal-tab";
import { BingoTab } from "./bingo-tab";
import { ChatTab } from "./chat-tab";
import { FaqTab, ScheduleTab, SosTab } from "./content-tabs";
import { GeneralTab } from "./general-tab";
import { NotificationsTab } from "./notifications-tab";
import { LoadError } from "./shared";
import { TinderTab } from "./tinder-tab";

type Result<T> = MobileActionResult<T>;

const TAB_VALUES = [
  "general",
  "sos",
  "faq",
  "schedule",
  "notifications",
  "tinder",
  "bingo",
  "bereal",
  "chat",
] as const;

type TabValue = (typeof TAB_VALUES)[number];

function Loaded<T>({
  result,
  children,
}: {
  result: Result<T>;
  children: (data: T) => ReactNode;
}) {
  const t = useTranslations("MobileAdmin");
  if (!result.success) {
    return <LoadError message={t("loadFailed", { error: result.error })} />;
  }
  return <>{children(result.data)}</>;
}

export function MobileAdminTabs({
  eventUuid,
  participantUrl,
  eventPrimaryColor,
  config,
  sosContacts,
  faq,
  schedule,
  notifications,
  bingoTasks,
  berealRounds,
  chatMessages,
}: {
  eventUuid: string;
  participantUrl: string;
  eventPrimaryColor: string | null;
  config: Result<MobileAppConfig>;
  sosContacts: Result<MobileSosContact[]>;
  faq: Result<MobileFaqItem[]>;
  schedule: Result<MobileScheduleItem[]>;
  notifications: Result<MobileNotification[]>;
  bingoTasks: Result<MobileBingoTaskAdmin[]>;
  berealRounds: Result<MobileBerealRoundAdmin[]>;
  chatMessages: Result<MobileChatMessage[]>;
}) {
  const t = useTranslations("MobileAdmin");
  const [activeTab, setActiveTab] = useState<TabValue>("general");

  const tabNames: Record<TabValue, string> = {
    general: t("tabs.general"),
    sos: t("tabs.sos"),
    faq: t("tabs.faq"),
    schedule: t("tabs.schedule"),
    notifications: t("tabs.notifications"),
    tinder: t("tabs.tinder"),
    bingo: t("tabs.bingo"),
    bereal: t("tabs.bereal"),
    chat: t("tabs.chat"),
  };

  const bingoSize = config.success ? config.data.bingoSize : 5;

  return (
    <Tabs.Root
      value={activeTab}
      onValueChange={(value) => {
        setActiveTab(value as TabValue);
      }}
      className="flex flex-col gap-6"
    >
      <Tabs.List className="border-gray-250 flex w-full max-w-full gap-1 overflow-x-auto rounded-xl border p-1 shadow-xs sm:w-fit sm:flex-wrap">
        {TAB_VALUES.map((value) => (
          <Tabs.Trigger
            key={value}
            value={value}
            className="shrink-0 rounded-lg px-4 py-1 transition-colors hover:bg-[var(--event-primary-color)]/10 data-[state=active]:bg-[var(--event-primary-color)] data-[state=active]:text-[var(--event-primary-foreground-color)] data-[state=active]:hover:bg-[var(--event-primary-color)]/90"
          >
            {tabNames[value]}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      <Tabs.Content value="general">
        <Loaded result={config}>
          {(data) => (
            <GeneralTab
              eventUuid={eventUuid}
              config={data}
              participantUrl={participantUrl}
              eventPrimaryColor={eventPrimaryColor}
            />
          )}
        </Loaded>
      </Tabs.Content>
      <Tabs.Content value="sos">
        <Loaded result={sosContacts}>
          {(data) => <SosTab eventUuid={eventUuid} items={data} />}
        </Loaded>
      </Tabs.Content>
      <Tabs.Content value="faq">
        <Loaded result={faq}>
          {(data) => <FaqTab eventUuid={eventUuid} items={data} />}
        </Loaded>
      </Tabs.Content>
      <Tabs.Content value="schedule">
        <Loaded result={schedule}>
          {(data) => <ScheduleTab eventUuid={eventUuid} items={data} />}
        </Loaded>
      </Tabs.Content>
      <Tabs.Content value="notifications">
        <Loaded result={notifications}>
          {(data) => <NotificationsTab eventUuid={eventUuid} items={data} />}
        </Loaded>
      </Tabs.Content>
      <Tabs.Content value="tinder">
        <TinderTab eventUuid={eventUuid} />
      </Tabs.Content>
      <Tabs.Content value="bingo">
        <Loaded result={bingoTasks}>
          {(data) => (
            <BingoTab eventUuid={eventUuid} tasks={data} size={bingoSize} />
          )}
        </Loaded>
      </Tabs.Content>
      <Tabs.Content value="bereal">
        <Loaded result={berealRounds}>
          {(data) => <BerealTab eventUuid={eventUuid} rounds={data} />}
        </Loaded>
      </Tabs.Content>
      <Tabs.Content value="chat">
        <Loaded result={chatMessages}>
          {(data) => <ChatTab eventUuid={eventUuid} messages={data} />}
        </Loaded>
      </Tabs.Content>
    </Tabs.Root>
  );
}
