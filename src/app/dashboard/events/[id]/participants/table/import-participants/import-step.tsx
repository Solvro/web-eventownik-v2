import { ListChecks } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Ref } from "react";

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
  canImport: boolean;
  isImporting: boolean;
  blockingIssuesCount: number;
  validationMessages: string[];
  onChooseFile: () => void;
  onFile: (file: File) => void | Promise<void>;
  onMappingChange: (columnIndex: number, target: MappingTarget) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export function ImportStep({
  csvData,
  mappings,
  attributes,
  locale,
  inputRef,
  canImport,
  isImporting,
  blockingIssuesCount,
  validationMessages,
  onChooseFile,
  onFile,
  onMappingChange,
  onBack,
  onSubmit,
}: ImportStepProps) {
  const t = useTranslations("ImportParticipants");

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-6">
      <p className="absolute -mt-0.5 text-sm">2/2</p>
      <div className="flex w-full flex-col items-center gap-4">
        <div className="flex rounded-full border border-neutral-300 p-3">
          <ListChecks />
        </div>
        <div className="space-y-1 text-center">
          <p className="text-neutral-500">{t("step2")}</p>
          <p className="text-lg font-medium">{t("mapColumnsTitle")}</p>
        </div>
      </div>

      <div className="relative grid min-h-0 flex-1 grid-rows-[minmax(9rem,0.42fr)_minmax(0,1fr)] overflow-hidden p-px md:grid-cols-[minmax(23rem,0.95fr)_minmax(22rem,1fr)] md:grid-rows-1">
        <CsvPreview csvData={csvData} />

        <section className="min-h-0 overflow-hidden">
          <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-3 px-4 sm:px-5">
            <div className="min-w-0">
              <button
                type="button"
                className="text-primary min-w-0 truncate text-left text-sm underline underline-offset-4"
                onClick={onChooseFile}
              >
                {t("selectedFile", { fileName: csvData.fileName })}
              </button>
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
              onBack={onBack}
              onSubmit={onSubmit}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
