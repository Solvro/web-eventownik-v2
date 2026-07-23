import { queryOptions } from "@tanstack/react-query";

import { getOrderedEventAttributes } from "@/app/dashboard/events/[id]/statistics/data-access";

export function eventAttributesQueryOptions(eventId: string) {
  return queryOptions({
    queryKey: ["event-attributes", eventId],
    queryFn: async () => getOrderedEventAttributes(eventId),
  });
}
