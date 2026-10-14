"use client";

import { Copy, Loader } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface DuplicateResourceButtonProps {
  resourceName: string;
  resourceType: string;
  onDuplicate: () => Promise<{ success: boolean }>;
}

function DuplicateResourceButton({
  resourceName,
  resourceType,
  onDuplicate,
}: DuplicateResourceButtonProps) {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);

  async function onSubmit() {
    setIsPending(true);
    const result = await onDuplicate();
    setIsPending(false);

    if (result.success) {
      toast({
        title: t("resourceDuplicated", { resourceType }),
        description: t("resourceDuplicatedWithName", {
          resourceType,
          resourceName,
        }),
      });
      router.refresh();
    } else {
      toast({
        title: t("resourceDuplicateFailed", {
          resourceType: resourceType.toLowerCase(),
        }),
        variant: "destructive",
      });
    }
  }

  return (
    <Button
      variant="eventGhost"
      size="icon"
      title={`${t("duplicate")} ${resourceType.toLowerCase()}`}
      disabled={isPending}
      onClick={() => {
        void onSubmit();
      }}
    >
      {isPending ? <Loader className="animate-spin" /> : <Copy />}
      <span className="sr-only">
        {t("duplicate")} {resourceType.toLowerCase()}
      </span>
    </Button>
  );
}

export { DuplicateResourceButton };
