"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import { activateEvent } from "./actions";

function ActivateEvent({
  eventUuid,
  isActive,
  bearerToken,
}: {
  eventUuid: string;
  isActive: boolean;
  bearerToken: string;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations("Dashboard");

  const handleClick = async () => {
    const response = await activateEvent(isActive, eventUuid, bearerToken);
    if ("error" in response) {
      toast({
        title: t("error"),
        description: response.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: t("success"),
        description: isActive
          ? t("eventDeactivatedSuccess")
          : t("eventActivatedSuccess"),
      });
    }
    router.refresh();
  };

  return (
    <Button variant="outline" onClick={handleClick}>
      {t(isActive ? "deactivateEvent" : "activateEvent")}
    </Button>
  );
}
