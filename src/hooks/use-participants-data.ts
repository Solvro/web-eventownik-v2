import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import {
  deleteManyParticipants,
  getParticipants,
} from "@/app/dashboard/events/[uuid]/participants/actions";
import { flattenParticipants } from "@/app/dashboard/events/[uuid]/participants/table/data";
import type { FlattenedParticipant, Participant } from "@/types/participant";

export function useParticipantsData(
  eventUuid: string,
  initialParticipants: Participant[] = [],
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const t = useTranslations("Table");

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
    mutationFn: async (uuid: string) => deleteParticipant(eventUuid, uuid),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["participants", eventUuid],
      });
      toast({
        title: t("deleteParticipantsSuccess"),
        description: t("deleteParticipantsSuccessDescription", {
          count: variables.length,
        }),
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
    isLoading: isFetching || bulkDeleteMutation.isPending,
    deleteManyParticipants: bulkDeleteMutation.mutateAsync,
  };
}
