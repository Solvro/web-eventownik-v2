import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import {
  deleteManyParticipants,
  deleteParticipant,
  getParticipants,
} from "@/app/dashboard/events/[uuid]/participants/actions";
import { flattenParticipants } from "@/app/dashboard/events/[uuid]/participants/table/data";
import type { FlattenedParticipant, Participant } from "@/types/participant";

export function useParticipantsData(
  eventUuid: string,
  initialParticipants: Participant[] = [],
) {
  const queryClient = useQueryClient();

  const { data: participants, isFetching } = useQuery({
    queryKey: ["participants", eventUuid],
    queryFn: async () => getParticipants(eventUuid),
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
    mutationFn: async (id: number) =>
      deleteParticipant(eventUuid, id.toString()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["participants", eventUuid],
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => deleteManyParticipants(eventUuid, ids),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["participants", eventUuid],
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
