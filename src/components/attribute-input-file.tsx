import type { ChangeEvent } from "react";
import type {
  ControllerRenderProps,
  FieldValues,
  UseFormResetField,
  UseFormSetError,
} from "react-hook-form";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import type { FormAttribute } from "@/types/attributes";

const EXTENSION_TO_MIME_TYPE = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  pdf: "application/pdf",
};

const MAX_FILE_SIZE_MB = 10 * 1024 * 1024;

const fileSchema = z
  .instanceof(File)
  .refine(
    (file: File) => {
      return Object.values(EXTENSION_TO_MIME_TYPE).includes(file.type);
    },
    {
      message: `Dozwolone typy plików to: ${Object.keys(EXTENSION_TO_MIME_TYPE).join(", ")}`,
    },
  )
  .refine(
    (file: File) => {
      return file.size <= MAX_FILE_SIZE_MB;
    },
    {
      message: `Maksymalny rozmiar pliku to ${(MAX_FILE_SIZE_MB / 1024 / 1024).toString()} MB`,
    },
  );

export function AttributeInputFile({
  field,
  attribute,
  setError,
  resetField,
  setFiles,
  lastUpdate,
}: {
  field: ControllerRenderProps<FieldValues, string>;
  attribute: FormAttribute;
  setError: UseFormSetError<FieldValues>;
  resetField: UseFormResetField<FieldValues>;
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  lastUpdate: string | null;
}) {
  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file === undefined) {
      setFiles((previousFiles) =>
        previousFiles.filter(
          (existingFile) => existingFile.name !== attribute.id.toString(),
        ),
      );
      return;
    }

    if (validateFile(file)) {
      const fileWithAttributeIdAsName = new File(
        [file],
        attribute.id.toString(),
      );
      setFiles((previousFiles) => {
        const filtered = previousFiles.filter(
          (existingFile) =>
            existingFile.name !== fileWithAttributeIdAsName.name,
        );
        return [...filtered, fileWithAttributeIdAsName];
      });
    }
  }

  function validateFile(file: File) {
    const result = fileSchema.safeParse(file);
    if (result.success) {
      resetField(attribute.id.toString());
      return true;
    } else {
      setError(attribute.id.toString(), {
        message: result.error.errors[0].message,
      });
      return false;
    }
  }

  return (
    <>
      {lastUpdate != null && (
        <div className="mb-2">
          <span className="text-sm text-gray-500">
            Ostatnio wgrany plik: {new Date(lastUpdate).toLocaleString()}
          </span>
        </div>
      )}
      <Input
        type="file"
        id={attribute.id.toString()}
        {...field}
        onChange={handleFileChange}
      />
    </>
  );
}
