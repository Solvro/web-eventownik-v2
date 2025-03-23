import type { ChangeEvent } from "react";
import type {
  ControllerRenderProps,
  FieldValues,
  UseFormResetField,
  UseFormSetError,
} from "react-hook-form";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import type { Attribute } from "@/types/attributes";

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
}: {
  field: ControllerRenderProps<FieldValues, string>;
  attribute: Attribute;
  setError: UseFormSetError<{
    email: string;
  }>;
  resetField: UseFormResetField<{
    email: string;
  }>;
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
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

  return <Input type="file" {...field} onChange={handleFileChange} />;
}
