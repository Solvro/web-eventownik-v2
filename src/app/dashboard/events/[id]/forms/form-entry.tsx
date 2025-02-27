import { Eye, SquarePen, Trash2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { EventForm } from "@/types/forms";

function FormEntry({ form }: { form: EventForm }) {
  return (
    <div className="flex h-64 w-64 flex-col justify-between rounded-md border border-slate-500 p-4">
      <div className="flex items-center justify-end">
        {/* TODO: Implement form edit view */}
        <Button variant="ghost" size="icon" asChild>
          <Link href={`forms/${form.id.toString()}`}>
            <SquarePen />
            <span className="sr-only">Edytuj formularz</span>
          </Link>
        </Button>
        {/* TODO: Implement form preview */}
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <Eye />
            <span className="sr-only">Podgląd formularzu</span>
          </Link>
        </Button>
        {/* TODO: Implement form removal */}
        <Button variant="ghost" size="icon" className="text-red-700" asChild>
          <Link href="/">
            <Trash2 />
            <span className="sr-only">Usuń formularz</span>
          </Link>
        </Button>
      </div>
      <div className="flex grow flex-col items-center justify-center gap-2">
        <p className="text-lg font-bold">{form.name}</p>
        <p className="text-muted-foreground">
          {new Date(form.startDate).toLocaleDateString()} -{" "}
          {new Date(form.endDate).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

export { FormEntry };
