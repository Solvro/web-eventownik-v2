"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useToast } from "@/hooks/use-toast";
import { translateOrFallback } from "@/i18n/utils";
import { downloadFile } from "@/lib/utils";
import type { Attribute } from "@/types/attributes";
import type { FlattenedParticipant } from "@/types/participant";

import { downloadAttributeFile as downloadAttributeFileAction } from "../../../actions";

export function DrawingPreviewButton({
  attribute,
  eventUuid,
  participant,
}: {
  attribute: Attribute;
  eventUuid: string;
  participant: FlattenedParticipant;
}) {
  const t = useTranslations("Export");

  const { toast } = useToast();
  const [isQuerying, setIsQuerying] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl !== null) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function loadPreview() {
    if (previewUrl !== null || isLoadingPreview) {
      return;
    }

    try {
      setIsLoadingPreview(true);
      const { success, file } = await downloadAttributeFileAction(
        eventUuid,
        participant.uuid,
        attribute.uuid,
      );

      if (success && file != null) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    } catch (error) {
      console.error("Failed to load preview:", error);
    } finally {
      setIsLoadingPreview(false);
    }
  }

  async function downloadDrawing() {
    try {
      setIsQuerying(true);
      const { success, file, error } = await downloadAttributeFileAction(
        eventUuid,
        participant.uuid,
        attribute.uuid,
      );
      setIsQuerying(false);

      if (!success) {
        toast({
          variant: "destructive",
          title: t("drawingDownloadFailed"),
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
    <div className="flex items-center gap-1">
      <HoverCard onOpenChange={async (open) => open && loadPreview()}>
        <HoverCardTrigger asChild>
          <Button
            variant="link"
            size="sm"
            onClick={downloadDrawing}
            disabled={isQuerying}
            title={t("downloadForUser", {
              name: attribute.name,
              email: participant.email,
            })}
          >
            {t("download")}
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80 pointer-coarse:hidden" side="top">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">{t("drawingPreview")}</h4>
            <div className="overflow-hidden rounded-lg border bg-white">
              {isLoadingPreview ? (
                <div className="text-muted-foreground flex aspect-video h-full w-full items-center justify-center text-sm">
                  {t("loading")}
                </div>
              ) : previewUrl !== null && previewUrl !== "" ? (
                <Image
                  src={previewUrl}
                  alt={t("drawingPreview")}
                  width={320}
                  height={180}
                  className="aspect-video"
                />
              ) : (
                <div className="flex h-32 items-center justify-center text-sm text-gray-500">
                  {t("previewLoadFailed")}
                </div>
              )}
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
