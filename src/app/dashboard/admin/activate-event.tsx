"use client";

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

  const handleClick = async () => {
    const response = await activateEvent(isActive, eventUuid, bearerToken);
    if ("error" in response) {
      toast({
        title: "Błąd",
        description: response.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sukces",
        description: response.success,
      });
    }
    router.refresh();
  };

  return (
    <Button variant="outline" onClick={handleClick}>
      {isActive ? "Dezaktywuj" : "Aktywuj"} wydarzenie
    </Button>
  );
}

export { ActivateEvent };
