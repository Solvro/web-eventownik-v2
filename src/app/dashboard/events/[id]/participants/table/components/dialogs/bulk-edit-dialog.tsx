"use client";

/* eslint-disable unicorn/prevent-abbreviations */
import type { Table } from "@tanstack/react-table";
import { Loader, PencilLine } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { AttributeValueInput } from "../inputs/attribute-value-input";

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
              <AttributeValueInput
                attribute={selectedAttribute}
                blocks={blocks}
                value={value}
                onChange={setValue}
                idPrefix={`bulk-${selectedAttribute.id.toString()}`}
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
