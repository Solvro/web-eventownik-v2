"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { useParticipantsData } from "@/hooks/use-participants-data";
import { useParticipantsTable } from "@/hooks/use-participants-table";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

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
    deleteParticipant: deleteParticipantMutation,
    deleteManyParticipants: deleteManyParticipantsMutation,
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

  if (
    isAttributesError ||
    isParticipantsError ||
    participants == null ||
    attributes == null
  ) {
    return <div className="text-center">{t("participantsError")}</div>;
  }

  async function deleteParticipant(participantId: number) {
    try {
      const { success, error } = await deleteParticipantMutation(participantId);

      if (!success) {
        toast({
          variant: "destructive",
          title: t("deleteParticipantError"),
          description: error,
        });
        return;
      }
      table.resetExpanded();
      setData((previousData) => {
        return previousData.filter(
          (participant) => participant.id !== participantId,
        );
      });
      toast({
        variant: "default",
        title: t("deleteParticipantSuccess"),
        description: error,
      });
    } catch {
      toast({
        title: t("deleteParticipantError"),
        variant: "destructive",
        description: t("deleteParticipantErrorDescription"),
      });
    }
  }

  async function deleteManyParticipants(_participants: string[]) {
    try {
      const response = await deleteManyParticipantsMutation(_participants);

      if (response.success) {
        setData((previousData) => {
          return previousData.filter(
            (participant) => !_participants.includes(participant.id.toString()),
          );
        });
        table.resetRowSelection();
        toast({
          title: t("deleteParticipantsSuccess"),
          description: t("deleteParticipantsSuccessDescription", {
            count: _participants.length,
          }),
        });
      } else {
        toast({
          title: t("deleteParticipantsError"),
          description: response.error,
        });
      }
    } catch {
      toast({
        title: t("deleteParticipantsError"),
        variant: "destructive",
        description: t("deleteParticipantsErrorDescription"),
      });
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex grow justify-between">
          <h1 className="text-3xl font-bold">{t("participantsTableTitle")}</h1>
          <HelpDialog />
        </div>
        <TableMenu
          table={table}
          eventId={eventId}
          globalFilter={globalFilter}
          isQuerying={isQuerying}
          emails={emails ?? []}
          deleteManyParticipants={deleteManyParticipants}
        />
      </div>
      <ParticipantTable
        table={table}
        eventId={eventId}
        setData={setData}
        deleteParticipant={deleteParticipant}
        isQuerying={isQuerying}
        blocks={blocks ?? []}
      />
    </>
  );
}
