import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import {
  deleteManyParticipants,
  deleteParticipant,
  getParticipants,
} from "@/app/dashboard/events/[id]/participants/actions";
import { flattenParticipants } from "@/app/dashboard/events/[id]/participants/table/core/data";
import { useToast } from "@/hooks/use-toast";
import type { FlattenedParticipant, Participant } from "@/types/participant";

export function useParticipantsData(
  eventId: string,
  initialParticipants: Participant[] = [],
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const t = useTranslations("Table");

  const { data: participants, isFetching } = useQuery({
    queryKey: ["participants", eventId],
    queryFn: async () => getParticipants(eventId),
    initialData: initialParticipants,
  });

  const [flattenedData, setFlattenedData] = useState<FlattenedParticipant[]>(
    () => flattenParticipants(initialParticipants),
  );

  useEffect(() => {
    if (participants != null) {
      setFlattenedData(flattenParticipants(participants));
    }
  }, [participants]);

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => deleteParticipant(eventId, id.toString()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["participants", eventId],
      });
      toast({ variant: "default", title: t("deleteParticipantSuccess") });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: t("deleteParticipantError"),
        description: error.message || t("deleteParticipantErrorDescription"),
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => deleteManyParticipants(eventId, ids),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["participants", eventId],
      });
      toast({
        title: t("deleteParticipantsSuccess"),
        description: t("deleteParticipantsSuccessDescription", {
          count: variables.length,
        }),
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: t("deleteParticipantsError"),
        description: error.message || t("deleteParticipantsErrorDescription"),
      });
    },
  });

  return {
    data: flattenedData,
    setData: setFlattenedData,
    isLoading:
      isFetching || deleteMutation.isPending || bulkDeleteMutation.isPending,
    deleteParticipant: deleteMutation.mutateAsync,
    deleteManyParticipants: bulkDeleteMutation.mutateAsync,
  };
}
