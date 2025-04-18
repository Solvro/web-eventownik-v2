import { FileDown } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { AddBlockEntry } from "@/app/dashboard/events/[id]/blocks/[blockId]/add-block-entry";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { Block } from "@/types/blocks";

export default async function EventBlockEditPage({
  params,
}: {
  params: Promise<{ id: string; blockId: string }>;
}) {
  const { id: eventId, blockId } = await params;
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }
  const { bearerToken } = session;

  const response = await fetch(
    `${API_URL}/events/${eventId}/attributes/${blockId}/blocks`,
    {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    },
  );
  const block = (await response.json()) as Block;

  if (response.ok) {
    return (
      <div className="flex grow flex-col gap-8">
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold">{block.name}</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="me-4">
              <FileDown className="h-4 w-4" />
              Eksportuj
            </Button>
            <span className="hidden text-2xl font-bold sm:inline-block">
              Liczba uczestników:
            </span>
            <span className="text-2xl font-bold">
              {/*{block.children*/}
              {/*  .map((b) => b.participants.length)*/}
              {/*  .reduce((a, b) => a + b, 0)}*/}
              {block.capacity != null && `/${block.capacity.toString()}`}
            </span>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-8">
          <AddBlockEntry
            eventId={eventId}
            attributeId={blockId}
            parentId={block.id}
          />
          {block.children.map((b) => (
            <div
              key={b.id}
              className="flex h-64 w-64 flex-col justify-between rounded-md border border-slate-500 p-4"
            >
              <div className="flex grow flex-col items-center justify-center gap-2 text-center">
                <p className="text-lg font-bold">{b.name}</p>
                <p className="text-lg font-bold">
                  {/*{b.participants.length}/{b.capacity}*/}?{" "}
                  {b.capacity != null && `/${b.capacity.toString()}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } else {
    notFound();
  }
}
