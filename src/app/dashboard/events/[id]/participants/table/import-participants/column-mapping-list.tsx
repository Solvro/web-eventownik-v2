import { ArrowRight } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAttributeLabel } from "@/lib/utils";
import type { Attribute } from "@/types/attributes";

import { EMAIL_TARGET, SKIP_TARGET } from "./types";
import type { MappingTarget } from "./types";
import { getAttributeTarget, getMappedAttribute } from "./utils";

interface ColumnMappingListProps {
  headers: string[];
  mappings: Record<number, MappingTarget>;
  attributes: Attribute[];
  locale: string;
  onMappingChange: (columnIndex: number, target: MappingTarget) => void;
}

export function ColumnMappingList({
  headers,
  mappings,
  attributes,
  locale,
  onMappingChange,
}: ColumnMappingListProps) {
  return (
    <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden">
      <div className="grid grid-cols-[minmax(0,1fr)_1.75rem_minmax(0,1fr)] gap-x-2 pb-2 text-sm">
        <h3 className="font-bold">Kolumny w pliku</h3>
        <div />
        <h3 className="font-bold">Atrybuty</h3>
      </div>
      <ScrollArea className="h-full min-h-0 pr-3">
        <div className="grid grid-cols-[minmax(0,1fr)_1.75rem_minmax(0,1fr)] gap-x-2 gap-y-2 p-px pb-1">
          {headers.map((header, index) => {
            const target = mappings[index] ?? SKIP_TARGET;
            const mappedAttribute = getMappedAttribute(target, attributes);

            return (
              <div key={`${header}-${index.toString()}`} className="contents">
                <div
                  className="border-input bg-background flex h-9 min-w-0 items-center rounded-xl border px-3 text-sm"
                  title={header}
                >
                  <span className="truncate">{header}</span>
                </div>
                <ArrowRight className="text-muted-foreground mt-2 size-4 justify-self-center" />
                <Select
                  value={target}
                  onValueChange={(value: MappingTarget) => {
                    onMappingChange(index, value);
                  }}
                >
                  <SelectTrigger
                    id={`csv-column-${index.toString()}`}
                    className="h-9 min-w-0 rounded-xl px-3 font-semibold"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SKIP_TARGET}>Pomiń</SelectItem>
                    <SelectItem value={EMAIL_TARGET}>Email</SelectItem>
                    {attributes.map((attribute) => (
                      <SelectItem
                        key={attribute.id}
                        value={getAttributeTarget(attribute.id)}
                      >
                        {getAttributeLabel(attribute.name, locale)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {mappedAttribute?.isRequired === true ||
                target === EMAIL_TARGET ? (
                  <span className="sr-only">Wymagane</span>
                ) : null}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
