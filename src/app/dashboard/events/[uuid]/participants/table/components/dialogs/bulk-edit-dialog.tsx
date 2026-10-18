"use client";

/* eslint-disable unicorn/prevent-abbreviations */
import { useQueryClient } from "@tanstack/react-query";
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
import type { Block } from "@/types/blocks";
import type { FlattenedParticipant } from "@/types/participant";
import type { V3Attribute as Attribute } from "@/types/v3";

import { bulkUpdateParticipantAttribute } from "../../../actions";
import { AttributeValueInput } from "../inputs/attribute-value-input";

interface BulkEditDialogProps {
  table: Table<FlattenedParticipant>;
  attributes: Attribute[];
  blocks: (Block | null)[];
  eventUuid: string;
}

export function BulkEditDialog({
  table,
  attributes,
  blocks,
  eventUuid,
}: BulkEditDialogProps) {
  const t = useTranslations("Table");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedattributeUuid, setSelectedattributeUuid] =
    useState<string>("");
  const [value, setValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const selectedParticipants =
    table.options.meta?.selection?.participants ??
    table.getFilteredSelectedRowModel().rows.map((row) => row.original);
  const editableAttributes = attributes.filter(
    (a) => a.type !== "file" && a.type !== "drawing",
  );
  const selectedAttribute = editableAttributes.find(
    (a) => a.uuid === selectedattributeUuid,
  );

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSelectedattributeUuid("");
      setValue("");
    }
  }

  function handleAttributeChange(attributeUuid: string) {
    setSelectedattributeUuid(attributeUuid);
    setValue(
      editableAttributes.find((attribute) => attribute.uuid === attributeUuid)
        ?.type === "checkbox"
        ? "false"
        : "",
    );
  }

  async function handleSave() {
    if (selectedAttribute == null || selectedParticipants.length === 0) {
      return;
    }

    setIsSaving(true);

    let failedCount = selectedParticipants.length;
    try {
      const result = await bulkUpdateParticipantAttribute(
        eventUuid,
        selectedParticipants.map((participant) => participant.uuid),
        selectedAttribute.uuid,
        value,
      );
      failedCount = result.failedCount;
      await queryClient.invalidateQueries({
        queryKey: ["participants", eventUuid],
      });
    } catch {
      failedCount = selectedParticipants.length;
    } finally {
      setIsSaving(false);
    }

    if (failedCount === 0) {
      toast({ title: t("bulkEditSuccess") });
      setOpen(false);
      setSelectedattributeUuid("");
      setValue("");
    } else {
      toast({
        variant: "destructive",
        title: t("bulkEditError", { count: failedCount }),
      });
    }
  }

  if (selectedParticipants.length === 0) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            disabled={true}
            className="hover:cursor-not-allowed disabled:pointer-events-auto"
            aria-label={t("bulkEditTitle")}
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
            <Button
              variant="outline"
              size="icon"
              aria-label={t("bulkEditTitle")}
            >
              <PencilLine />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          {t("bulkEditSelectedTooltip", { count: selectedParticipants.length })}
        </TooltipContent>
      </Tooltip>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("bulkEditTitle")}</DialogTitle>
          <DialogDescription>
            {t("bulkEditDescription", { count: selectedParticipants.length })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label>{t("bulkEditAttributeLabel")}</Label>
            <Select
              value={selectedattributeUuid}
              onValueChange={handleAttributeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("bulkEditAttributePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {editableAttributes.map((attr) => (
                  <SelectItem key={attr.uuid} value={attr.uuid}>
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
                idPrefix={`bulk-${selectedAttribute.uuid}`}
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
