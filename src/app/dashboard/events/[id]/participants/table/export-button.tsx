"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

import { exportData } from "@/app/dashboard/events/[id]/participants/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { downloadFile } from "@/lib/utils";

export function ExportButton({ eventId }: { eventId: string }) {
  const { toast } = useToast();
  const [isQuerying, setIsQuerying] = useState(false);

  async function handleExportClick() {
    try {
      setIsQuerying(true);
      const result = await exportData(eventId);
      setIsQuerying(false);

      if (!result.success) {
        toast({
          variant: "destructive",
          title: "Eksport nie powiódł się!",
          description: result.error ?? "Wystąpił nieznany błąd.",
        });
        return;
      }

      if (result.file != null) {
        downloadFile(result.file, "participants.xlsx");
      }
    } catch (error) {
      setIsQuerying(false);
      console.error(error);
      toast({
        variant: "destructive",
        title: "Eksport nie powiódł się!",
        description: "Spróbuj ponownie",
      });
    }
  }

  return (
    <Button
      onClick={handleExportClick}
      size="icon"
      variant="outline"
      title="Eksportuj do Excela"
      disabled={isQuerying}
    >
      {isQuerying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download />}
    </Button>
  );
}
