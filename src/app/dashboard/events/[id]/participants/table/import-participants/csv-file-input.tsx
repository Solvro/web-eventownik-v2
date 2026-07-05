import { forwardRef } from "react";

import { Input } from "@/components/ui/input";

interface CsvFileInputProps {
  onFile: (file: File) => void | Promise<void>;
}

export const CsvFileInput = forwardRef<HTMLInputElement, CsvFileInputProps>(
  ({ onFile }, ref) => (
    <Input
      ref={ref}
      className="hidden"
      type="file"
      accept=".csv,text/csv"
      aria-label="Wybierz plik CSV z uczestnikami"
      onChange={(event) => {
        const file = event.target.files?.[0];
        if (file != null) {
          void onFile(file);
        }
      }}
    />
  ),
);

CsvFileInput.displayName = "CsvFileInput";
