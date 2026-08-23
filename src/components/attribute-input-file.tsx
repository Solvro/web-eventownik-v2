import { useTranslations } from "next-intl";
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
      message: JSON.stringify({
        key: "allowedFileTypes",
        values: {
          extensions: Object.keys(EXTENSION_TO_MIME_TYPE).join(", "),
        },
      }),
    },
  )
  .refine(
    (file: File) => {
      return file.size <= MAX_FILE_SIZE_MB;
    },
    {
      message: JSON.stringify({
        key: "maxFileSize",
        values: {
          maxSize: MAX_FILE_SIZE_MB / 1024 / 1024,
        },
      }),
    },
  );

interface FileValidationErrorMessage {
  key: "allowedFileTypes" | "maxFileSize";
  values: Record<string, string | number>;
}

function parseFileValidationErrorMessage(
  message: string,
): FileValidationErrorMessage | null {
  try {
    return JSON.parse(message) as FileValidationErrorMessage;
  } catch {
    return null;
  }
}

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
  const t = useTranslations("EventDetails");

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file === undefined) {
      setFiles((previousFiles) =>
        previousFiles.filter(
          (existingFile) => existingFile.name !== attribute.uuid,
        ),
      );

      return;
    }

    if (validateFile(file)) {
      const fileWithattributeUuidAsName = new File([file], attribute.uuid);
      setFiles((previousFiles) => {
        const filtered = previousFiles.filter(
          (existingFile) =>
            existingFile.name !== fileWithattributeUuidAsName.name,
        );
        return [...filtered, fileWithattributeUuidAsName];
      });
    }
  }

  function validateFile(file: File) {
    const result = fileSchema.safeParse(file);
    if (result.success) {
      resetField(attribute.uuid);
      return true;
    } else {
      const zodIssue = result.error.errors[0];
      const parsedMessage = parseFileValidationErrorMessage(zodIssue.message);

      setError(attribute.uuid, {
        message:
          parsedMessage === null
            ? zodIssue.message
            : t(parsedMessage.key, parsedMessage.values),
      });
      return false;
    }
  }

  return (
    <>
      {lastUpdate != null && (
        <div className="mb-2">
          <span className="text-sm text-gray-500">
            {t("lastUploadedFile", {
              date: new Date(lastUpdate).toLocaleString(),
            })}
          </span>
        </div>
      )}
      <Input
        type="file"
        id={attribute.uuid}
        {...field}
        onChange={handleFileChange}
      />
    </>
  );
}
