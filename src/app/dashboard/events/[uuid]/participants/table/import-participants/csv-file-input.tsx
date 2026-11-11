import { useTranslations } from "next-intl";
import { forwardRef } from "react";

import { Input } from "@/components/ui/input";

interface CsvFileInputProps {
  onFile: (file: File) => void | Promise<void>;
}

export const CsvFileInput = forwardRef<HTMLInputElement, CsvFileInputProps>(
  ({ onFile }, ref) => {
    const t = useTranslations("ImportParticipants");

    return (
      <Input
        ref={ref}
        className="hidden"
        type="file"
        accept=".csv,text/csv"
        aria-label={t("chooseFileInputLabel")}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file != null) {
            void onFile(file);
          }
        }}
      />
    );
  },
);

CsvFileInput.displayName = "CsvFileInput";
