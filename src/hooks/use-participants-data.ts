import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import {
  deleteManyParticipants,
  getParticipants,
} from "@/app/dashboard/events/[uuid]/participants/actions";
import { flattenParticipants } from "@/app/dashboard/events/[uuid]/participants/table/core/data";
import { useToast } from "@/hooks/use-toast";
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
    select: (response) => response?.data ?? [],
    initialData: {
      data: initialParticipants,
      meta: {
        page: 1,
        take: initialParticipants.length,
        itemCount: initialParticipants.length,
        pageCount: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    },
  });

  const [flattenedData, setFlattenedData] = useState<FlattenedParticipant[]>(
    () => flattenParticipants(initialParticipants),
  );

  useEffect(() => {
    setFlattenedData(flattenParticipants(participants));
  }, [participants]);

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => deleteManyParticipants(eventUuid, ids),
    onSuccess: async (_, variables) => {
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
    isLoading: isFetching || bulkDeleteMutation.isPending,
    deleteManyParticipants: bulkDeleteMutation.mutateAsync,
  };
}
