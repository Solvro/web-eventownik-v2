import type { Ref } from "react";

import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Attribute } from "@/types/attributes";

import { ColumnMappingList } from "./column-mapping-list";
import { CsvFileInput } from "./csv-file-input";
import { CsvPreview } from "./csv-preview";
import { ImportFooter } from "./import-footer";
import type { CsvData, MappingTarget } from "./types";

interface ImportStepProps {
  csvData: CsvData;
  mappings: Record<number, MappingTarget>;
  attributes: Attribute[];
  locale: string;
  inputRef: Ref<HTMLInputElement>;
  mappedColumnsCount: number;
  canImport: boolean;
  isImporting: boolean;
  blockingIssuesCount: number;
  validationMessages: string[];
  onChooseFile: () => void;
  onFile: (file: File) => void | Promise<void>;
  onMappingChange: (columnIndex: number, target: MappingTarget) => void;
  onSubmit: () => void;
}

export function ImportStep({
  csvData,
  mappings,
  attributes,
  locale,
  inputRef,
  mappedColumnsCount,
  canImport,
  isImporting,
  blockingIssuesCount,
  validationMessages,
  onChooseFile,
  onFile,
  onMappingChange,
  onSubmit,
}: ImportStepProps) {
  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)]">
      <DialogHeader className="border-border border-b px-5 py-4 pr-12 text-left sm:px-7 sm:py-5">
        <DialogTitle className="text-xl font-bold tracking-tight sm:text-2xl">
          Importuj uczestników z pliku CSV
        </DialogTitle>
        <DialogDescription className="text-sm">
          Wybierz niżej, aby przydzielić kolumny z pliku do atrybutów.
        </DialogDescription>
      </DialogHeader>

      <div className="grid min-h-0 grid-rows-[minmax(9rem,0.42fr)_minmax(0,1fr)] md:grid-cols-[minmax(23rem,0.95fr)_minmax(22rem,1fr)] md:grid-rows-1">
        <CsvPreview csvData={csvData} />

        <section className="min-h-0 overflow-hidden">
          <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-3 p-4 sm:p-5">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <button
                type="button"
                className="text-primary min-w-0 truncate text-left text-sm underline underline-offset-4"
                onClick={onChooseFile}
              >
                Wybrany plik: {csvData.fileName}
              </button>
              <span className="text-muted-foreground shrink-0 text-xs">
                {mappedColumnsCount.toString()} /{" "}
                {csvData.headers.length.toString()}
              </span>
            </div>
            <CsvFileInput ref={inputRef} onFile={onFile} />

            <ColumnMappingList
              headers={csvData.headers}
              mappings={mappings}
              attributes={attributes}
              locale={locale}
              onMappingChange={onMappingChange}
            />

            <ImportFooter
              canImport={canImport}
              isImporting={isImporting}
              blockingIssuesCount={blockingIssuesCount}
              validationMessages={validationMessages}
              onChooseFile={onChooseFile}
              onSubmit={onSubmit}
            />
          </div>
        </section>
      </div>
      {isImporting ? (
        <div className="bg-primary absolute bottom-0 left-0 h-1 w-2/3 animate-pulse" />
      ) : null}
    </div>
  );
}
