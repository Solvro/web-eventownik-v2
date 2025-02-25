import { API_URL } from "@/lib/api";
import type { Event } from "@/types/event";

export default async function EventPage({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}) {
  const { eventSlug } = await params;
  const response = await fetch(`${API_URL}/events/${eventSlug}`);
  if (!response.ok) {
    return null;
  }
  const event = (await response.json()) as Event;

  return (
    <div>
      <h2>Strona wydarzenia: {event.name}</h2>
      <div>{event.startDate}</div>
    </div>
  );
}
