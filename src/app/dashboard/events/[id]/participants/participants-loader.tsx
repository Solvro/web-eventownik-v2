"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { UnsavedChangesAlert } from "@/components/unsaved-changes-alert";
import { useParticipantsData } from "@/hooks/use-participants-data";
import { useParticipantsTable } from "@/hooks/use-participants-table";
import { useUnsavedForm } from "@/hooks/use-unsaved";

import {
  getAttributes,
  getBlocks,
  getEmails,
  getParticipants,
} from "./actions";
import { TableMenu } from "./table/components/buttons/table-menu";
import { HelpDialog } from "./table/components/dialogs/help-dialog";
import { ParticipantTable } from "./table/core/participants-table";

export function ParticipantsLoader({ eventId }: { eventId: string }) {
  const t = useTranslations("Table");

  const { data: attributes, isError: isAttributesError } = useQuery({
    queryKey: ["attributes", eventId],
    queryFn: async () => getAttributes(eventId),
  });

  const { data: participants, isError: isParticipantsError } = useQuery({
    queryKey: ["participants", eventId],
    queryFn: async () => getParticipants(eventId),
    select: (data) =>
      data?.toSorted(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
  });

  const { data: emails } = useQuery({
    queryKey: ["emails", eventId],
    queryFn: async () => getEmails(eventId),
  });

  const { data: blocks } = useQuery({
    queryKey: ["blocks", eventId, attributes],
    queryFn: async () => getBlocks(eventId, attributes ?? []),
    enabled: Boolean(attributes),
  });

  const {
    data,
    setData,
    deleteManyParticipants,
    isLoading: isQuerying,
  } = useParticipantsData(eventId, participants ?? []);

  const { table, globalFilter } = useParticipantsTable({
    data,
    attributes: attributes ?? [],
    blocks: blocks ?? [],
    eventId,
    onUpdateData: (rowIndex, value) => {
      setData((previousData) => {
        return previousData.map((row, index) => {
          if (index === rowIndex) {
            return value;
          }
          return row;
        });
      });
    },
  });

  const isAnyRowEditing = data.some((row) => row.mode === "edit");
  const { isGuardActive, onConfirm, onCancel } =
    useUnsavedForm(isAnyRowEditing);

  if (
    isAttributesError ||
    isParticipantsError ||
    participants == null ||
    attributes == null
  ) {
    return <div className="text-center">{t("participantsError")}</div>;
  }

  async function handleDeleteManyParticipants(participantsIds: string[]) {
    await deleteManyParticipants(participantsIds);
    table.resetRowSelection();
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold">{t("participantsTableTitle")}</h1>
          <HelpDialog />
        </div>
        <TableMenu
          table={table}
          eventId={eventId}
          globalFilter={globalFilter}
          isQuerying={isQuerying}
          emails={emails ?? []}
          attributes={attributes}
          blocks={blocks ?? []}
          deleteManyParticipants={handleDeleteManyParticipants}
        />
      </div>
      <ParticipantTable table={table} />
      <UnsavedChangesAlert
        active={isGuardActive}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </>
  );
}
