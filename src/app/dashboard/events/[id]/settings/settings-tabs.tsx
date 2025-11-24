"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Tabs from "@radix-ui/react-tabs";
import { formatISO9075, getHours, getMinutes } from "date-fns";
import { useAtomValue, useSetAtom } from "jotai";
import { Loader, Save, Trash2 } from "lucide-react";
import { useNavigationGuard } from "next-navigation-guard";
import { useRouter } from "next/navigation";
import type { JSX } from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { setEventPrimaryColors } from "@/components/event-primary-color";
import { EventAttributesFormSchema } from "@/components/forms/event/attributes/schema";
import { EventCoorganizersFormSchema } from "@/components/forms/event/coorganizers/schema";
import { EventGeneralInfoSchema } from "@/components/forms/event/general-info-form";
import { EventPersonalizationFormSchema } from "@/components/forms/event/personalization-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { UnsavedChangesAlert } from "@/components/unsaved-changes-alert";
import { toast } from "@/hooks/use-toast";
import { getBase64FromUrl } from "@/lib/utils";
import type { EventAttribute } from "@/types/attributes";
import type { CoOrganizer } from "@/types/co-organizer";
import type { Event } from "@/types/event";

import { deleteEvent, updateEvent } from "./actions";
import type { AttributeChange, CoOrganizerChange } from "./change-types";
import { areSettingsDirty } from "./settings-context";
import { Attributes } from "./tabs/attributes";
import { CoOrganizers } from "./tabs/co-organizers";
import { General } from "./tabs/general-info";
import { Personalization } from "./tabs/personalization";
import type { TabProps } from "./tabs/tab-props";

const EventSettingsSchema = z.intersection(
  EventGeneralInfoSchema,
  z.intersection(
    EventPersonalizationFormSchema,
    z.intersection(EventCoorganizersFormSchema, EventAttributesFormSchema),
  ),
);

type TabComponent = (props: TabProps) => JSX.Element;

const TABS: { name: string; value: string; component: TabComponent }[] = [
  {
    name: "Ogólne",
    value: "general",
    component: () => <General />,
  },
  {
    name: "Personalizacja",
    value: "personalization",
    component: () => <Personalization />,
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

  const [coOrganizersChanges, setCoOrganizersChanges] = useState<
    CoOrganizerChange[]
  >([]);

  const [attributes, setAttributes] =
    useState<EventAttribute[]>(unmodifiedAttributes);
  const [attributesChanges, setAttributesChanges] = useState<AttributeChange[]>(
    [],
  );

  const [activeTabValue, setActiveTabValue] = useState(TABS[0].value);

  const [isDeleteEventDialogOpen, setIsDeleteEventDialogOpen] = useState(false);

  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);

  const isDirty = useAtomValue(areSettingsDirty);
  const setIsDirty = useSetAtom(areSettingsDirty);

  const parseSocialMediaLinks = (
    links: string[] | null,
  ): { label?: string; link: string }[] => {
    if (links === null) {
      return [];
    }
    return links.map((link) => {
      const markdownMatch = /\[(.*?)]\((.*?)\)/.exec(link);
      if (markdownMatch !== null) {
        return { label: markdownMatch[1], link: markdownMatch[2] };
      }
      return { label: undefined, link };
    });
  };

  const form = useForm<z.infer<typeof EventSettingsSchema>>({
    resolver: zodResolver(EventSettingsSchema),
    defaultValues: {
      // General Info fields
      name: unmodifiedEvent.name,
      description: unmodifiedEvent.description ?? "",
      startDate: new Date(unmodifiedEvent.startDate),
      startTime: `${getHours(unmodifiedEvent.startDate).toString().padStart(2, "0")}:${getMinutes(unmodifiedEvent.startDate).toString().padStart(2, "0")}`,
      endDate: new Date(unmodifiedEvent.endDate),
      endTime: `${getHours(unmodifiedEvent.endDate).toString().padStart(2, "0")}:${getMinutes(unmodifiedEvent.endDate).toString().padStart(2, "0")}`,
      location: unmodifiedEvent.location ?? "",
      organizer: unmodifiedEvent.organizer ?? "",
      termsLink: unmodifiedEvent.termsLink ?? "",
      // Personalization fields
      photoUrl: unmodifiedEvent.photoUrl ?? undefined,
      primaryColor: unmodifiedEvent.primaryColor,
      participantsNumber: unmodifiedEvent.participantsCount ?? 100,
      socialMediaLinks: parseSocialMediaLinks(unmodifiedEvent.socialMediaLinks),
      slug: unmodifiedEvent.slug,
      contactEmail: unmodifiedEvent.contactEmail ?? undefined,
      // Co-organizers fields
      coorganizers: unmodifiedCoOrganizers.map((coOrganizer) => ({
        id: coOrganizer.id?.toString() ?? "",
        email: coOrganizer.email,
        permissions: coOrganizer.permissions,
      })),
      // Attributes fields
      attributes: unmodifiedAttributes.map((attribute) => ({
        id: attribute.id,
        name: attribute.name,
        slug: attribute.slug ?? "",
        type: attribute.type,
        options: attribute.options ?? [],
        showInList: attribute.showInList,
        isSensitiveData: attribute.isSensitiveData,
        reason: attribute.reason ?? "",
        order: attribute.order ?? 0,
      })),
    },
  });

  useEffect(() => {
    setEvent(unmodifiedEvent);
    return () => {
      setEventPrimaryColors(unmodifiedEvent.primaryColor);
    };
  }, [unmodifiedEvent]);

  useEffect(() => {
    if (form.formState.isDirty) {
      setIsDirty(true);
    }
  }, [form.formState.isDirty, setIsDirty]);

  const handleTabChange = async (newValue: string) => {
    const isValid = await form.trigger();

    if (isValid) {
      setActiveTabValue(newValue);
    }
  };

  const saveForm = async () => {
    setIsSaving(true);

    const isValid = await form.trigger();

    if (!isValid) {
      console.error(
        "[EventSettingsTabs] Form validation failed:",
        form.formState.errors,
      );
      toast({
        variant: "destructive",
        title: "Nie udało się zapisać wydarzenia!",
        description: "Popraw błędy w formularzu, aby kontynuować",
      });
      setIsSaving(false);
      return;
    }

    const values = form.getValues();

    values.startDate.setHours(Number.parseInt(values.startTime.split(":")[0]));
    values.startDate.setMinutes(
      Number.parseInt(values.startTime.split(":")[1]),
    );
    values.endDate.setHours(Number.parseInt(values.endTime.split(":")[0]));
    values.endDate.setMinutes(Number.parseInt(values.endTime.split(":")[1]));

    const newEvent: Event = {
      ...event,
      name: values.name,
      description: values.description ?? "",
      startDate: formatISO9075(values.startDate, {
        representation: "complete",
      }),
      endDate: formatISO9075(values.endDate, { representation: "complete" }),
      location: values.location ?? "",
      organizer: values.organizer ?? "",
      termsLink: values.termsLink ?? "",
      photoUrl: values.photoUrl ?? null,
      primaryColor: values.primaryColor,
      participantsCount: values.participantsNumber,
      socialMediaLinks: values.socialMediaLinks
        .map((link: { label?: string; link: string }) => {
          if (link.label != null && link.link) {
            return `[${link.label}](${link.link})`;
          } else if (link.link) {
            return link.link;
          } else {
            return "";
          }
        })
        .filter((link: string) => link !== ""),
      slug: values.slug,
      contactEmail: values.contactEmail ?? null,
    };

    setEvent(newEvent);

    try {
      const base64Image =
        newEvent.photoUrl?.startsWith("blob:") === true
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
        const eventErrors = eventResult.errors.filter(
          (error) => "section" in error && error.section === "event",
        );
        const coOrganizerErrors = eventResult.errors.filter(
          (error) => "section" in error && error.section === "coOrganizers",
        );
        const attributeErrors = eventResult.errors.filter(
          (error) => "section" in error && error.section === "attributes",
        );
        const otherErrors = eventResult.errors.filter(
          (error) => !("section" in error),
        );

        if (eventErrors.length > 0 || otherErrors.length > 0) {
          toast({
            variant: "destructive",
            title: "Nie udało się zapisać wydarzenia!",
            description: `Spróbuj zapisać wydarzenie ponownie.\n${[
              ...eventErrors,
              ...otherErrors,
            ]
              .map((error) => error.message)
              .join("\n")}`,
          });
        } else {
          // Event saved, but some co-organizers or attributes failed
          const errorSections = [];
          if (coOrganizerErrors.length > 0) {
            errorSections.push("współorganizatorów");
          }
          if (attributeErrors.length > 0) {
            errorSections.push("atrybutów");
          }

          toast({
            variant: "destructive",
            title: "Wydarzenie zapisane z błędami",
            description: `Wydarzenie zostało zaktualizowane, ale wystąpiły problemy z: ${errorSections.join(", ")}. Odśwież stronę i spróbuj ponownie.`,
          });

          setCoOrganizersChanges([]);
          setAttributesChanges([]);
        }
      } else {
        setCoOrganizersChanges([]);
        setAttributesChanges([]);
        setEvent(eventResult);
        setIsDirty(false);
        toast({
          variant: "default",
          title: "Zapisano zmiany w wydarzeniu",
        });
      }
    } catch (error) {
      console.error("[EventSettingsTabs] Error saving event:", error);
      toast({
        variant: "destructive",
        title: "Nie udało się zapisać wydarzenia!",
        description: "Spróbuj zapisać wydarzenie ponownie",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEvent = async () => {
    const result = await deleteEvent(unmodifiedEvent.id);
    // setIsDirty(false);
    if ("errors" in result) {
      toast({
        variant: "destructive",
        title: "Nie udało się usunąć wydarzenia!",
        description: `Spróbuj ponownie.\n${result.errors
          .map((error) => error.message)
          .join("\n")}`,
      });
    } else {
      toast({
        variant: "default",
        title: "Usunięto wydarzenie",
      });
      router.push("/dashboard/events");
    }
    setIsDeleteEventDialogOpen(false);
  };

  const navGuard = useNavigationGuard({
    enabled: isDirty,
  });

  return (
    <>
      <UnsavedChangesAlert
        active={navGuard.active}
        onCancel={navGuard.reject}
        onConfirm={navGuard.accept}
      />
      <Form {...form}>
        <Tabs.Root
          value={activeTabValue}
          className="flex-1 space-y-6"
          onValueChange={handleTabChange}
        >
          <Tabs.List className="border-gray-250 flex w-fit flex-wrap justify-center space-x-2 rounded-xl border p-1 shadow-xs">
            {TABS.map((tab) => (
              <Tabs.Trigger
                key={tab.value}
                value={tab.value}
                className="rounded-lg px-4 py-1 transition-colors hover:bg-[var(--event-primary-color)]/10 data-[state=active]:bg-[var(--event-primary-color)] data-[state=active]:text-[var(--event-primary-foreground-color)] data-[state=active]:hover:bg-[var(--event-primary-color)]/90"
              >
                {tab.name}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {TABS.map((tab) => (
            <Tabs.Content key={tab.value} value={tab.value} className="flex-1">
              {tab.component({
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
        <div className="flex w-full justify-between gap-2">
          <Button variant="eventDefault" onClick={saveForm} disabled={isSaving}>
            {isSaving ? <Loader className="animate-spin" /> : <Save />} Zapisz
          </Button>
          {activeTabValue === "general" && (
            <AlertDialog
              open={isDeleteEventDialogOpen}
              onOpenChange={setIsDeleteEventDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="bg-background hover:bg-destructive/10 hidden border border-red-500 text-red-500 sm:inline-flex"
                >
                  <Trash2 />
                  Usuń wydarzenie
                </Button>
              </AlertDialogTrigger>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="bg-background hover:bg-destructive/10 size-12 border border-red-500 text-red-500 sm:hidden"
                >
                  <Trash2 />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogTitle>
                  Czy na pewno chcesz usunąć to wydarzenie?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-900">
                  Po usunięciu wydarzenia nie będzie można go przywrócić.
                </AlertDialogDescription>
                <AlertDialogFooter className="flex gap-x-4">
                  <AlertDialogCancel
                    className={buttonVariants({
                      variant: "outline",
                    })}
                  >
                    Anuluj
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteEvent}
                    className={buttonVariants({
                      variant: "destructive",
                    })}
                  >
                    Usuń
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </Form>
    </>
  );
}
