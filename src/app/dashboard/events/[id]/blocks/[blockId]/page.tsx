import { FileDown } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { AddBlockEntry } from "@/app/dashboard/events/[id]/blocks/[blockId]/add-block-entry";
import { Button } from "@/components/ui/button";
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
  return participants.filter((participant) => {
    const targetBlockAttribute = participant.attributes.find(
      (attribute) => attribute.id.toString() === blockId,
    );
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
    return targetBlockAttribute.value === childBlockId.toString();
  });
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
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold">{rootBlockName}</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="me-4">
              <FileDown className="h-4 w-4" />
              Eksportuj
            </Button>
            <span className="hidden text-2xl font-bold sm:inline-block">
              Liczba uczestników:
            </span>
            <span className="text-2xl font-bold">
              {rootBlock.children
                .map((block) => block.meta.participantsInBlockCount ?? 0)
                .reduce((a, b) => a + b, 0)}
            </span>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-8">
          <AddBlockEntry
            eventId={eventId}
            attributeId={rootBlockId}
            parentId={rootBlock.id.toString()}
          />
          {rootBlock.children.map((childBlock) => (
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
          ))}
        </div>
      </div>
    );
  }
}
