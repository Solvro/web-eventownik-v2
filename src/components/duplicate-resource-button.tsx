"use client";

import { Copy, Loader } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { ErrorMessage } from "@/app/dashboard/(create-event)/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Radix's default toast duration
const RESULT_TOAST_DURATION_MS = 5000;

interface DuplicateResourceButtonProps {
  resourceName: string;
  resourceType: string;
  onDuplicate: () => Promise<{ success: boolean; warnings?: ErrorMessage[] }>;
  variant?: "eventGhost" | "ghost";
  className?: string;
}

function DuplicateResourceButton({
  resourceName,
  resourceType,
  onDuplicate,
  variant = "eventGhost",
  className,
}: DuplicateResourceButtonProps) {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);

  async function onSubmit() {
    setIsPending(true);
    // Copying a whole event takes many backend requests, so confirm the click right away.
    // The toast stays open until the result replaces its content
    const progressToast = toast({
      title: t("resourceDuplicating", {
        resourceType: resourceType.toLowerCase(),
      }),
      description: t("resourceDuplicatingDescription", { resourceName }),
      duration: Infinity,
    });

    let result: { success: boolean; warnings?: ErrorMessage[] };
    try {
      result = await onDuplicate();
    } catch {
      result = { success: false };
    } finally {
      setIsPending(false);
    }

    progressToast.update(
      result.success
        ? {
            id: progressToast.id,
            title: t("resourceDuplicated", { resourceType }),
            description:
              result.warnings === undefined
                ? t("resourceDuplicatedWithName", {
                    resourceType,
                    resourceName,
                  })
                : result.warnings.map((w) => t(w.key, w.values)).join("\n"),
            duration: RESULT_TOAST_DURATION_MS,
          }
        : {
            id: progressToast.id,
            title: t("resourceDuplicateFailed", {
              resourceType: resourceType.toLowerCase(),
            }),
            description: undefined,
            variant: "destructive",
            duration: RESULT_TOAST_DURATION_MS,
          },
    );
    router.refresh();
  }

  return (
    <Button
      variant={variant}
      size="icon"
      className={className}
      title={`${t("duplicate")} ${resourceType.toLowerCase()}`}
      disabled={isPending}
      onClick={async () => onSubmit()}
    >
      {isPending ? <Loader className="animate-spin" /> : <Copy />}
      <span className="sr-only">
        {t("duplicate")} {resourceType.toLowerCase()}
      </span>
    </Button>
  );
}

export { DuplicateResourceButton };
