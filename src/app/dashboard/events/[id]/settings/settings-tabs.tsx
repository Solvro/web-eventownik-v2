"use client";

import * as Tabs from "@radix-ui/react-tabs";
import type { JSX } from "react";
import { useEffect, useRef, useState } from "react";

import { toast } from "@/hooks/use-toast";
import { getBase64FromUrl } from "@/lib/utils";
import type { CoOrganizer } from "@/types/co-organizer";
import type { Event } from "@/types/event";

import { updateEvent } from "./actions";
import { Attributes } from "./tabs/attributes";
import { CoOrganizers } from "./tabs/co-organizers";
import { General } from "./tabs/general-info";
import { Personalization } from "./tabs/personalization";
import type { TabProps } from "./tabs/tab-props";

type TabComponent = (props: TabProps) => JSX.Element;

const TABS: { name: string; value: string; component: TabComponent }[] = [
  {
    name: "Ogólne",
    value: "general",
    component: (props) => <General {...props} />,
  },
  {
    name: "Personalizacja",
    value: "personalization",
    component: (props) => <Personalization {...props} />,
  },
  {
    name: "Współorganizatorzy",
    value: "co-organizers",
    component: (props) => <CoOrganizers {...props} />,
  },
  {
    name: "Atrybuty",
    value: "attributes",
    component: (props) => <Attributes {...props} />,
  },
];

interface TabsProps {
  unmodifiedEvent: Event;
  unmodifiedCoOrganizers: CoOrganizer[];
}

export function EventSettingsTabs({
  unmodifiedEvent,
  unmodifiedCoOrganizers,
}: TabsProps) {
  const [event, setEvent] = useState(unmodifiedEvent);
  const [coOrganizers, setCoOrganizers] = useState(unmodifiedCoOrganizers);
  const [coOrganizersChanges, setCoOrganizersChanges] = useState({
    added: [] as CoOrganizer[],
    updated: [] as CoOrganizer[],
    deleted: [] as CoOrganizer[],
  });
  const [activeTabValue, setActiveTabValue] = useState(TABS[0].value);
  const saveFormRef = useRef<
    () => Promise<{ success: boolean; event: Event | null }>
    // eslint-disable-next-line @typescript-eslint/require-await
  >(async () => {
    return { success: true, event };
  });

  useEffect(() => {
    setEvent(unmodifiedEvent);
  }, [unmodifiedEvent]);

  const handleTabChange = async (newValue: string) => {
    // Check if form validation passes before allowing tab change
    const { success, event: newEvent } = await saveFormRef.current();
    if (success && newEvent != null) {
      setActiveTabValue(newValue);
      setEvent(newEvent);
    }
  };

  const saveForm = async () => {
    // setLoading(true);
    const { success, event: newEvent } = await saveFormRef.current();
    if (!success || newEvent == null) {
      toast({
        variant: "destructive",
        title: "Wydarzenie nie zostało zapisane.",
        description: "Popraw błędy w formularzu, aby kontynuować.",
      });
      return;
    }
    setEvent(newEvent);
    try {
      const base64Image =
        newEvent.photoUrl?.startsWith("blob:") === true // Check if image is a blob
          ? await getBase64FromUrl(newEvent.photoUrl)
          : newEvent.photoUrl;
      const eventResult = await updateEvent(
        unmodifiedEvent,
        {
          ...newEvent,
          photoUrl: base64Image,
        },
        coOrganizersChanges,
      );
      if ("errors" in eventResult) {
        toast({
          variant: "destructive",
          title: "O nie! Coś poszło nie tak.",
          description: `Spróbuj zapisać wydarzenie ponownie.\n${eventResult.errors
            .map((error) => error.message)
            .join("\n")}`,
        });
      } else {
        setCoOrganizersChanges({
          added: [],
          updated: [],
          deleted: [],
        });
        toast({
          variant: "default",
          title: "Wydarzenie zostało zapisane.",
          description: "Twoje zmiany zostały zapisane.",
        });
      }
    } catch (error) {
      console.error("[EventSettingsTabs] Error saving event:", error);
      toast({
        variant: "destructive",
        title: "O nie! Coś poszło nie tak.",
        description: "Spróbuj zapisać wydarzenie ponownie.",
      });
    }
  };

  return (
    <>
      <Tabs.Root
        value={activeTabValue}
        className="space-y-6"
        onValueChange={handleTabChange}
      >
        {/* Tabs Navigation */}
        <Tabs.List className="border-gray-250 flex w-fit space-x-2 rounded-xl border p-1 shadow-xs">
          {TABS.map((tab) => (
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              className="hover:bg-primary/10 rounded-lg px-4 py-1 transition-colors data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:hover:bg-blue-600"
            >
              {tab.name}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {/* Active Tab Content */}
        {TABS.map((tab) => (
          <Tabs.Content key={tab.value} value={tab.value}>
            {tab.component({
              event,
              saveFormRef,
              coOrganizers,
              setCoOrganizers,
              setCoOrganizersChanges,
            })}
          </Tabs.Content>
        ))}
      </Tabs.Root>
      <button
        className="mt-6 rounded-2xl bg-blue-500 px-6 py-3 text-white"
        onClick={saveForm}
      >
        Zapisz
      </button>
    </>
  );
}
