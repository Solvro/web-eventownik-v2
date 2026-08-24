"use client";

import { Drawer, Puck, Render, createUsePuck } from "@puckeditor/core";
import "@puckeditor/core/no-external.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Columns2,
  Columns3,
  Columns4,
  FoldVertical,
  Grid2X2,
  Grid3X3,
  Grid3x2,
  Image,
  LinkIcon,
  Loader2,
  Redo2,
  Save,
  Sidebar,
  Type,
  Undo2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import type * as z from "zod";

import {
  createEventEmail,
  updateEventEmail,
} from "@/app/dashboard/events/[uuid]/emails/actions";
import { useToast } from "@/hooks/use-toast";
import { useUnsavedEditor } from "@/hooks/use-unsaved";
import { translateOrFallback } from "@/i18n/translate-or-fallback";
import { replaceEmptyParagraphs } from "@/lib/editor";
import { cn } from "@/lib/utils";
import type { PuckConfig, PuckMutationData } from "@/types/editor";
import { emailTemplateSchema } from "@/types/schemas";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { UnsavedChangesAlert } from "../unsaved-changes-alert";
import { PUCK_ICON_CLASSNAME } from "./common";
import "./puck-custom-theme.css";

const COMPONENT_ICONS = {
  RichText: <Type className={PUCK_ICON_CLASSNAME} />,
  Divider: <FoldVertical className={PUCK_ICON_CLASSNAME} />,
  Image: <Image className={PUCK_ICON_CLASSNAME} />,
  TwoByTwo: <Grid2X2 className={PUCK_ICON_CLASSNAME} />,
  TwoByOne: <Columns2 className={PUCK_ICON_CLASSNAME} />,
  ThreeByOne: <Columns3 className={PUCK_ICON_CLASSNAME} />,
  FourByOne: <Columns4 className={PUCK_ICON_CLASSNAME} />,
  ThreeByTwo: <Grid3x2 className={PUCK_ICON_CLASSNAME} />,
  ThreeByThree: <Grid3X3 className={PUCK_ICON_CLASSNAME} />,
  Link: <LinkIcon className={PUCK_ICON_CLASSNAME} />,
  LinkImage: <LinkIcon className={PUCK_ICON_CLASSNAME} />,
} as const satisfies Record<keyof PuckConfig["components"], React.ReactElement>;

type EmailTemplateFormValues = z.infer<typeof emailTemplateSchema>;

const usePuck = createUsePuck<PuckConfig>();

function SaveButton({ mutationData }: { mutationData: PuckMutationData }) {
  const t = useTranslations("Editor");
  const tEventDetails = useTranslations("EventDetails");

  const appState = usePuck((s) => s.appState);
  const config = usePuck((s) => s.config);
  const setHistories = usePuck((s) => s.history.setHistories);
  const [shouldExit, setShouldExit] = useState<boolean>(false);
  const renderWrapperRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const queryClient = useQueryClient();

  const { mutate: publish, isPending } = useMutation({
    mutationFn: async (values: EmailTemplateFormValues) => {
      const payload = {
        eventUuid: mutationData.eventUuid,
        emailTemplate: values,
      };

      return mutationData.mode === "create"
        ? createEventEmail(payload)
        : updateEventEmail({ ...payload, mailUuid: mutationData.emailUuid });
    },
    onSuccess: (result) => {
      if (!result.success) {
        toast({
          title: t("error"),
          description:
            translateOrFallback(
              tEventDetails,
              result.error?.key,
              result.error?.values,
            ) ?? t("unknownError"),
          variant: "destructive",
        });
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: ["eventEmails", mutationData.eventUuid],
      });

      setHistories([{ id: "saved", state: appState }]);

      toast({
        title:
          mutationData.mode === "create"
            ? t("templateCreated")
            : t("templateSaved"),
      });

      if (mutationData.mode === "create") {
        setShouldExit(true);
      }
    },
    onError: (error) => {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const values: EmailTemplateFormValues = {
      name: appState.data.root.props?.name ?? "",
      content: replaceEmptyParagraphs(
        renderWrapperRef.current?.querySelector("#email-root")?.innerHTML ?? "",
      ),
      schema: JSON.stringify(appState.data),
      trigger: appState.data.root.props?.trigger as string,
      triggerValue: appState.data.root.props?.triggerValue ?? null,
      triggerValue2: appState.data.root.props?.triggerValue2,
    };

    const parsed = emailTemplateSchema.safeParse(values);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message;
      toast({
        title: t("validationError"),
        description: firstError,
        variant: "destructive",
      });
      return;
    }

    publish(parsed.data);
  };

  if (shouldExit) {
    router.push(`/dashboard/events/${mutationData.eventUuid}/emails`);
  }

  return (
    <>
      <form onSubmit={onSubmit}>
        <Button variant="outline" type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" /> : <Save />}
          {t("save")}
        </Button>
      </form>

      <div ref={renderWrapperRef} className="hidden">
        <Render data={appState.data} config={config} />
      </div>
    </>
  );
}

function Toolbar() {
  const t = useTranslations("Editor");

  const history = usePuck((s) => s.history);
  const uiState = usePuck((s) => s.appState.ui);
  const dispatch = usePuck((s) => s.dispatch);

  const leftVisible = uiState.leftSideBarVisible;
  const rightVisible = uiState.rightSideBarVisible;
  const { back, forward, hasFuture, hasPast } = history;

  return (
    <div className="flex justify-between border-b border-(--event-primary-color)/50">
      <div className="flex justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="eventGhost"
              onClick={() => {
                dispatch({
                  type: "setUi",
                  ui: {
                    leftSideBarVisible: !leftVisible,
                  },
                });
              }}
            >
              <Sidebar />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {leftVisible ? t("hideLeftPanel") : t("showLeftPanel")}
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="eventGhost"
              onClick={() => {
                dispatch({
                  type: "setUi",
                  ui: {
                    rightSideBarVisible: !rightVisible,
                  },
                });
              }}
            >
              <Sidebar className="scale-[-1_-1]" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {rightVisible ? t("hideRightPanel") : t("showRightPanel")}
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="flex justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="eventGhost" onClick={back} disabled={!hasPast}>
              <Undo2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("undo")}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="eventGhost"
              onClick={forward}
              disabled={!hasFuture}
            >
              <Redo2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("redo")}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

function BlocksAndSchemaSidebar() {
  const t = useTranslations("Editor");

  const isVisible = usePuck((s) => s.appState.ui.leftSideBarVisible);
  const { components, categories } = usePuck((s) => s.config);

  return (
    <ScrollArea
      className={cn(
        "max-h-181 w-58.5 border-r border-(--event-primary-color)/50",
        isVisible ? "block" : "hidden",
      )}
    >
      <div className="space-y-4">
        <h2 className="border-b border-(--event-primary-color)/50 p-4 text-lg font-semibold">
          {t("blocks")}
        </h2>
        <Drawer>
          <Accordion
            type="multiple"
            className="px-4 [&>div_button>svg]:stroke-(--event-primary-color)"
          >
            {categories === undefined
              ? null
              : Object.keys(categories).map((category, categoryIndex) => {
                  const categoryLabel =
                    Object.values(categories)[categoryIndex].title;
                  const componentEntries =
                    Object.values(categories)[categoryIndex].components ?? [];
                  return (
                    <AccordionItem
                      value={category}
                      key={category}
                      className="border-none"
                    >
                      <AccordionTrigger className="text-muted-foreground hover:no-underline">
                        {categoryLabel}
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2">
                        {componentEntries.map((component) => {
                          const componentLabel = components[component].label;
                          return (
                            <Drawer.Item name={component} key={component}>
                              {() => (
                                <Button
                                  asChild
                                  size="sm"
                                  variant="eventDefault"
                                  className="flex w-full items-center justify-between gap-2 py-2"
                                >
                                  <div>
                                    {COMPONENT_ICONS[component]}
                                    {componentLabel}
                                  </div>
                                </Button>
                              )}
                            </Drawer.Item>
                          );
                        })}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
          </Accordion>
        </Drawer>
        <h2 className="border-y border-(--event-primary-color)/50 p-4 text-lg font-semibold">
          {t("schema")}
        </h2>
        <div id="outline" className="mb-2 max-h-72 [&>div>ul]:space-y-2">
          <Puck.Outline />
        </div>
      </div>
    </ScrollArea>
  );
}

function FieldsPanel() {
  const isVisible = usePuck((s) => s.appState.ui.rightSideBarVisible);

  return (
    <ScrollArea
      className={cn(
        "max-h-181 w-58.5 border-l border-(--event-primary-color)/50",
        isVisible ? "block" : "hidden",
      )}
    >
      <div className="overflow-y-auto [&_.tiptap]:bg-transparent! [&>form]:w-58.5">
        <Puck.Fields />
      </div>
    </ScrollArea>
  );
}

/**
 * Client component containing all of custom Puck editor UI.
 * This component must be rendered within `<Puck/>` component.
 */
function PuckComposition({ mutationData }: { mutationData: PuckMutationData }) {
  const t = useTranslations("Editor");

  const hasChanged = usePuck((s) => s.history.hasPast);
  const { isGuardActive, onCancel, onConfirm } = useUnsavedEditor(hasChanged);

  return (
    <div className="flex h-208.75 flex-col">
      <UnsavedChangesAlert
        active={isGuardActive}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
      <div className="flex flex-col gap-4">
        <Link
          href={`/dashboard/events/${mutationData.eventUuid}/emails`}
          className="flex max-w-fit items-center gap-2 underline"
        >
          <ArrowLeft className="h-4 w-4" /> {t("backToTemplates")}
        </Link>
        <div className="mb-2 flex justify-between">
          <h1 className="mb-4 text-3xl font-bold">{t("templateEditor")}</h1>
          <SaveButton mutationData={mutationData} />
        </div>
      </div>
      <div className="flex h-208.75 grow flex-col rounded-xl border border-(--event-primary-color)/50 bg-(--event-primary-color)/5">
        <Toolbar />
        <div className="flex max-h-181 grow">
          <BlocksAndSchemaSidebar />
          <div className="grow">
            <Puck.Preview />
          </div>
          <FieldsPanel />
        </div>
      </div>
    </div>
  );
}

export { PuckComposition };
