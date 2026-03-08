import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import {
  deleteManyParticipants,
  deleteParticipant,
  getParticipants,
} from "@/app/dashboard/events/[id]/participants/actions";
import { flattenParticipants } from "@/app/dashboard/events/[id]/participants/table/data";
import type { FlattenedParticipant, Participant } from "@/types/participant";

export function useParticipantsData(
  eventId: string,
  initialParticipants: Participant[] = [],
) {
  const queryClient = useQueryClient();

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
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => deleteManyParticipants(eventId, ids),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["participants", eventId],
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
