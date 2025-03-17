"use client";

import * as Tabs from "@radix-ui/react-tabs";
import type { JSX } from "react";
import { useEffect, useRef, useState } from "react";

import type { Event } from "@/types/event";

import { Attributes } from "./tabs/attributes";
import { CoOrganizers } from "./tabs/coorganizers";
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
}

export function EventSettingsTabs({ unmodifiedEvent }: TabsProps) {
  const [event, setEvent] = useState(unmodifiedEvent);
  const [activeTabValue, setActiveTabValue] = useState(TABS[0].value);
  // eslint-disable-next-line @typescript-eslint/require-await
  const saveFormRef = useRef<() => Promise<boolean>>(async () => true);

  useEffect(() => {
    setEvent(unmodifiedEvent);
  }, [unmodifiedEvent]);

  const handleTabChange = async (newValue: string) => {
    // Check if form validation passes before allowing tab change
    const canChange = await saveFormRef.current();
    if (canChange) {
      setActiveTabValue(newValue);
    }
  };

  return (
    <Tabs.Root
      value={activeTabValue}
      className="space-y-6"
      onValueChange={handleTabChange}
    >
      {/* Tabs Navigation */}
      <Tabs.List className="border-gray-250 flex w-fit space-x-2 rounded-xl border p-1 shadow-sm">
        {TABS.map((tab) => (
          <Tabs.Trigger
            key={tab.value}
            value={tab.value}
            className={`rounded-md px-4 py-1 transition-colors hover:bg-gray-100 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:hover:bg-blue-600`}
          >
            {tab.name}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {/* Active Tab Content */}
      {TABS.map((tab) => (
        <Tabs.Content key={tab.value} value={tab.value}>
          {tab.component({ event, setEvent, saveFormRef })}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
