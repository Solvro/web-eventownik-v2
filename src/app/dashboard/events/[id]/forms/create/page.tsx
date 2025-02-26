import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { EventFormForm } from "./event-form-form";

export default async function CreateEventFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex flex-col gap-8">
      <Link href="../forms" className="flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" /> Powrót do listy formularzy
      </Link>
      <h2 className="text-2xl font-bold">Stwórz formularz</h2>
      <EventFormForm eventId={id} />
    </div>
  );
}
