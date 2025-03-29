import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { downloadFile } from "@/lib/utils";
import type { Attribute } from "@/types/attributes";
import type { FlattenedParticipant } from "@/types/participant";

import { downloadAttributeFile as downloadAttributeFileAction } from "../actions";

export function DownloadAttributeFileButton({
  attribute,
  eventId,
  participant,
}: {
  attribute: Attribute;
  eventId: string;
  participant: FlattenedParticipant;
}) {
  const { toast } = useToast();
  const [isQuerying, setIsQuerying] = useState(false);

  async function downloadAttributeFile() {
    try {
      setIsQuerying(true);
      const { success, file, error } = await downloadAttributeFileAction(
        eventId,
        participant.id.toString(),
        attribute.id.toString(),
      );
      setIsQuerying(false);
      if (!success) {
        toast({
          variant: "destructive",
          title: "Pobieranie pliku nie powiodło się!",
          description: error ?? "Wystąpił nieznany błąd.",
        });
        return;
      }

      if (file != null) {
        const fileExtension = file.type.split("/")[1];
        downloadFile(
          file,
          `${participant.email}-${attribute.slug ?? attribute.name}.${fileExtension}`,
        );
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
      variant="link"
      onClick={downloadAttributeFile}
      disabled={isQuerying}
      title={`Pobierz ${attribute.name} dla ${participant.email}`}
    >
      Pobierz
    </Button>
  );
}
