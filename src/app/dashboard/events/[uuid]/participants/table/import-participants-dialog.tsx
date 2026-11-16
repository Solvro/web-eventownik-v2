"use client";

import { useQueryClient } from "@tanstack/react-query";
import { FileSpreadsheet } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { importParticipants } from "@/app/dashboard/events/[uuid]/participants/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Attribute } from "@/types/attributes";
import type { Block } from "@/types/blocks";

import { DragOverlay } from "./import-participants/drag-overlay";
import { ImportStep } from "./import-participants/import-step";
import type { CsvData, MappingTarget } from "./import-participants/types";
import { UploadStep } from "./import-participants/upload-step";
import {
  getValidationMessages,
  guessInitialMappings,
  parseCsv,
  prepareImport,
} from "./import-participants/utils";

export function getSelectableBlocks(blocks: (Block | null)[] | null): Block[] {
  const selectableBlocks: Block[] = [];
  for (const block of blocks ?? []) {
    if (block != null) {
      selectableBlocks.push(...block.children);
    }
  }

  return selectableBlocks;
}

interface ImportParticipantsDialogProps {
  eventUuid: string;
  attributes: Attribute[];
  blocks: (Block | null)[] | null;
}

export function ImportParticipantsDialog({
  eventUuid,
  attributes,
  blocks,
}: ImportParticipantsDialogProps) {
  const locale = useLocale();
  const t = useTranslations("ImportParticipants");
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepthRef = useRef(0);
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [csvData, setCsvData] = useState<CsvData | null>(null);
  const [mappings, setMappings] = useState<Record<number, MappingTarget>>({});
  const [dragActive, setDragActive] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const importableAttributes = useMemo(
    () =>
      attributes.filter(
        (attribute) =>
          attribute.type !== "file" && attribute.type !== "drawing",
      ),
    [attributes],
  );
  const selectableBlocks = useMemo(() => getSelectableBlocks(blocks), [blocks]);
  const preparedImport = useMemo(
    () =>
      prepareImport({
        csvData,
        mappings,
        attributes: importableAttributes,
        blocks: selectableBlocks,
        locale,
      }),
    [csvData, mappings, importableAttributes, selectableBlocks, locale],
  );

  const blockingIssuesCount =
    preparedImport.issues.length +
    preparedImport.duplicateTargets.length +
    preparedImport.missingRequiredTargets.length;
  const canImport =
    csvData != null &&
    preparedImport.participants.length > 0 &&
    preparedImport.issues.length === 0 &&
    preparedImport.duplicateTargets.length === 0 &&
    preparedImport.missingRequiredTargets.length === 0 &&
    !isImporting;
  const validationMessages = getValidationMessages(
    preparedImport,
    (key, values) => t(key, values),
  );

  function chooseFile() {
    inputRef.current?.click();
  }

  function resetDialogState() {
    dragDepthRef.current = 0;
    setCsvData(null);
    setMappings({});
    setDragActive(false);
    setIsImporting(false);
    if (inputRef.current != null) {
      inputRef.current.value = "";
    }
  }

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith(".csv")) {
        toast({
          variant: "destructive",
          title: t("unsupportedFileTitle"),
          description: t("unsupportedFileDescription"),
        });
        return;
      }

      const text = await file.text();
      const parsed = parseCsv(text, file.name);
      setCsvData(parsed);
      setMappings(guessInitialMappings(parsed.headers, importableAttributes));
    },
    [importableAttributes, t, toast],
  );

  function handleMappingChange(columnIndex: number, target: MappingTarget) {
    setMappings((previous) => ({
      ...previous,
      [columnIndex]: target,
    }));
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    function hasFiles(event: DragEvent) {
      return event.dataTransfer?.types.includes("Files") === true;
    }

    function handleDragEnter(event: DragEvent) {
      if (!hasFiles(event)) {
        return;
      }

      event.preventDefault();
      dragDepthRef.current += 1;
      setDragActive(true);
    }

    function handleDragOver(event: DragEvent) {
      if (!hasFiles(event) || event.dataTransfer == null) {
        return;
      }

      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
      setDragActive(true);
    }

    function handleDragLeave(event: DragEvent) {
      if (dragDepthRef.current === 0) {
        return;
      }

      event.preventDefault();
      dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
      if (dragDepthRef.current === 0) {
        setDragActive(false);
      }
    }

    function handleDrop(event: DragEvent) {
      if (!hasFiles(event) || event.dataTransfer == null) {
        return;
      }

      event.preventDefault();
      dragDepthRef.current = 0;
      setDragActive(false);

      const file = event.dataTransfer.files.item(0);
      if (file != null) {
        void handleFile(file);
      }
    }

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
      dragDepthRef.current = 0;
    };
  }, [handleFile, open]);

  async function submitImport() {
    if (!canImport) {
      return;
    }

    setIsImporting(true);
    try {
      const result = await importParticipants(
        eventUuid,
        preparedImport.participants,
      );
      if (!result.success) {
        toast({
          variant: "destructive",
          title: t("importFailedTitle"),
          description: result.error,
        });
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: ["participants", eventUuid],
      });
      setOpen(false);
      resetDialogState();
      if (result.warning != null) {
        toast({
          title: t("partialImportTitle"),
          description:
            result.warning.details == null
              ? `${result.warning.message}\n${t("skippedEmails", {
                  emails: result.warning.emails.slice(0, 5).join(", "),
                })}`
              : `${result.warning.message}\n${result.warning.details}`,
        });
        return;
      }

      toast({
        title: t("importSuccessTitle"),
        description: t("importSuccessDescription", {
          count: preparedImport.participants.length,
        }),
      });
    } catch {
      toast({
        variant: "destructive",
        title: t("importFailedTitle"),
        description: t("unexpectedError"),
      });
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          resetDialogState();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-10"
          aria-label={t("triggerLabel")}
        >
          <FileSpreadsheet />
          <span className="max-md:sr-only">{t("triggerText")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "bg-background text-foreground overflow-hidden shadow-2xl",
          csvData == null
            ? "w-[min(21rem,calc(100vw-1rem))] rounded-2xl sm:w-100"
            : "h-[min(40rem,calc(100dvh-1rem))] w-[calc(100vw-1rem)] max-w-none rounded-2xl md:w-[min(64rem,calc(100vw-2rem))]",
        )}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{t("dialogTitle")}</DialogTitle>
          <DialogDescription>{t("dialogDescription")}</DialogDescription>
        </DialogHeader>
        <div
          className={cn("relative", csvData == null ? "" : "h-full min-h-0")}
        >
          {csvData == null ? (
            <UploadStep
              inputRef={inputRef}
              onChooseFile={chooseFile}
              onFile={handleFile}
            />
          ) : (
            <ImportStep
              csvData={csvData}
              mappings={mappings}
              attributes={importableAttributes}
              locale={locale}
              inputRef={inputRef}
              canImport={canImport}
              isImporting={isImporting}
              blockingIssuesCount={blockingIssuesCount}
              validationMessages={validationMessages}
              onChooseFile={chooseFile}
              onFile={handleFile}
              onMappingChange={handleMappingChange}
              onBack={resetDialogState}
              onSubmit={() => void submitImport()}
            />
          )}
        </div>
      </DialogContent>
      {open
        ? createPortal(
            <AnimatePresence>
              {dragActive ? (
                <DragOverlay key="drag-overlay" hasCsvData={csvData != null} />
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </Dialog>
  );
}
