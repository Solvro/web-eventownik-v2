import { SquarePen } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

function BlockTemplateEntry({
  block,
}: {
  block: {
    id: number;
    name: string;
  };
}) {
  return (
    <div className="flex h-64 w-64 flex-col justify-between rounded-md border border-slate-500 p-4">
      <div className="flex grow flex-col items-center justify-center gap-2 text-center">
        <p className="text-lg font-bold">{block.name}</p>
        <Button variant="outline" className="w-full" asChild>
          <Link href={`blocks/${block.id.toString()}`}>
            <SquarePen className="h-4 w-4" />
            Edytuj
          </Link>
        </Button>
      </div>
    </div>
  );
}

export { BlockTemplateEntry };
