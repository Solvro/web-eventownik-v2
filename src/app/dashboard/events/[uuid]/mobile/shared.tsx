"use client";

import { Loader, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";

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
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

import type { MobileActionResult } from "./actions";

/** Runs a server action, shows a toast and refreshes the page data on success */
export function useMobileAction() {
  const router = useRouter();
  const t = useTranslations("MobileAdmin");

  return async function run<T>(
    action: Promise<MobileActionResult<T>>,
    successTitle?: string,
  ): Promise<T | null> {
    const result = await action;
    if (result.success) {
      if (successTitle !== undefined) {
        toast({ title: successTitle });
      }
      router.refresh();
      return result.data;
    }
    toast({
      title: t("actionFailed"),
      description: result.error,
      variant: "destructive",
    });
    return null;
  };
}

export function DeleteButton({
  label,
  description,
  onConfirm,
}: {
  /** Accessible name of the icon button, e.g. "Usuń kontakt X" */
  label: string;
  description?: string;
  onConfirm: () => Promise<unknown>;
}) {
  const t = useTranslations("MobileAdmin");
  const [isPending, setIsPending] = useState(false);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={label}
          title={label}
          disabled={isPending}
          className="text-destructive shrink-0"
        >
          {isPending ? <Loader className="animate-spin" /> : <Trash2 />}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("confirmDeleteTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {description ?? t("confirmDeleteDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              setIsPending(true);
              try {
                await onConfirm();
              } finally {
                setIsPending(false);
              }
            }}
          >
            {t("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description === undefined ? null : (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="text-muted-foreground rounded-xl border border-dashed p-6 text-center text-sm">
      {children}
    </p>
  );
}

export function LoadError({ message }: { message: string }) {
  return (
    <p className="text-destructive rounded-xl border border-red-300 p-4 text-sm">
      {message}
    </p>
  );
}

export function SubmitButton({
  isSubmitting,
  children,
  icon,
}: {
  isSubmitting: boolean;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <Button type="submit" variant="eventDefault" disabled={isSubmitting}>
      {isSubmitting ? <Loader className="animate-spin" /> : icon}
      {children}
    </Button>
  );
}
