import { Cuboid, PackageOpenIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { Attribute } from "@/types/attributes";

export const metadata: Metadata = {
  title: "Bloki",
};

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
      <div className="flex flex-wrap justify-center gap-8 sm:justify-start">
        {blocks.length > 0 ? (
          blocks.map((block) => (
            <div
              className="flex h-64 w-64 flex-col justify-between rounded-md border border-slate-500 p-4"
              key={block.id}
            >
              <div className="flex grow flex-col items-center justify-center gap-2 text-center">
                <p className="text-lg font-bold">{block.name}</p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`blocks/${block.id.toString()}`}>
                    <PackageOpenIcon />
                    Otwórz
                  </Link>
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex w-full flex-col items-center justify-center py-12 text-center">
            <Cuboid className="text-muted-foreground mb-4 size-12" />
            <h3 className="text-muted-foreground text-lg">
              Nie masz jeszcze żadnego bloku
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}
