import { queryOptions } from "@tanstack/react-query";

import { getOrderedEventAttributes } from "@/app/dashboard/events/[uuid]/statistics/data-access";

export function eventAttributesQueryOptions(eventUuid: string) {
  return queryOptions({
    queryKey: ["event-attributes", eventUuid],
    queryFn: async () => getOrderedEventAttributes(eventUuid),
  });
}
