import { format } from "date-fns";
import { useLocale } from "next-intl";
import { useState } from "react";
import type { ControllerRenderProps, FieldValues } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getAttributeLabel } from "@/lib/utils";
import type { Attribute, FormAttribute } from "@/types/attributes";
import type { PublicBlock } from "@/types/blocks";
import type { PublicParticipant } from "@/types/participant";

import { AttributeBlocksWrapper } from "./attribute-blocks-wrapper";

export function AttributeInput({
  attribute,
  userData,
  eventBlocks,
  field,
}: {
  attribute: Attribute | FormAttribute;
  userData?: PublicParticipant;
  eventBlocks?: PublicBlock[];
  field: ControllerRenderProps<FieldValues, string>;
}) {
  const locale = useLocale();
  const [isOtherSelected, setIsOtherSelected] = useState(false);

  const [otherInputValue, setOtherInputValue] = useState<string>(() => {
    return (
      ((field.value ?? []) as string[]).find(
        (v) => !(attribute.options ?? []).includes(v),
      ) ?? ""
    );
  });
  //TODO add lacking implementation for block type
  switch (attribute.type) {
    case "text": {
      return <Input type="text" id={attribute.id.toString()} {...field} />;
    }
    case "number": {
      return (
        <Input
          type="number"
          onWheel={(event) => {
            event.currentTarget.blur();
          }}
          id={attribute.id.toString()}
          {...field}
        />
      );
    }
    case "select": {
      return (
        <>
          <Select
            onValueChange={(value) => {
              if (value === "other" && !isOtherSelected) {
                setIsOtherSelected(true);
                field.onChange("");
              } else {
                setIsOtherSelected(false);
                field.onChange(value);
              }
            }}
            {...field}
            value={isOtherSelected ? "other" : (field.value as string)}
          >
            <SelectTrigger id={attribute.id.toString()}>
              <SelectValue
                placeholder={`${locale === "en" ? "Select" : "Wybierz"} ${getAttributeLabel(attribute.name, locale).toLowerCase()}`}
              />
            </SelectTrigger>
            <SelectContent>
              {attribute.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
              {/* 
            This hacky solution allows for setting "empty" option/ "unchecking" option
            Filtering logic is based on this value (" ")
            Feel free to propose better solution
            */}
              {attribute.allowOther ? (
                <SelectItem value="other">
                  {locale === "en" ? "Other" : "Inne"}
                </SelectItem>
              ) : null}

              {!("isRequired" in attribute ? attribute.isRequired : false) && (
                <SelectItem value={" "}>
                  {locale === "en" ? "None" : "Brak"}
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          {attribute.allowOther && isOtherSelected ? (
            <Input
              type="text"
              placeholder={
                locale === "en" ? "Enter your answer" : "Wpisz własną odpowiedź"
              }
              value={field.value as string}
              onChange={(event) => {
                field.onChange(event.target.value);
              }}
            />
          ) : null}
        </>
      );
    }
    case "multiselect": {
      const selectedOptions = ((field.value ?? []) as string[]).filter(
        (v) => (attribute.options ?? []).includes(v) && v !== otherInputValue,
      );

      return (
        <div className="border-input flex w-full flex-col rounded-xl border bg-transparent px-4 py-3 text-lg shadow-xs transition-colors">
          {attribute.options?.map((option) => (
            <div key={option} className="mb-2 flex items-center space-x-2">
              <Checkbox
                id={`${attribute.id.toString()}-${option}`}
                disabled={field.disabled}
                checked={selectedOptions.includes(option)}
                onCheckedChange={(checked) => {
                  if (checked === true) {
                    field.onChange([
                      ...new Set([
                        ...selectedOptions,
                        option,
                        ...(otherInputValue ? [otherInputValue] : []),
                      ]),
                    ]);
                  } else {
                    const newValues = selectedOptions.filter(
                      (value) => value !== option,
                    );
                    field.onChange(
                      newValues.length > 0 || otherInputValue
                        ? [
                            ...newValues,
                            ...(otherInputValue ? [otherInputValue] : []),
                          ]
                        : undefined,
                    );
                  }
                }}
              />
              <Label htmlFor={`${attribute.id.toString()}-${option}`}>
                {option}
              </Label>
            </div>
          ))}

          {attribute.allowOther ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${attribute.id.toString()}-other`}
                  checked={isOtherSelected}
                  onCheckedChange={(checked) => {
                    setIsOtherSelected(checked === true);

                    if (checked === true) {
                      field.onChange([
                        ...new Set([...selectedOptions, otherInputValue]),
                      ]);
                    } else {
                      field.onChange(
                        selectedOptions.length > 0
                          ? selectedOptions
                          : undefined,
                      );

                      setOtherInputValue("");
                    }
                  }}
                />
                <Label htmlFor={`${attribute.id.toString()}-other`}>
                  {locale === "en" ? "Other" : "Inne"}
                </Label>
              </div>

              {isOtherSelected ? (
                <Input
                  type="text"
                  placeholder={
                    locale === "en"
                      ? "Enter your answer"
                      : "Wpisz własną odpowiedź"
                  }
                  value={otherInputValue}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    const newValue = event.target.value;
                    setOtherInputValue(newValue);

                    field.onChange([
                      ...new Set([...selectedOptions, newValue]),
                    ]);
                  }}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      );
    }
    case "email": {
      return <Input type="email" id={attribute.id.toString()} {...field} />;
    }
    case "date": {
      if (
        field.value !== undefined &&
        field.value !== null &&
        field.value !== ""
      ) {
        // It may break some features
        field.value = format(field.value as Date, "yyyy-MM-dd");
      }
      return <Input type="date" id={attribute.id.toString()} {...field} />;
    }
    case "datetime": {
      if (
        field.value !== undefined &&
        field.value !== null &&
        field.value !== ""
      ) {
        field.value = format(field.value as Date, "yyyy-MM-dd HH:mm");
      }
      return (
        <Input type="datetime-local" id={attribute.id.toString()} {...field} />
      );
    }
    case "time": {
      return <Input type="time" id={attribute.id.toString()} {...field} />;
    }
    case "color": {
      return (
        <Input
          type="color"
          className="h-16 w-full"
          id={attribute.id.toString()}
          {...field}
        />
      );
    }
    case "textarea": {
      return <Textarea rows={3} id={attribute.id.toString()} {...field} />;
    }
    case "checkbox": {
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={attribute.id.toString()}
            checked={field.value === "true" || field.value === true}
            onCheckedChange={(checked) => {
              field.onChange(checked);
            }}
          />
          {/*<Label htmlFor={field.name}>{attribute.label || field.name}</Label>*/}
        </div>
      );
    }
    case "tel": {
      return (
        <Input
          id={attribute.id.toString()}
          type="tel"
          pattern="^(\+\d{1,3})?\s?\d{3}\s?\d{3}\s?\d{3,4}$"
          maxLength={16}
          {...field}
        />
      );
    }
    case "file": {
      // Handled in ./attribute-input-file.tsx
      break;
    }
    case "drawing": {
      // Handled in ./attribute-input-drawing.tsx
      break;
    }
    case "block": {
      if (eventBlocks === undefined || userData === undefined) {
        return (
          <div>
            Nie udało się pobrać danych o tym bloku lub o twoich atrybutach 😪
          </div>
        );
      }
      return (
        <>
          {eventBlocks.map((rootBlock) => (
            <AttributeBlocksWrapper
              key={rootBlock.id}
              field={field}
              userData={userData}
              eventBlocks={rootBlock.children}
              attribute={attribute}
            />
          ))}
        </>
      );
    }
  }
}
