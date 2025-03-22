import type { ChangeEvent } from "react";
import { useState } from "react";
import type {
  ControllerRenderProps,
  FieldValues,
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

const MAX_FILE_SIZE_MB = 1 * 1024 * 1024;

const fileSchema = z
  .instanceof(File)
  .refine(
    (file: File) => {
      console.log("Value received:", file);
      return Object.values(EXTENSION_TO_MIME_TYPE).includes(file.type);
    },
    {
      message: `Dozwolone typy plików to: ${Object.keys(EXTENSION_TO_MIME_TYPE).join(", ")}`,
    },
  )
  .refine(
    (file: File) => {
      console.log("Value received:", file);
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
}: {
  field: ControllerRenderProps<FieldValues, string>;
  attribute: Attribute;
  setError: UseFormSetError<{
    email: string;
  }>;
}) {
  const [file, setFile] = useState<File | null>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const _file = event.target.files?.[0];
    if (_file !== undefined && validateFile(_file)) {
      setFile(_file);
    } else {
      setFile(null);
    }
  }

  function validateFile(_file: File) {
    const result = fileSchema.safeParse(_file);
    if (result.success) {
      setError(attribute.id.toString(), { message: "" });

      return true;
    } else {
      setError(attribute.id.toString(), {
        message: result.error.errors[0].message,
      });
      return false;
    }
  }

  return <Input type="file" {...field} onChange={handleFileChange} />;
}
