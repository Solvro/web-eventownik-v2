"use client";

import { Drawer, Puck, Render, createUsePuck } from "@puckeditor/core";
import "@puckeditor/core/no-external.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
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
import React, { useRef } from "react";
import type * as z from "zod";

import {
  createEventEmail,
  updateEventEmail,
} from "@/app/dashboard/events/[id]/emails/actions";
import { useToast } from "@/hooks/use-toast";
import { useUnsavedEditor } from "@/hooks/use-unsaved";
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
} as const satisfies Record<keyof PuckConfig["components"], React.ReactElement>;

type EmailTemplateFormValues = z.infer<typeof emailTemplateSchema>;

const usePuck = createUsePuck<PuckConfig>();

function SaveButton({ mutationData }: { mutationData: PuckMutationData }) {
  const appState = usePuck((s) => s.appState);
  const config = usePuck((s) => s.config);
  const setHistories = usePuck((s) => s.history.setHistories);
  const renderWrapperRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const { mutate: publish, isPending } = useMutation({
    mutationFn: async (values: EmailTemplateFormValues) => {
      const payload = { eventId: mutationData.eventId, emailTemplate: values };

      return mutationData.mode === "create"
        ? createEventEmail(payload)
        : updateEventEmail({ ...payload, mailId: mutationData.emailId });
    },
    onSuccess: (result) => {
      if (!result.success) {
        // Server returned a logical error (not a thrown exception)
        toast({
          title: "Błąd",
          description: result.error ?? "Nieznany błąd",
          variant: "destructive",
        });
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: ["eventEmails", mutationData.eventId],
      });

      setHistories([{ id: "saved", state: appState }]);

      toast({
        title:
          mutationData.mode === "create"
            ? "Dodano nowy szablon"
            : "Zapisano zmiany w szablonie",
      });
    },
    onError: (error) => {
      // Network/unexpected errors
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const values: EmailTemplateFormValues = {
      name: appState.data.root.props?.name ?? "",
      content:
        renderWrapperRef.current?.querySelector("#email-root")?.innerHTML ?? "",
      schema: JSON.stringify(appState.data),
      trigger: appState.data.root.props?.trigger as string,
      triggerValue: appState.data.root.props?.triggerValue ?? null,
      triggerValue2: appState.data.root.props?.triggerValue2,
    };

    const parsed = emailTemplateSchema.safeParse(values);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message;
      toast({
        title: "Błąd walidacji",
        description: firstError,
        variant: "destructive",
      });
      return;
    }

    publish(parsed.data);
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <Button variant="outline" type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" /> : <Save />}
          Zapisz
        </Button>
      </form>

      <div ref={renderWrapperRef} className="hidden">
        <Render data={appState.data} config={config} />
      </div>
    </>
  );
}

function Toolbar() {
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
            {leftVisible ? "Ukryj" : "Wyświetl"} lewy panel
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
            {rightVisible ? "Ukryj" : "Wyświetl"} prawy panel
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
          <TooltipContent>Cofnij</TooltipContent>
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
          <TooltipContent>Ponów</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

function BlocksAndSchemaSidebar() {
  const isVisible = usePuck((s) => s.appState.ui.leftSideBarVisible);
  const { components, categories } = usePuck((s) => s.config);

  return (
    <ScrollArea
      className={cn("max-h-181 w-58.5", isVisible ? "block" : "hidden")}
    >
      <div className="space-y-4 border-r border-(--event-primary-color)/50">
        <h2 className="border-b border-(--event-primary-color)/50 p-4 text-lg font-semibold">
          Bloki
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
                      <AccordionTrigger className="text-muted-foreground">
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
                                    {
                                      COMPONENT_ICONS[
                                        component as keyof typeof COMPONENT_ICONS
                                      ]
                                    }
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
          Schemat
        </h2>
        <div
          className={cn(
            "mb-2 max-h-72",
            // All icons
            "[&_svg]:mb-1! [&_svg]:stroke-(--event-primary-color)!",
            // Outline list (ul - "_LayerTree")
            "[&>div>ul]:space-y-2 [&>div>ul]:px-4!",
            // Outline list item (outer element - "_Layer")
            "[&>div>ul>li]:border-(--event-primary-color)/20!",
            // Outline list item content (root element for each item - "_Layer-inner")
            "[&>div>ul>li>div]:text-foreground! [&>div>ul>li>div]:bg-(--event-primary-color)/10! [&>div>ul>li>div:hover]:border-(--event-primary-color)/60!",
            // Children of slot type component dropdown
            "[&>div>ul>li>div:nth-child(n+2)>ul>li]:text-foreground! [&>div>ul>li>div:nth-child(n+2)>ul>li]:bg-(--event-primary-color)/10! [&>div>ul>li>div:nth-child(n+2)>ul>li:hover]:border-(--event-primary-color)/60!",
            "[&>div>ul>li>div:nth-child(n+2)>ul>li_div:hover]:text-foreground! [&>div>ul>li>div:nth-child(n+2)>ul>li_div:hover]:border-(--event-primary-color)/60! [&>div>ul>li>div:nth-child(n+2)>ul>li_div:hover]:bg-(--event-primary-color)/20!",
            // Background of each slot
            "[&>div>ul>li>div:nth-of-type(n+2)]:bg-transparent!",
          )}
        >
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
      className={cn("max-h-181 w-58.5", isVisible ? "block" : "hidden")}
    >
      <div
        className={cn(
          "overflow-y-auto border-l border-(--event-primary-color)/50 [&>form]:w-58.5",
          // Rich text editor
          "[&_.tiptap]:bg-transparent!",
          // Each field entry - outside of field groups, exclusive to block (e.g. no. of columns in grid)
          "[&>form_label>div]:text-muted-foreground! [&>form>div]:border-(--event-primary-color)/50!",
          // All field groups containers (as in commons - e.g. the div holding font size field in case of typography)
          "[&>form_div>div>div>div:nth-of-type(2)]:border-none! [&>form_div>div>div>div:nth-of-type(2)]:bg-(--event-primary-color)/2!",
          // Nested field groups containers (in case of an object field within another object field - e.g. background image in appearance)
          "[&>form_div>div>div>div:nth-of-type(2)_div>div:nth-of-type(2)]:border-none! [&>form_div>div>div>div:nth-of-type(2)_div>div:nth-of-type(2)]:bg-(--event-primary-color)/2!",
          // Labels of field groups
          "[&>form>div_div>div]:text-muted-foreground!",
          // Fields of type "radio"
          "[&>form_label:has(input[type=radio])]:border-(--event-primary-color)/20! [&>form_label:has(input[type=radio])_div]:bg-(--event-primary-color)/2!",
          // Richtext menu buttons
          "[&>form>div>div>div>div>div]:border-none! [&>form>div>div>div>div>div>div_div]:bg-(--event-primary-color)/20!",
        )}
      >
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
  const hasChanged = usePuck((s) => s.history.hasPast);
  const { isGuardActive, onCancel, onConfirm } = useUnsavedEditor(hasChanged);

  return (
    <div className="flex h-208.75 flex-col">
      <UnsavedChangesAlert
        active={isGuardActive}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
      <div className="mb-2 flex justify-between">
        <h1 className="mb-4 text-3xl font-bold">Edytor szablonu</h1>
        <SaveButton mutationData={mutationData} />
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
