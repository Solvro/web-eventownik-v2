// This page likely won't be used in the future and its here cause i made it for testing
import { notFound, redirect } from "next/navigation";

import { BlockTemplateEntry } from "@/app/dashboard/events/[id]/blocks/block-list-entry";
import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { Attribute } from "@/types/attributes";

export default async function DashboardEventBlocksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }
  const { bearerToken } = session;
  const { id } = await params;

  const response = await fetch(`${API_URL}/events/${id}/attributes`, {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  });

  if (!response.ok) {
    notFound();
  }

  const attributes = (await response.json()) as Attribute[];

  const blocks = attributes.filter(
    (attribute: { type: string }) => attribute.type === "block",
  );

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Bloki</h1>
      <div className="mt-8 flex flex-wrap gap-8">
        {blocks.map((block) => (
          <BlockTemplateEntry key={block.id} block={block} />
        ))}
      </div>
    </div>
  );
}
