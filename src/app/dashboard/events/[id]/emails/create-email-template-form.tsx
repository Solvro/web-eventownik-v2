"use client";

import { LayoutTemplate, SquarePlus, Type } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { newEventEmailTemplateAtom } from "@/atoms/new-email-template-atom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UnsavedChangesAlert } from "@/components/unsaved-changes-alert";
import { useUnsavedAtom } from "@/hooks/use-unsaved";
import type { EventAttribute } from "@/types/attributes";
import type { EventForm } from "@/types/forms";

import { MessageContentForm } from "./(steps)/message-content";
import { TriggerTypeForm } from "./(steps)/trigger-type";

type DialogMode = "chooser" | "simple" | null;

function CreateEmailTemplateForm({
  eventId,
  eventAttributes,
  eventForms,
}: {
  eventId: string;
  eventAttributes: EventAttribute[];
  eventForms: EventForm[];
}) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [alertActive, setAlertActive] = useState(false);

  const { isDirty, isGuardActive, onCancel, onConfirm } = useUnsavedAtom(
    newEventEmailTemplateAtom,
  );

  const t = useTranslations("Email");

  const isSimpleDialogOpen = dialogMode === "simple";

  function handleOpenChange(open: boolean) {
    if (open) {
      setDialogMode("chooser");
    } else {
      if (isDirty || isGuardActive) {
        setAlertActive(true);
      } else {
        setDialogMode(null);
      }
    }
  }

  function handleChooseSimple() {
    setDialogMode("simple");
  }

  function handleChooseBlockBased() {
    router.push("emails/editor");
  }

  const setSimpleDialogOpen = useCallback<
    React.Dispatch<React.SetStateAction<boolean>>
  >(
    (action) => {
      const open =
        typeof action === "function" ? action(isSimpleDialogOpen) : action;
      setDialogMode(open ? "simple" : null);
    },
    [isSimpleDialogOpen],
  );

  return (
    <>
      <Dialog
        open={dialogMode === "chooser"}
        onOpenChange={(open) => {
          if (open) {
            setDialogMode("chooser");
          } else {
            setDialogMode(null);
          }
        }}
      >
        <Button
          variant="outline"
          className="w-full sm:w-fit"
          onClick={() => {
            setDialogMode("chooser");
          }}
        >
          <SquarePlus className="h-6 w-6" /> Stwórz szablon
        </Button>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("chooseTemplateType")}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <button
              onClick={handleChooseSimple}
              className="border-border hover:border-primary hover:bg-accent focus-visible:ring-ring flex flex-col items-center gap-3 rounded-lg border p-6 text-center transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <Type className="text-muted-foreground h-8 w-8" />
              <div>
                <p className="font-medium">{t("simple")}</p>
                <p className="text-muted-foreground text-sm">
                  {t("simpleDescription")}
                </p>
              </div>
            </button>
            <button
              onClick={handleChooseBlockBased}
              className="border-border hover:border-primary hover:bg-accent focus-visible:ring-ring flex flex-col items-center gap-3 rounded-lg border p-6 text-center transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <LayoutTemplate className="text-muted-foreground h-8 w-8" />
              <div>
                <p className="font-medium">{t("blockBased")}</p>
                <p className="text-muted-foreground text-sm">
                  {t("blockBasedDescription")}
                </p>
              </div>
            </button>
          </div>
          <p className="text-muted-foreground mt-4 text-sm">
            {t("disclaimer")}
          </p>
        </DialogContent>
      </Dialog>

      <Dialog open={isSimpleDialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="h-full overflow-y-scroll sm:h-auto sm:max-h-[90vh] sm:overflow-y-auto">
          <DialogHeader className="sr-only">
            <DialogTitle>Stwórz szablon</DialogTitle>
          </DialogHeader>
          <UnsavedChangesAlert
            active={alertActive}
            setActive={setAlertActive}
            setDialogOpen={setSimpleDialogOpen}
            onCancel={onCancel}
            onConfirm={() => {
              setCurrentStep(0);
              onConfirm();
            }}
          />
          <div className="flex flex-col gap-4">
            {currentStep === 0 && (
              <TriggerTypeForm
                eventAttributes={eventAttributes}
                eventForms={eventForms}
                goToNextStep={() => {
                  setCurrentStep(1);
                }}
              />
            )}
            {currentStep === 1 && (
              <MessageContentForm
                eventAttributes={eventAttributes}
                eventForms={eventForms}
                eventId={eventId}
                goToPreviousStep={() => {
                  setCurrentStep(0);
                }}
                setDialogOpen={setSimpleDialogOpen}
                setCurrentStep={setCurrentStep}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { CreateEmailTemplateForm };
