import { ArrowRight } from "lucide-react";
import type { Ref } from "react";

import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
    <div className="space-y-6 p-6 sm:p-7">
      <DialogHeader className="space-y-1.5 pr-8 text-left">
        <DialogTitle className="text-2xl font-bold tracking-tight">
          Wybierz plik CSV
        </DialogTitle>
        <DialogDescription className="text-sm">
          wybierz plik, aby go importować
        </DialogDescription>
      </DialogHeader>
      <Button
        type="button"
        className="h-11 w-full rounded-xl"
        onClick={onChooseFile}
      >
        Importuj plik
        <ArrowRight className="size-4" />
      </Button>
      <CsvFileInput ref={inputRef} onFile={onFile} />
    </div>
  );
}
