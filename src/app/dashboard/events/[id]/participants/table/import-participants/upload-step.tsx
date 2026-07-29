import { ArrowRight, FileSpreadsheet } from "lucide-react";
import type { Ref } from "react";

import { FormContainer } from "@/components/forms/form-container";
import { Button } from "@/components/ui/button";

import { CsvFileInput } from "./csv-file-input";

interface UploadStepProps {
  inputRef: Ref<HTMLInputElement>;
  onChooseFile: () => void;
  onFile: (file: File) => void | Promise<void>;
}

export function UploadStep({
  inputRef,
  onChooseFile,
  onFile,
}: UploadStepProps) {
  return (
    <FormContainer
      step="1/2"
      title="Krok 1"
      description="Wybierz plik CSV"
      icon={<FileSpreadsheet />}
    >
      <div className="space-y-4">
        <p className="text-muted-foreground text-center text-sm">
          Wybierz plik z uczestnikami, aby przejść do dopasowania kolumn.
        </p>
        <Button
          type="button"
          className="h-11 w-full rounded-xl"
          onClick={onChooseFile}
        >
          <ArrowRight className="size-4" />
          Importuj plik
        </Button>
        <CsvFileInput ref={inputRef} onFile={onFile} />
      </div>
    </FormContainer>
  );
}
