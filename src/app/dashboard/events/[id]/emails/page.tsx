import { Mail, SquarePlus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { SingleEventEmail } from "@/types/emails";

import { getEventEmails, getSingleEventEmail } from "./data-access";
import { SortableEmailGrid } from "./sortable-email-grid";

export const metadata: Metadata = {
  title: "Szablony maili",
};

export default async function DashboardEventEmailTemplatesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const templates = await getEventEmails(id);

  const singleEmails: Record<number, SingleEventEmail | null> = {};
  if (templates !== null) {
    const results = await Promise.all(
      templates.map(async (template) => ({
        id: template.id,
        data: await getSingleEventEmail(id, template.id.toString()),
      })),
    );
    for (const result of results) {
      singleEmails[result.id] = result.data;
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-3xl font-bold">Szablony maili</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/dashboard/events/${id}/emails/editor`}>
              <SquarePlus className="h-6 w-6" /> Stwórz szablon
            </Link>
          </Button>
        </div>
      </div>
      {templates === null ? (
        <div className="flex flex-wrap justify-center gap-8 sm:justify-start">
          <p className="text-red-600">Nie udało się pobrać szablonów</p>
        </div>
      ) : templates.length > 0 ? (
        <SortableEmailGrid
          templates={templates}
          eventId={id}
          singleEmails={singleEmails}
        />
      ) : (
        <div className="flex flex-wrap justify-center gap-8 sm:justify-start">
          <div className="flex w-full flex-col items-center justify-center py-12 text-center">
            <Mail className="text-muted-foreground mb-4 size-12" />
            <h3 className="text-muted-foreground text-lg">
              Nie masz jeszcze żadnego szablonu maila
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}
