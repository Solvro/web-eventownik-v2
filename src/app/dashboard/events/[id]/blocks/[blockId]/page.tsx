import { Cuboid } from "lucide-react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { CreateBlockForm } from "@/app/dashboard/events/[id]/blocks/[blockId]/create-block-form";
import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { AttributeBase } from "@/types/attributes";
import type { Block } from "@/types/blocks";
import type { Participant } from "@/types/participant";

import { BlockEntry } from "./block-entry";

async function getRootBlock(
  eventId: string,
  blockId: string,
  bearerToken: string,
) {
  const response = await fetch(
    `${API_URL}/events/${eventId}/attributes/${blockId}/blocks`,
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
      `[getRootBlock] Failed to fetch root block ${blockId} for event ${eventId}:`,
      error,
    );
    return null;
  }
}

async function getParticipantsInRootBlock(
  eventId: string,
  blockId: string,
  bearerToken: string,
) {
  const response = await fetch(`${API_URL}/events/${eventId}/participants`, {
    method: "GET",
    headers: { Authorization: `Bearer ${bearerToken}` },
  });
  if (!response.ok) {
    const error = (await response.json()) as unknown;
    console.error(
      `[getParticipantsInRootBlock] Failed to fetch participants in block ${blockId} for event ${eventId}:`,
      error,
    );
    return [];
  }
  const participants = (await response.json()) as Participant[];
  // TODO fix case when block attribute has field showInList=false
  // In such case this filter will return empty list
  // since participants won't have block attribute in their fields (attribute.id === blockId is always false)
  // The error results from what data does the backend return (`${API_URL}/events/${eventId}/participants` endpoint)
  return participants.filter((participant) => {
    const targetBlockAttribute = participant.attributes.find((attribute) => {
      return attribute.id.toString() === blockId;
    });
    return targetBlockAttribute !== undefined;
  });
}

async function getRootBlockAttributeName(
  eventId: string,
  rootBlockAttributeId: string,
  bearerToken: string,
) {
  const response = await fetch(
    `${API_URL}/events/${eventId}/attributes/${rootBlockAttributeId}`,
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
      `[getRootBlockAttributeName] Failed to fetch attribute name for block ${rootBlockAttributeId} in event ${eventId}:`,
      error,
    );
  }
}

function getParticipantsInChildBlock(
  participantsInRootBlock: Participant[],
  rootBlockId: string,
  childBlockId: string,
) {
  return participantsInRootBlock.filter((participant) => {
    // We disable this rule because we're sure that the participants we process ARE in this *root* block
    // therefore, the attribute will be always present, but we still need to find it in order to reference it
    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    const targetBlockAttribute = participant.attributes.find(
      (attribute) => attribute.id.toString() === rootBlockId,
    ) as AttributeBase;
    return targetBlockAttribute.value === childBlockId;
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; blockId: string }>;
}): Promise<Metadata> {
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }
  const { bearerToken } = session;
  const { id: eventId, blockId: rootBlockId } = await params;

  const rootBlockName = await getRootBlockAttributeName(
    eventId,
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
  params: Promise<{ id: string; blockId: string }>;
}) {
  const { id: eventId, blockId: rootBlockId } = await params;
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }
  const { bearerToken } = session;

  const rootBlock = await getRootBlock(eventId, rootBlockId, bearerToken);
  const participantsInRootBlock = await getParticipantsInRootBlock(
    eventId,
    rootBlockId,
    bearerToken,
  );
  const rootBlockName = await getRootBlockAttributeName(
    eventId,
    rootBlockId,
    bearerToken,
  );

  if (rootBlock == null) {
    notFound();
  } else {
    return (
      <div className="flex grow flex-col gap-8">
        <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{rootBlockName}</h1>
            <span className="text-muted-foreground text-lg">
              Łączna liczba uczestników:{" "}
              {rootBlock.children
                .map((block) => block.meta.participantsInBlockCount ?? 0)
                .reduce((a, b) => a + b, 0)}{" "}
            </span>
          </div>
          <CreateBlockForm
            eventId={eventId}
            attributeId={rootBlockId}
            parentId={rootBlock.id.toString()}
          />
        </div>
        <div className="flex flex-wrap justify-center gap-8 sm:justify-start">
          {rootBlock.children.length > 0 ? (
            rootBlock.children.map((childBlock) => (
              <BlockEntry
                key={childBlock.id}
                block={childBlock}
                attributeId={rootBlockId}
                eventId={eventId}
                participantsInBlock={getParticipantsInChildBlock(
                  participantsInRootBlock,
                  rootBlockId,
                  childBlock.id.toString(),
                )}
              />
            ))
          ) : (
            <div className="flex w-full flex-col items-center justify-center py-12 text-center">
              <Cuboid className="text-muted-foreground mb-4 size-12" />
              <h3 className="text-muted-foreground text-lg">
                Nie masz jeszcze żadnego bloku w bloku
              </h3>
            </div>
          )}
        </div>
      </div>
    );
  }
}
