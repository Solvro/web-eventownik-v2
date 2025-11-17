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
  lastUpdate = null,
}: {
  field: ControllerRenderProps<FieldValues, string>;
  attribute: FormAttribute;
  setError: UseFormSetError<{
    email: string;
  }>;
  resetField: UseFormResetField<{
    email: string;
  }>;
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  lastUpdate: string | null;
}) {
  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file !== undefined && validateFile(file)) {
      const fileWithAttributeIdAsName = new File(
        [file],
        attribute.id.toString(),
      );
      setFiles((previousFiles) => {
        if (
          previousFiles.some(
            (existingFile) =>
              existingFile.name === fileWithAttributeIdAsName.name,
          )
        ) {
          return previousFiles;
        }
        return [...previousFiles, fileWithAttributeIdAsName];
      });
    }
  }

  function validateFile(file: File) {
    const result = fileSchema.safeParse(file);
    if (result.success) {
      /* @ts-expect-error zod schema object are dynamic */
      resetField(attribute.id.toString());
      return true;
    } else {
      /* @ts-expect-error zod schema object are dynamic */
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
        required={attribute.isRequired ? lastUpdate == null : false}
        {...field}
        onChange={handleFileChange}
      />
    </>
  );
}
