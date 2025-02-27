import { ArrowLeft, TriangleAlert } from "lucide-react";
import Link from "next/link";

import { getEventFormAttributes } from "../data-access";
import { EventFormForm } from "./event-form-form";

export default async function CreateEventFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const attributes = await getEventFormAttributes(id);

  if (attributes.length > 0) {
    return (
      <div className="flex flex-col gap-8">
        <Link href="../forms" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Powrót do listy formularzy
        </Link>
        <div className="rounded-lg bg-muted/5 p-4">
          <h2 className="text-2xl font-bold">Stwórz formularz</h2>
          <EventFormForm eventId={Number(id)} attributes={attributes} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="flex items-center gap-2 text-2xl font-bold text-red-500">
        <TriangleAlert className="h-6 w-6" /> Brak dostępnych atrybutów
      </h2>
      <p className="max-w-lg text-sm text-gray-500">
        Nie udało się pobrać listy atrybutów. Aby stworzyć formularz, musisz
        mieć co najmniej jeden atrybut. Upewnij się, że do wydarzenia dodano
        odpowiednie atrybuty i spróbuj ponownie.
      </p>
    </div>
  );
}
