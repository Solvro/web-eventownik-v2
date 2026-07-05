"use client";

import { useQueryClient } from "@tanstack/react-query";
import { FileSpreadsheet } from "lucide-react";
import { useLocale } from "next-intl";
import { useMemo, useRef, useState } from "react";

import { importParticipants } from "@/app/dashboard/events/[id]/participants/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Attribute } from "@/types/attributes";
import type { Block } from "@/types/blocks";

import { DragOverlay } from "./import-participants/drag-overlay";
import { ImportStep } from "./import-participants/import-step";
import type { CsvData, MappingTarget } from "./import-participants/types";
import { SKIP_TARGET } from "./import-participants/types";
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
  eventId: string;
  attributes: Attribute[];
  blocks: (Block | null)[] | null;
}

export function ImportParticipantsDialog({
  eventId,
  attributes,
  blocks,
}: ImportParticipantsDialogProps) {
  const locale = useLocale();
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
  const mappedColumnsCount = Object.values(mappings).filter(
    (target) => target !== SKIP_TARGET,
  ).length;
  const validationMessages = getValidationMessages(preparedImport);

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

  async function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast({
        variant: "destructive",
        title: "Nieobsługiwany plik",
        description: "Wybierz plik CSV.",
      });
      return;
    }

    const text = await file.text();
    const parsed = parseCsv(text, file.name);
    setCsvData(parsed);
    setMappings(guessInitialMappings(parsed.headers, importableAttributes));
  }

  function handleMappingChange(columnIndex: number, target: MappingTarget) {
    setMappings((previous) => ({
      ...previous,
      [columnIndex]: target,
    }));
  }

  function handleDialogDragEnter(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!event.dataTransfer.types.includes("Files")) {
      return;
    }

    dragDepthRef.current += 1;
    setDragActive(true);
  }

  function handleDialogDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer.types.includes("Files")) {
      event.dataTransfer.dropEffect = "copy";
      setDragActive(true);
    }
  }

  function handleDialogDragLeave(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) {
      setDragActive(false);
    }
  }

  function handleDialogDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    dragDepthRef.current = 0;
    setDragActive(false);

    const file = event.dataTransfer.files.item(0);
    if (file != null) {
      void handleFile(file);
    }
  }

  async function submitImport() {
    if (!canImport) {
      return;
    }

    setIsImporting(true);
    try {
      const result = await importParticipants(
        eventId,
        preparedImport.participants,
      );
      if (!result.success) {
        toast({
          variant: "destructive",
          title: "Import nie powiódł się",
          description: result.error,
        });
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: ["participants", eventId],
      });
      setOpen(false);
      resetDialogState();
      if (result.warning != null) {
        toast({
          title: "Import częściowo zakończony",
          description:
            result.warning.details == null
              ? `${result.warning.message}\nPominięto: ${result.warning.emails
                  .slice(0, 5)
                  .join(", ")}.`
              : `${result.warning.message}\n${result.warning.details}`,
        });
        return;
      }

      toast({
        title: "Zaimportowano uczestników",
        description: `Dodano ${preparedImport.participants.length.toString()} wierszy.`,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Import nie powiódł się",
        description: "Wystąpił nieoczekiwany błąd.",
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
          size="sm"
          className="h-9 gap-2 rounded-xl px-3"
          aria-label="Importuj uczestników z CSV"
        >
          <FileSpreadsheet className="size-4" />
          <span className="max-md:sr-only">Importuj uczestników</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "bg-background text-foreground gap-0 overflow-hidden p-0 shadow-2xl",
          csvData == null
            ? "w-[min(21rem,calc(100vw-1rem))] rounded-2xl sm:w-100"
            : "h-[min(40rem,calc(100dvh-1rem))] w-[calc(100vw-1rem)] max-w-none rounded-2xl md:w-[min(64rem,calc(100vw-2rem))]",
        )}
        onDragEnter={handleDialogDragEnter}
        onDragOver={handleDialogDragOver}
        onDragLeave={handleDialogDragLeave}
        onDrop={handleDialogDrop}
      >
        <div
          className={cn("relative", csvData == null ? "" : "h-full min-h-0")}
        >
          {dragActive ? <DragOverlay hasCsvData={csvData != null} /> : null}
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
              mappedColumnsCount={mappedColumnsCount}
              canImport={canImport}
              isImporting={isImporting}
              blockingIssuesCount={blockingIssuesCount}
              validationMessages={validationMessages}
              onChooseFile={chooseFile}
              onFile={handleFile}
              onMappingChange={handleMappingChange}
              onSubmit={() => void submitImport()}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
