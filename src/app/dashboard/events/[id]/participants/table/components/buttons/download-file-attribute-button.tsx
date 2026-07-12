import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { translateOrFallback } from "@/i18n/translate-or-fallback";
import { downloadFile } from "@/lib/utils";
import type { Attribute } from "@/types/attributes";
import type { FlattenedParticipant } from "@/types/participant";

import { downloadAttributeFile as downloadAttributeFileAction } from "../../../actions";

export function DownloadAttributeFileButton({
  attribute,
  eventId,
  participant,
}: {
  attribute: Attribute;
  eventId: string;
  participant: FlattenedParticipant;
}) {
  const t = useTranslations("Export");

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
          title: t("fileDownloadFailed"),
          description: translateOrFallback(t, error?.key) ?? t("unknownError"),
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
        title: t("downloadFailed"),
        description: t("tryAgain"),
      });
    }
  }

  return (
    <Button
      variant="link"
      onClick={downloadAttributeFile}
      disabled={isQuerying}
      title={t("downloadForUser", {
        name: attribute.name,
        email: participant.email,
      })}
    >
      {t("download")}
    </Button>
  );
}
