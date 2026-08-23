"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Tabs from "@radix-ui/react-tabs";
import { formatISO, getHours, getMinutes } from "date-fns";
import { Loader, Save, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { JSX } from "react";
import { useState } from "react";
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
import { useUnsavedForm } from "@/hooks/use-unsaved";
import { translateOrFallback } from "@/i18n/translate-or-fallback";
import { parseLinks } from "@/lib/links";
import { getBase64FromUrl } from "@/lib/utils";
import type { EventAttribute } from "@/types/attributes";
import type { CoOrganizer } from "@/types/co-organizer";
import type { Event } from "@/types/event";

import { deleteEvent, updateEvent } from "./actions";
import type { AttributeChange, CoOrganizerChange } from "./change-types";
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
  const t = useTranslations("Dashboard");

  const TABS: { name: string; value: string; component: TabComponent }[] = [
    {
      name: t("general"),
      value: "general",
      component: () => <General />,
    },
    {
      name: t("personalization"),
      value: "personalization",
      component: () => <Personalization />,
    },
    {
      name: t("coOrganizers"),
      value: "co-organizers",
      component: (props) => <CoOrganizers {...props} />,
    },
    {
      name: t("attributes"),
      value: "attributes",
      component: (props) => <Attributes {...props} />,
    },
  ];

  const [coOrganizers, setCoOrganizers] = useState(unmodifiedCoOrganizers);
  const [coOrganizersChanges, setCoOrganizersChanges] = useState<
    CoOrganizerChange[]
  >([]);

  const [attributesChanges, setAttributesChanges] = useState<AttributeChange[]>(
    [],
  );

  const { generalLinks, policyLink } = parseLinks(unmodifiedEvent.links);

  const [activeTabValue, setActiveTabValue] = useState(TABS[0].value);

  const [isDeleteEventDialogOpen, setIsDeleteEventDialogOpen] = useState(false);

  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof EventSettingsSchema>>({
    resolver: zodResolver(EventSettingsSchema),
    defaultValues: {
      // General Info fields
      name: unmodifiedEvent.name,
      description: unmodifiedEvent.description ?? "",
      startDate: new Date(unmodifiedEvent.startDate),
      startTime: `${getHours(new Date(unmodifiedEvent.startDate)).toString().padStart(2, "0")}:${getMinutes(new Date(unmodifiedEvent.startDate)).toString().padStart(2, "0")}`,
      endDate: new Date(unmodifiedEvent.endDate),
      endTime: `${getHours(new Date(unmodifiedEvent.endDate)).toString().padStart(2, "0")}:${getMinutes(new Date(unmodifiedEvent.endDate)).toString().padStart(2, "0")}`,
      location: unmodifiedEvent.location ?? "",
      organizer: unmodifiedEvent.organizer ?? "",
      termsLink: policyLink?.url ?? "",
      // Personalization fields
      photoUrl: unmodifiedEvent.photoUrl ?? undefined,
      primaryColor: unmodifiedEvent.primaryColor,
      participantsNumber: unmodifiedEvent.participantsCount ?? 100,
      socialMediaLinks: generalLinks,
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
        uuid: attribute.uuid,
        name: attribute.name,
        slug: attribute.slug ?? "",
        type: attribute.type,
        options: attribute.options ?? [],
        showInList: attribute.showInList,
        isSensitiveData: attribute.isSensitiveData,
        reason: attribute.reason ?? "",
        order: attribute.order ?? 0,
        isMultiple: attribute.isMultiple,
        maxSelections: attribute.maxSelections,
      })),
    },
  });

  const { isGuardActive, onCancel, onConfirm } = useUnsavedForm(
    form.formState.isDirty,
  );

  setEventPrimaryColors(form.getValues("primaryColor"));

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
        title: t("failedToSaveEvent"),
        description: t("fixFormErrors"),
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
      ...unmodifiedEvent,
      name: values.name,
      description: values.description ?? "",
      startDate: formatISO(values.startDate, { representation: "complete" }),
      endDate: formatISO(values.endDate, { representation: "complete" }),
      location: values.location ?? "",
      organizer: values.organizer ?? "",
      photoUrl: values.photoUrl ?? null,
      primaryColor: values.primaryColor,
      participantsCount: values.participantsNumber,
      links: [
        ...(values.termsLink == null
          ? []
          : [{ url: values.termsLink, type: "policy", label: "Policy" }]),
        ...values.socialMediaLinks.filter((link) => link.url !== ""),
      ],
      slug: values.slug,
      contactEmail: values.contactEmail ?? null,
    };

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
            title: t("failedToSaveEvent"),
            description: `${t("trySavingAgain")}.\n${[
              ...eventErrors,
              ...otherErrors,
            ]
              .map((error) =>
                translateOrFallback(
                  t,
                  error.message.key,
                  error.message.key === "failedToDeleteAttribute" &&
                    error.message.values != null
                    ? {
                        ...error.message.values,
                        errorData:
                          error.message.values.errorData === "unknownError"
                            ? t("unknownError")
                            : error.message.values.errorData,
                      }
                    : error.message.values,
                ),
              )
              .join("\n")}`,
          });
        } else {
          // Event saved, but some co-organizers or attributes failed
          const errorSections = [];
          if (coOrganizerErrors.length > 0) {
            errorSections.push(t("coOrganizersSection"));
          }
          if (attributeErrors.length > 0) {
            errorSections.push(t("attributesSection"));
          }

          toast({
            variant: "destructive",
            title: t("eventSavedWithErrors"),
            description: t("eventUpdatedWithIssues", {
              errorSections: errorSections.join(", "),
            }),
          });

          setCoOrganizersChanges([]);
          setAttributesChanges([]);
        }
      } else {
        setCoOrganizersChanges([]);
        setAttributesChanges([]);
        form.reset(values);
        toast({
          variant: "default",
          title: t("eventChangesSaved"),
        });
      }
    } catch (error) {
      console.error("[EventSettingsTabs] Error saving event:", error);
      toast({
        variant: "destructive",
        title: t("failedToSaveEvent"),
        description: t("trySavingAgain"),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEvent = async () => {
    const result = await deleteEvent(unmodifiedEvent.uuid);
    if ("errors" in result) {
      toast({
        variant: "destructive",
        title: t("failedToDeleteEvent"),
        description: `${t("tryAgain")}\n${result.errors
          .map((error) => translateOrFallback(t, error.message.key))
          .join("\n")}`,
      });
    } else {
      toast({
        variant: "default",
        title: t("eventDeleted"),
      });
      router.push("/dashboard/events");
    }
    setIsDeleteEventDialogOpen(false);
  };

  return (
    <>
      <UnsavedChangesAlert
        active={isGuardActive}
        onCancel={onCancel}
        onConfirm={onConfirm}
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
                attributes: unmodifiedAttributes,
                setAttributesChanges,
              })}
            </Tabs.Content>
          ))}
        </Tabs.Root>
        <div className="flex w-full justify-between gap-2">
          <Button variant="eventDefault" onClick={saveForm} disabled={isSaving}>
            {isSaving ? <Loader className="animate-spin" /> : <Save />}{" "}
            {t("save")}
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
                  {t("deleteEvent")}
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
                <AlertDialogTitle>{t("confirmDeleteEvent")}</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-900">
                  {t("deleteEventWarning")}
                </AlertDialogDescription>
                <AlertDialogFooter className="flex gap-x-4">
                  <AlertDialogCancel
                    className={buttonVariants({
                      variant: "outline",
                    })}
                  >
                    {t("cancel")}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteEvent}
                    className={buttonVariants({
                      variant: "destructive",
                    })}
                  >
                    {t("delete")}
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
