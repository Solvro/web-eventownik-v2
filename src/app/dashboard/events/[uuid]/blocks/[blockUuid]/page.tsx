import { Cuboid } from "lucide-react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { CreateBlockForm } from "@/app/dashboard/events/[uuid]/blocks/[blockUuid]/create-block-form";
import { ToggleParticipantsVisibilityButton } from "@/app/dashboard/events/[uuid]/blocks/[blockUuid]/toggle-participants-visibility-button";
import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { AttributeBase } from "@/types/attributes";
import type { Block } from "@/types/blocks";

import { SortableBlockGrid } from "./sortable-block-grid";

async function getRootBlock(
  eventUuid: string,
  blockUuid: string,
  bearerToken: string,
) {
  const response = await fetch(
    `${API_URL}/events/${eventUuid}/attributes/${blockUuid}/blocks`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    },
  );

  if (response.ok) {
    return (await response.json()) as Block;
  } else {
    const error = (await response.json()) as unknown;
    console.error(
      `[getRootBlock] Failed to fetch root block ${blockUuid} for event ${eventUuid}:`,
      error,
    );
    return null;
  }
}

async function getRootBlockAttributeName(
  eventUuid: string,
  rootBlockAttributeId: string,
  bearerToken: string,
) {
  const response = await fetch(
    `${API_URL}/events/${eventUuid}/attributes/${rootBlockAttributeId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    },
  );
  if (response.ok) {
    const attribute = (await response.json()) as AttributeBase;
    return attribute.name;
  } else {
    const error = (await response.json()) as unknown;
    console.error(
      `[getRootBlockAttributeName] Failed to fetch attribute name for block ${rootBlockAttributeId} in event ${eventUuid}:`,
      error,
    );
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ uuid: string; blockUuid: string }>;
}): Promise<Metadata> {
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }
  const { bearerToken } = session;
  const { uuid: eventUuid, blockUuid: rootBlockId } = await params;

  const rootBlockName = await getRootBlockAttributeName(
    eventUuid,
    rootBlockId,
    bearerToken,
  );

  return {
    title: rootBlockName,
  };
}

export default async function EventBlockEditPage({
  params,
}: {
  params: Promise<{ uuid: string; blockUuid: string }>;
}) {
  const { uuid: eventUuid, blockUuid: rootBlockId } = await params;
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }
  const { bearerToken } = session;

  const rootBlock = await getRootBlock(eventUuid, rootBlockId, bearerToken);
  const rootBlockName = await getRootBlockAttributeName(
    eventUuid,
    rootBlockId,
    bearerToken,
  );

  if (rootBlock == null) {
    notFound();
  } else {
    return (
      <div className="flex grow flex-col gap-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="md:space-y-2">
            <h1 className="text-3xl font-bold">{rootBlockName}</h1>
            <span className="text-muted-foreground text-lg">
              Łączna liczba uczestników:{" "}
              {rootBlock.children
                .map((block) => block.meta.participantsInBlockCount ?? 0)
                .reduce((a, b) => a + b, 0)}{" "}
            </span>
          </div>
          <ToggleParticipantsVisibilityButton />
          <CreateBlockForm
            eventUuid={eventUuid}
            attributeId={rootBlockId}
            parentId={rootBlock.uuid}
          />
        </div>
        {rootBlock.children.length > 0 ? (
          <SortableBlockGrid
            blocks={rootBlock.children}
            eventUuid={eventUuid}
            attributeId={rootBlockId}
          />
        ) : (
          <div className="flex flex-wrap justify-center gap-8 sm:justify-start">
            <div className="flex w-full flex-col items-center justify-center py-12 text-center">
              <Cuboid className="text-muted-foreground mb-4 size-12" />
              <h3 className="text-muted-foreground text-lg">
                Nie masz jeszcze żadnego bloku w bloku
              </h3>
            </div>
          </div>
        )}
      </div>
    );
  }
}
