"use client";

import { Loader, Trash2, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function DeleteManyParticipantsDialog({
  isQuerying,
  participants,
  deleteManyParticipants,
}: {
  isQuerying: boolean;
  participants: string[];
  deleteManyParticipants: (_participants: string[]) => Promise<void>;
}) {
  const t = useTranslations("Table");

  return participants.length === 0 ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          className="text-red-500 hover:cursor-not-allowed hover:text-red-500 disabled:pointer-events-auto"
          size="icon"
          disabled={true}
        >
          <Trash2 />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t("deleteManyTooltip")}</TooltipContent>
    </Tooltip>
  ) : (
    <Tooltip>
      <AlertDialog>
        <TooltipTrigger asChild>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              title={t("deleteManyTitle")}
              className="text-red-500"
              disabled={isQuerying}
              size="icon"
              aria-label={t("deleteSelectedRows")}
            >
              {isQuerying ? <Loader className="animate-spin" /> : <Trash2 />}
            </Button>
          </AlertDialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          {t("deleteManySelectedTooltip", { count: participants.length })}
        </TooltipContent>
        <AlertDialogContent className="flex flex-col items-center">
          <AlertDialogHeader className="flex flex-col items-center">
            <AlertDialogTitle className="flex flex-col items-center self-center">
              <XCircle strokeWidth={1} stroke={"red"} size={64} />
              {t("deleteConfirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-foreground text-center text-pretty">
              {t("deleteManyConfirmDescription", {
                count: participants.length,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-x-4">
            <AlertDialogAction
              onClick={async () => {
                await deleteManyParticipants(participants);
              }}
              className={buttonVariants({
                variant: "destructive",
              })}
            >
              {t("deleteButton")}
            </AlertDialogAction>
            <AlertDialogCancel
              className={buttonVariants({
                variant: "outline",
              })}
            >
              {t("cancelButton")}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Tooltip>
  );
}
