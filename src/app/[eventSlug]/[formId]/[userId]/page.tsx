import { format } from "date-fns";
import { Calendar1, CalendarX, MapPin } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AppLogo } from "@/components/app-logo";
import { API_URL, PHOTO_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import { cn } from "@/lib/utils";
import { Event } from "@/types/event";

import { FormGenerator } from "./form-generator";

export default async function FormPage({
  params,
}: Promise<{ eventSlug: string; formId: string; userId: string }>) {
  const { eventSlug, formId, userId } = await params;
  const session = await verifySession();
  if (session == null || typeof session.bearerToken !== "string") {
    notFound();
  }
  const { bearerToken } = session;
  const eventResponse = await fetch(`${API_URL}/events/${eventSlug}`, {
    method: "GET",
  });
  if (!eventResponse.ok) {
    const error = (await eventResponse.json()) as unknown;
    console.error(error);
    return <div>Nie znaleziono wydarzenia 😪</div>;
  }
  const event = (await eventResponse.json()) as Event;
  const formResponse = await fetch(
    `${API_URL}/events/${event.id.toString()}/forms/${formId}`,
    {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    },
  );
  if (!formResponse.ok) {
    const error = (await formResponse.json()) as unknown;
    console.error(error);
    return <div>Nie znaleziono formularza 😪</div>;
  }
  const form = await formResponse.json();
  return (
    <div className="flex min-h-screen flex-col md:max-h-screen md:flex-row">
      <div
        className="flex flex-1 flex-col justify-between p-4 text-[#f0f0ff]"
        style={{
          backgroundImage: `linear-gradient(to bottom, #1F1F1F40, #000000), url(${PHOTO_URL}/${event.photoUrl ?? ""})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <nav className="flex items-center px-8">
          <AppLogo forceTheme="dark" />
        </nav>
        <div className="flex flex-col gap-2">
          <div className="p-8">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              {event.name}
            </h1>
            <div className="mb-8 flex flex-col gap-y-2">
              <div className="flex gap-x-2">
                <EventInfoDiv>
                  <Calendar1 size={20} />{" "}
                  {format(event.startDate, "dd.MM.yyyy")}
                </EventInfoDiv>
                <EventInfoDiv>{format(event.startDate, "HH:mm")}</EventInfoDiv>
              </div>
              <div className="flex gap-x-2">
                <EventInfoDiv>
                  <CalendarX size={20} /> {format(event.endDate, "dd.MM.yyyy")}
                </EventInfoDiv>
                <EventInfoDiv>{format(event.endDate, "HH:mm")}</EventInfoDiv>
              </div>
              <div className="flex flex-wrap gap-2">
                {event.location != null && event.location.trim() !== "" ? (
                  <Link
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                    target="_blank"
                  >
                    <EventInfoDiv>
                      <MapPin size={20} /> {event.location}
                    </EventInfoDiv>
                  </Link>
                ) : null}
                {event.organizer != null && event.organizer.trim() !== "" ? (
                  <EventInfoDiv>
                    <Building2 size={20} /> {event.organizer}
                  </EventInfoDiv>
                ) : null}
              </div>
            </div>
            <p className="max-h-72 overflow-y-auto whitespace-pre-line leading-relaxed">
              {event.description}
            </p>
          </div>
        </div>
      </div>
      <div className="relative flex flex-1 flex-col items-center gap-y-2 p-4 md:overflow-y-auto">
        <h2 className="text-center text-3xl font-bold md:text-4xl">
          {form.name}
        </h2>
        <p className="mb-8">{form.description}</p>
        <FormGenerator
          attributes={form.attributes}
          formId={formId}
          eventSlug={eventSlug}
          userId={userId}
        />
      </div>
    </div>
  );
}

function EventInfoDiv({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        className,
        "flex w-fit items-center gap-x-2 rounded-lg bg-accent/10 px-2 py-1 backdrop-blur-sm",
      )}
    >
      {children}
    </div>
  );
}
