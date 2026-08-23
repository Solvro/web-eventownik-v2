import { RestrictToHorizontalAxis } from "@dnd-kit/abstract/modifiers";
import type { DragEndEvent } from "@dnd-kit/dom";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { HelpCircle, PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { translateOrFallback } from "@/i18n/translate-or-fallback";
import type { Attribute, AttributeType } from "@/types/attributes";

import { AttributeTypeOptions } from "./attribute-type-options";
import type {
  EventAttributesFormErrors,
  EventAttributesFormSchema,
} from "./schema";
import { SortableOption } from "./sortable-option";

// Required for usage of useFieldArray hook
/* eslint-disable @typescript-eslint/restrict-template-expressions */

export interface AttributeItemProps {
  attribute: Attribute;
  index: number;
  onUpdateItem?: (index: number, value: Attribute) => void;
}

const getOptionValue = (option: unknown): string => {
  if (typeof option === "string") {
    return option;
  }

  if (
    typeof option === "object" &&
    option !== null &&
    "value" in option &&
    typeof (option as { value: unknown }).value === "string"
  ) {
    return (option as { value: string }).value;
  }

  return "";
};

export function AttributeItem({
  attribute,
  index,
  onUpdateItem,
}: AttributeItemProps) {
  const t = useTranslations("EventDetails");
  const { register, formState, setValue, getValues, watch } =
    useFormContext<z.infer<typeof EventAttributesFormSchema>>();
  const [optionsInput, setOptionsInput] = useState("");

  const allAttributes = watch("attributes");

  const handleDragEnd: DragEndEvent = (event) => {
    if (event.canceled) {
      return;
    }

    const { source } = event.operation;

    if (source != null && isSortable(source)) {
      const initialIndex = source.sortable.initialIndex;
      const newIndex = source.index;

      if (initialIndex !== newIndex) {
        const oldOptions = getValues(`attributes.${index}.config.options`);
        if (oldOptions != null) {
          const newOptions = [...oldOptions];
          const [removed] = newOptions.splice(initialIndex, 1);
          newOptions.splice(newIndex, 0, removed);
          setValue(`attributes.${index}.config.options`, newOptions);
          onUpdateItem?.(index, getValues(`attributes.${index}`));
        }
      }
    }
  };

  const addOption = () => {
    const trimmedValue = optionsInput.trim();
    const oldOptions = getValues(`attributes.${index}.config.options`);
    if (trimmedValue) {
      const exists = oldOptions?.includes(trimmedValue) ?? false;
      if (!exists) {
        const newOptions = [...(oldOptions ?? []), trimmedValue];
        setValue(`attributes.${index}.config.options`, newOptions);
        setOptionsInput("");
        onUpdateItem?.(index, getValues(`attributes.${index}`));
      }
    }
  };

  const handleRemoveOption = (optionToRemove: string) => {
    setValue(
      `attributes.${index}.config.options`,
      getValues(`attributes.${index}.config.options`)?.filter(
        (o) => o !== optionToRemove,
      ) ?? [],
    );
    onUpdateItem?.(index, getValues(`attributes.${index}`));
  };

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-2 lg:flex-row">
        <div className="flex flex-1 flex-col gap-2">
          <Input
            defaultValue={attribute.name}
            {...register(`attributes.${index}.name`)}
            disabled={formState.isSubmitting}
            placeholder={t("attributeLabel")}
            className="flex-1"
            onBlur={() => {
              onUpdateItem?.(index, getValues(`attributes.${index}`));
            }}
          />
          <FormMessage className="text-sm text-red-500">
            {translateOrFallback(
              t,
              formState.errors.attributes?.[index]?.name
                ?.message as EventAttributesFormErrors,
            )}
          </FormMessage>
        </div>

        <Select
          defaultValue={attribute.type}
          onValueChange={(value: AttributeType) => {
            setValue(`attributes.${index}.type`, value);
            onUpdateItem?.(index, getValues(`attributes.${index}`));
          }}
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="max-h-62">
            <AttributeTypeOptions />
          </SelectContent>
        </Select>

        <div className="flex flex-col justify-center gap-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`showInTable-${index.toString()}`}
              onCheckedChange={(checked) => {
                setValue(`attributes.${index}.showInList`, checked === true);
                onUpdateItem?.(index, getValues(`attributes.${index}`));
              }}
              defaultChecked={attribute.showInList}
            />
            <Label htmlFor={`showInTable-${index.toString()}`}>
              {t("showInTable")}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`isSensitiveData-${index.toString()}`}
              onCheckedChange={(checked) => {
                setValue(
                  `attributes.${index}.config.isSensitiveData`,
                  checked === true,
                );
                onUpdateItem?.(index, getValues(`attributes.${index}`));
              }}
              defaultChecked={attribute.config.isSensitiveData}
            />
            <div className="flex items-center gap-2">
              <Label htmlFor={`isSensitiveData-${index.toString()}`}>
                {t("sensitiveData")}
              </Label>

              <Dialog>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={t("sensitiveDataExplanation")}
                        className="size-4"
                      >
                        <HelpCircle />
                      </Button>
                    </DialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="top">{t("tip")}</TooltipContent>
                </Tooltip>

                <DialogContent className="max-w-full md:max-w-lg lg:max-w-3xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">
                      {t("whatIsSensitiveData")}
                    </DialogTitle>
                    <div className="[&>p]:my-2 [&>p]:text-left sm:[&>p]:text-justify">
                      <p>{t("sensitiveDataDescr")}</p>
                      <p>
                        {t.rich("sensitiveDataExamples", {
                          strong: (chunks) => <strong>{chunks}</strong>,
                        })}
                      </p>
                    </div>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {watch(`attributes.${index}.config.isSensitiveData`) ? (
        <div className="my-2 flex flex-col gap-2">
          <Label htmlFor={`reason-${index.toString()}`}>
            {t("sensitiveDataReason")}
          </Label>
          <Input
            id={`reason-${index.toString()}`}
            defaultValue={attribute.config.reason ?? ""}
            required={attribute.config.isSensitiveData}
            onChange={(event_) => {
              setValue(
                `attributes.${index}.config.reason`,
                event_.target.value,
              );
            }}
            placeholder={t("sensitiveDataReasonExamples")}
            onBlur={() => {
              onUpdateItem?.(index, getValues(`attributes.${index}`));
            }}
          />
          <FormMessage className="text-sm text-red-500">
            {translateOrFallback(
              t,
              formState.errors.attributes?.[index]?.config?.reason
                ?.message as EventAttributesFormErrors,
            )}
          </FormMessage>
        </div>
      ) : null}

      {(watch(`attributes.${index}.type`) === "select" ||
        watch(`attributes.${index}.type`) === "multiSelect") && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={optionsInput}
              onChange={(event_) => {
                setOptionsInput(event_.target.value);
              }}
              placeholder={t("newOption")}
              onKeyDown={(event_) => {
                event_.key === "Enter" && addOption();
              }}
            />
            <Button variant="outline" onClick={addOption}>
              <PlusIcon className="h-4 w-4" />
              {t("addOption")}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <DragDropProvider
              onDragEnd={handleDragEnd}
              modifiers={[RestrictToHorizontalAxis]}
            >
              {watch(`attributes.${index}.config.options`)?.map(
                (option, optionIndex) => {
                  const optionValue = getOptionValue(option);
                  return (
                    <SortableOption
                      key={optionValue}
                      option={optionValue}
                      index={optionIndex}
                      onRemove={handleRemoveOption}
                    />
                  );
                },
              )}
            </DragDropProvider>
          </div>
        </div>
      )}

      {watch(`attributes.${index}.type`) === "block" && (
        <div className="space-y-2">
          <Label htmlFor={`block-attributes-${index.toString()}`}>
            {t("visibleAttributesForParticipants")}
          </Label>
          <MultiSelect
            id={`block-attributes-${index.toString()}`}
            options={[
              { label: "Email", value: "email" },
              ...(Array.isArray(allAttributes) ? allAttributes : [])
                .map((a, index_) => ({ ...a, _index: index_ }))
                .filter((a) => a._index !== index)
                .map((a) => ({ label: a.name, value: a.uuid })),
            ]}
            onValueChange={(values) => {
              setValue(`attributes.${index}.config.options`, values);
              onUpdateItem?.(index, getValues(`attributes.${index}`));
            }}
            defaultValue={(
              getValues(`attributes.${index}.config.options`) ?? []
            ).map((option) => getOptionValue(option))}
            placeholder={t("selectAttributesToDisplay")}
          />
          <p className="text-muted-foreground text-sm">
            {t("anonymousRegistrationsInfo")}
          </p>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`isMultiple-${index.toString()}`}
              onCheckedChange={(checked) => {
                setValue(
                  `attributes.${index}.config.isMultiple`,
                  checked === true,
                );
                onUpdateItem?.(index, getValues(`attributes.${index}`));
              }}
              defaultChecked={attribute.config.isMultiple}
            />
            <Label htmlFor={`isMultiple-${index.toString()}`}>
              {t("allowMultipleSelection")}
            </Label>
          </div>
        </div>
      )}

      {watch(`attributes.${index}.config.isMultiple`) === true &&
        watch(`attributes.${index}.type`) === "block" && (
          <div className="space-y-2">
            <Label htmlFor={`maxSelections-${index.toString()}`}>
              {t("maxSelectedBlocks")}
            </Label>
            <Input
              id={`maxSelections-${index.toString()}`}
              defaultValue={attribute.config.maxSelections ?? ""}
              onChange={(event_) => {
                setValue(
                  `attributes.${index}.config.maxSelections`,
                  Number.parseInt(event_.target.value),
                );
              }}
              placeholder={t("example3")}
              onBlur={() => {
                onUpdateItem?.(index, getValues(`attributes.${index}`));
              }}
              type="number"
              className="[appearance:textfield]"
            />
            <FormMessage className="text-sm text-red-500">
              {translateOrFallback(
                t,

                formState.errors.attributes?.[index]?.config?.maxSelections
                  ?.message as EventAttributesFormErrors,
              )}
            </FormMessage>
          </div>
        )}
    </div>
  );
}

AttributeItem.displayName = "AttributeItem";
