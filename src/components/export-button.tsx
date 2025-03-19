"use client";

import { Sheet } from "lucide-react";
import { useState } from "react";

import { exportData } from "@/app/dashboard/events/[id]/participants/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

function downloadFile(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

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
        description: String(error),
      });
    }
  }

  return (
    <Button
      onClick={handleExportClick}
      size="icon"
      variant="outline"
      title="Eksportuj"
      disabled={isQuerying}
    >
      <Sheet />
    </Button>
  );
}
