import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getSingleEventEmail } from "../data-access";
import { EventEmailEditForm } from "./edit-form";

export default async function EventMailEditPage({
  params,
}: {
  params: Promise<{ id: string; emailId: string }>;
}) {
  const { id, emailId } = await params;

  const emailToEdit = await getSingleEventEmail(id, emailId);

  if (emailToEdit == null) {
    notFound();
  } else {
    return (
      <div className="flex flex-col gap-8">
        <Link
          href={`/dashboard/events/${id}/emails`}
          className="flex items-center gap-2 underline"
        >
          <ArrowLeft className="h-4 w-4" /> Wróć do szablonów
        </Link>
        <h1 className="text-2xl font-bold">Edytuj szablon maila</h1>
        <EventEmailEditForm eventId={id} emailToEdit={emailToEdit} />
      </div>
    );
  }
}
