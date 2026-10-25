"use client";

import { Copy, Loader } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { ErrorMessage } from "@/app/dashboard/(create-event)/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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
    let result: { success: boolean; warnings?: ErrorMessage[] };
    try {
      result = await onDuplicate();
    } catch {
      result = { success: false };
    } finally {
      setIsPending(false);
    }

    if (result.success) {
      toast({
        title: t("resourceDuplicated", { resourceType }),
        description:
          result.warnings === undefined
            ? t("resourceDuplicatedWithName", { resourceType, resourceName })
            : result.warnings.map((w) => t(w.key, w.values)).join("\n"),
      });
    } else {
      toast({
        title: t("resourceDuplicateFailed", {
          resourceType: resourceType.toLowerCase(),
        }),
        variant: "destructive",
      });
    }
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
