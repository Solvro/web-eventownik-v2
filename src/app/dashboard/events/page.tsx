import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function EventListPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Wszystkie wydarzenia - 0</h1>
      <Button className="max-w-fit" asChild>
        <Link href="/dashboard/events/2">
          Kliknij by przejść do widoku zarządzania eventem
        </Link>
      </Button>
    </div>
  );
}
