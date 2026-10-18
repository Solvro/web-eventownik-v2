import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { deleteManyParticipants } from "@/app/dashboard/events/[uuid]/participants/actions";
import { flattenParticipants } from "@/app/dashboard/events/[uuid]/participants/table/core/data";
import { useToast } from "@/hooks/use-toast";
import type { FlattenedParticipant, Participant } from "@/types/participant";

/**
 * Applies fresh server rows (e.g. a newly loaded page or a revalidation) while
 * keeping rows that are being edited, so an open draft is never overwritten.
 */
export function mergeWithDrafts(
  previous: FlattenedParticipant[],
  next: FlattenedParticipant[],
) {
  const drafts = new Map(
    previous.filter((row) => row.mode === "edit").map((row) => [row.uuid, row]),
  );
  if (drafts.size === 0) {
    return next;
  }
  return next.map((row) => drafts.get(row.uuid) ?? row);
}

export function useParticipantsData(
  eventUuid: string,
  initialParticipants: Participant[] = [],
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const t = useTranslations("Table");

  const [flattenedData, setFlattenedData] = useState<FlattenedParticipant[]>(
    () => flattenParticipants(initialParticipants),
  );

  useEffect(() => {
    setFlattenedData((previous) =>
      mergeWithDrafts(previous, flattenParticipants(initialParticipants)),
    );
  }, [initialParticipants]);

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const result = await deleteManyParticipants(eventUuid, ids);
      if (!result.success) {
        throw new Error(t("deleteParticipantsErrorDescription"));
      }
      return result;
    },
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
    isLoading: bulkDeleteMutation.isPending,
    deleteManyParticipants: bulkDeleteMutation.mutateAsync,
  };
}
