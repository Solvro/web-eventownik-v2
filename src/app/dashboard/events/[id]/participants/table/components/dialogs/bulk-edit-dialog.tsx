"use client";

/* eslint-disable unicorn/prevent-abbreviations */
import type { Table } from "@tanstack/react-table";
import { format } from "date-fns";
import { Loader, PencilLine } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import type { Attribute } from "@/types/attributes";
import type { Block } from "@/types/blocks";
import type { FlattenedParticipant } from "@/types/participant";

import { updateParticipant } from "../../../actions";

interface BulkEditDialogProps {
  table: Table<FlattenedParticipant>;
  attributes: Attribute[];
  blocks: (Block | null)[];
  eventId: string;
}

export function BulkEditDialog({
  table,
  attributes,
  blocks,
  eventId,
}: BulkEditDialogProps) {
  const t = useTranslations("Table");
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedAttributeId, setSelectedAttributeId] = useState<string>("");
  const [value, setValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const selectedRows = table.getSelectedRowModel().rows;
  const editableAttributes = attributes.filter(
    (a) => a.type !== "file" && a.type !== "drawing",
  );
  const selectedAttribute = editableAttributes.find(
    (a) => a.id.toString() === selectedAttributeId,
  );

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSelectedAttributeId("");
      setValue("");
    }
  }

  function handleAttributeChange(attributeId: string) {
    setSelectedAttributeId(attributeId);
    setValue("");
  }

  async function handleSave() {
    if (selectedAttribute == null || selectedRows.length === 0) {
      return;
    }

    setIsSaving(true);

    const results = await Promise.allSettled(
      selectedRows.map(async (row) => {
        const attributeValues: Record<number, string> = {
          [selectedAttribute.id]: value,
        };
        return updateParticipant(
          attributeValues,
          eventId,
          row.original.id.toString(),
        );
      }),
    );

    const failedCount = results.filter(
      (r) => r.status === "rejected" || !r.value.success,
    ).length;

    setIsSaving(false);

    if (failedCount === 0) {
      toast({ title: t("bulkEditSuccess") });
      for (const row of selectedRows) {
        table.options.meta?.updateData(row.index, {
          ...row.original,
          [selectedAttribute.id.toString()]: value,
        });
      }
      setOpen(false);
      setSelectedAttributeId("");
      setValue("");
    } else {
      toast({
        variant: "destructive",
        title: t("bulkEditError"),
      });
    }
  }

  if (selectedRows.length === 0) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            disabled={true}
            className="hover:cursor-not-allowed disabled:pointer-events-auto"
          >
            <PencilLine />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t("bulkEditTooltip")}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <PencilLine />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          {t("bulkEditSelectedTooltip", { count: selectedRows.length })}
        </TooltipContent>
      </Tooltip>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("bulkEditTitle")}</DialogTitle>
          <DialogDescription>
            {t("bulkEditDescription", { count: selectedRows.length })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label>{t("bulkEditAttributeLabel")}</Label>
            <Select
              value={selectedAttributeId}
              onValueChange={handleAttributeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("bulkEditAttributePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {editableAttributes.map((attr) => (
                  <SelectItem key={attr.id} value={attr.id.toString()}>
                    {attr.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedAttribute != null && (
            <div className="flex flex-col gap-2">
              <Label>{t("bulkEditValueLabel")}</Label>
              <BulkAttributeInput
                attribute={selectedAttribute}
                blocks={blocks}
                value={value}
                onChange={setValue}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t("bulkEditCancel")}</Button>
          </DialogClose>
          <Button
            disabled={isSaving || selectedAttribute == null}
            onClick={() => {
              void handleSave();
            }}
          >
            {isSaving ? <Loader className="animate-spin" /> : null}
            {t("bulkEditSave")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BulkAttributeInput({
  attribute,
  blocks,
  value,
  onChange,
}: {
  attribute: Attribute;
  blocks: (Block | null)[];
  value: string;
  onChange: (value: string) => void;
}) {
  switch (attribute.type) {
    case "text": {
      return (
        <Input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
        />
      );
    }

    case "number": {
      return (
        <Input
          type="number"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          onWheel={(e) => {
            e.currentTarget.blur();
          }}
        />
      );
    }

    case "email": {
      return (
        <Input
          type="email"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
        />
      );
    }

    case "tel": {
      return (
        <Input
          type="tel"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          maxLength={16}
        />
      );
    }

    case "date": {
      const dateValue =
        value === "" ? "" : format(new Date(value), "yyyy-MM-dd");
      return (
        <Input
          type="date"
          value={dateValue}
          onChange={(e) => {
            onChange(e.target.value);
          }}
        />
      );
    }

    case "datetime": {
      const datetimeValue =
        value === "" ? "" : format(new Date(value), "yyyy-MM-dd'T'HH:mm");
      return (
        <Input
          type="datetime-local"
          value={datetimeValue}
          onChange={(e) => {
            onChange(e.target.value);
          }}
        />
      );
    }

    case "time": {
      return (
        <Input
          type="time"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
        />
      );
    }

    case "color": {
      return (
        <Input
          type="color"
          value={value === "" ? "#000000" : value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
        />
      );
    }

    case "textarea": {
      return (
        <Textarea
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          rows={3}
        />
      );
    }

    case "checkbox": {
      return (
        <Checkbox
          checked={value === "true"}
          onCheckedChange={(checked) => {
            onChange(String(checked));
          }}
        />
      );
    }

    case "select": {
      return (
        <Select
          value={value}
          onValueChange={(val) => {
            onChange(val);
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">Brak</SelectItem>
            {attribute.options?.map((option) => (
              <SelectItem
                key={typeof option === "string" ? option : option.value}
                value={typeof option === "string" ? option : option.value}
              >
                {typeof option === "string" ? option : option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    case "multiselect": {
      const selected = value === "" ? [] : value.split(",");
      return (
        <div className="flex flex-col gap-1">
          {attribute.options?.map((option) => {
            const optionValue =
              typeof option === "string" ? option : option.value;
            const optionLabel =
              typeof option === "string" ? option : option.label;
            return (
              <div key={optionValue} className="flex items-center gap-1.5">
                <Checkbox
                  id={`bulk-${attribute.id.toString()}-${optionValue}`}
                  checked={selected.includes(optionValue)}
                  onCheckedChange={(checked) => {
                    const next =
                      checked === true
                        ? [...selected, optionValue]
                        : selected.filter((v) => v !== optionValue);
                    onChange(next.join(","));
                  }}
                />
                <Label
                  htmlFor={`bulk-${attribute.id.toString()}-${optionValue}`}
                  className="text-sm font-normal"
                >
                  {optionLabel}
                </Label>
              </div>
            );
          })}
        </div>
      );
    }

    case "block": {
      const rootBlock =
        blocks.find((b) => b?.attributeId === attribute.id) ?? null;
      return (
        <Select
          value={value}
          onValueChange={(val) => {
            onChange(val);
          }}
        >
          <SelectTrigger>
            <SelectValue>
              {rootBlock?.children.find((b) => b.id === Number(value))?.name ??
                value}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">Brak</SelectItem>
            {rootBlock?.children.map((block) => (
              <SelectItem key={block.id} value={block.id.toString()}>
                {block.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    case "file":
    case "drawing": {
      return null;
    }
  }
}
