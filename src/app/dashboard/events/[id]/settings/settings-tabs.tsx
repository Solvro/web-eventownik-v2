"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import type { JSX } from "react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { getBase64FromUrl } from "@/lib/utils";
import type { EventAttribute } from "@/types/attributes";
import type { CoOrganizer } from "@/types/co-organizer";
import type { Event } from "@/types/event";

import { deleteEvent, updateEvent } from "./actions";
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
  unmodifiedAttributes: EventAttribute[];
}

export function EventSettingsTabs({
  unmodifiedEvent,
  unmodifiedCoOrganizers,
  unmodifiedAttributes,
}: TabsProps) {
  const [event, setEvent] = useState(unmodifiedEvent);
  const [coOrganizers, setCoOrganizers] = useState(unmodifiedCoOrganizers);
  const [coOrganizersChanges, setCoOrganizersChanges] = useState({
    added: [] as CoOrganizer[],
    updated: [] as CoOrganizer[],
    deleted: [] as CoOrganizer[],
  });
  const [attributes, setAttributes] =
    useState<EventAttribute[]>(unmodifiedAttributes);
  const [attributesChanges, setAttributesChanges] = useState({
    added: [] as EventAttribute[],
    updated: [] as EventAttribute[],
    deleted: [] as EventAttribute[],
  });
  const [activeTabValue, setActiveTabValue] = useState(TABS[0].value);
  const [isDeleteEventDialogOpen, setIsDeleteEventDialogOpen] = useState(false);
  const router = useRouter();
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
        attributesChanges,
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
        setAttributesChanges({
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

  const handleDeleteEvent = async () => {
    const result = await deleteEvent(unmodifiedEvent.id);
    if ("errors" in result) {
      toast({
        variant: "destructive",
        title: "O nie! Coś poszło nie tak.",
        description: `Spróbuj usunąć wydarzenie ponownie.\n${result.errors
          .map((error) => error.message)
          .join("\n")}`,
      });
    } else {
      toast({
        variant: "default",
        title: "Wydarzenie zostało usunięte.",
        description: "Twoje wydarzenie zostało usunięte.",
      });
      router.push("/dashboard/events");
    }
    setIsDeleteEventDialogOpen(false);
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
              attributes,
              setAttributes,
              setAttributesChanges,
            })}
          </Tabs.Content>
        ))}
      </Tabs.Root>
      <div className="max-w-80/full flex justify-between gap-2 pt-4">
        <Button onClick={saveForm}>Zapisz</Button>
        {activeTabValue === "general" && (
          <AlertDialog.Root
            open={isDeleteEventDialogOpen}
            onOpenChange={setIsDeleteEventDialogOpen}
          >
            <AlertDialog.Trigger asChild>
              <Button
                variant="destructive"
                className="bg-background hover:bg-destructive/10 border border-red-500 text-red-500"
              >
                <Trash />
                Usuń wydarzenie
              </Button>
            </AlertDialog.Trigger>
            <AlertDialog.Portal>
              <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
              <AlertDialog.Content className="bg-background fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border p-6 shadow-md">
                <AlertDialog.Title className="text-lg font-semibold">
                  Czy na pewno chcesz usunąć wydarzenie?
                </AlertDialog.Title>
                <AlertDialog.Description className="mt-4 text-sm">
                  Po usunięciu wydarzenia nie będzie można go przywrócić.
                </AlertDialog.Description>
                <div className="mt-6 flex justify-end space-x-2">
                  <AlertDialog.Cancel asChild>
                    <Button variant="outline">Anuluj</Button>
                  </AlertDialog.Cancel>
                  <AlertDialog.Action
                    asChild
                    onClick={(event_) => {
                      event_.preventDefault();
                    }}
                  >
                    <Button variant="destructive" onClick={handleDeleteEvent}>
                      Usuń
                    </Button>
                  </AlertDialog.Action>
                </div>
              </AlertDialog.Content>
            </AlertDialog.Portal>
          </AlertDialog.Root>
        )}
      </div>
    </>
  );
}
