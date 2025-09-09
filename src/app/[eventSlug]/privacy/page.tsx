import { format } from "date-fns";
import { Building2, Calendar1, CalendarX, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import React from "react";

import EventPhotoPlaceholder from "@/../public/event-photo-placeholder.png";
import { EventNotFound } from "@/app/[eventSlug]/event-not-found";
import { AddToCalendarButton } from "@/components/add-to-calendar-button";
import { AppLogo } from "@/components/app-logo";
import { EventInfoDiv } from "@/components/event-info-div";
import { EventPrimaryColorSetter } from "@/components/event-primary-color";
import { SanitizedContent } from "@/components/sanitized-content";
import { SocialMediaLink } from "@/components/social-media-link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { API_URL, PHOTO_URL } from "@/lib/api";
import type { Event } from "@/types/event";

interface EventPageProps {
  params: Promise<{ eventSlug: string }>;
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { eventSlug } = await params;

  const response = await fetch(`${API_URL}/events/${eventSlug}/public`, {
    method: "GET",
  });
  if (!response.ok) {
    const error = (await response.json()) as unknown;
    console.error(error);
    return {
      title: "Eventownik",
      description: "Nie znaleziono wydarzenia 😪",
    };
  }
  const event = (await response.json()) as Event;

  return {
    title: `Polityka prywatności - ${event.name}`,
    description: `Polityka prywatności wydarzenia ${event.name}`,
    openGraph: {
      images: [`${PHOTO_URL}/${event.photoUrl ?? ""}`],
    },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { eventSlug } = await params;

  const eventResponse = await fetch(`${API_URL}/events/${eventSlug}/public`, {
    method: "GET",
  });
  if (!eventResponse.ok) {
    const error = (await eventResponse.json()) as unknown;
    console.error(error);
    return <EventNotFound whatNotFound="event" />;
  }

  const event = (await eventResponse.json()) as Event;

  // const attributesResponse = await fetch(`${API_URL}/events/${eventSlug}/attributes`, {
  //   method: "GET",
  // });

  return (
    <div className="flex min-h-screen flex-col md:max-h-screen md:flex-row">
      <EventPrimaryColorSetter primaryColor={event.primaryColor || "#3672fd"} />
      <div
        className="flex flex-1 flex-col justify-between p-4 text-[#f0f0ff]"
        style={{
          backgroundImage: `linear-gradient(to bottom, #1F1F1F40, #000000), url(${
            event.photoUrl == null
              ? EventPhotoPlaceholder.src
              : `${PHOTO_URL}/${event.photoUrl}`
          })`,
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
                <AddToCalendarButton event={event} />
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
              <div className="flex flex-wrap gap-2">
                {event.socialMediaLinks != null &&
                event.socialMediaLinks.length > 0
                  ? event.socialMediaLinks.map((link) => (
                      <SocialMediaLink link={link} key={link} />
                    ))
                  : null}
              </div>
            </div>
            <ScrollArea className="h-72">
              <SanitizedContent contentToSanitize={event.description ?? ""} />
            </ScrollArea>
          </div>
        </div>
      </div>
      {/* No need for ScrollArea (it's viewport's side scrollbar) */}
      <div className="relative flex flex-1 flex-col items-center gap-y-2 p-4 px-4 text-justify md:overflow-y-auto">
        <h2 className="text-center text-3xl leading-relaxed font-bold md:text-4xl">
          Polityka Prywatności wydarzenia <br /> &quot;{event.name}&quot;
        </h2>
        <div className="bg-primary/5 m-2 rounded-md p-4 leading-relaxed [&>ol>li]:my-4">
          <p className="mb-2">
            Zgodnie z art. 13 ust. 1 i ust. 2 Rozporządzenia Parlamentu
            Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w
            sprawie ochrony osób fizycznych w związku z przetwarzaniem danych
            osobowych i w sprawie swobodnego przepływu takich danych oraz
            uchylenia dyrektywy 95/46/WE (ogólne rozporządzenie o ochronie
            danych, dalej „RODO”), informujemy, iż:
          </p>
          <ol className="mx-8 list-decimal">
            <li>
              Administratorem Pani/Pana danych osobowych (dalej
              „Administratorem”) jest Politechnika Wrocławska z siedzibą przy
              ul. Wybrzeże Stanisława Wyspiańskiego 27, 50-370 Wrocław Wrocław,
              NIP: 8960005851, REGON: 000001614.
            </li>
            <li>
              W sprawach związanych z ochroną danych osobowych można kontaktować
              się z Administratorem Ochrony Danych pod adresem e-mail
              eventownik@pwr.edu.pl
              {/* TODO: Contact email will be probably mandatory in the future */}
              {event.contactEmail === null
                ? ""
                : ` lub bezpośrednio z organizatorem pod adresem ${event.contactEmail}`}
              .
            </li>
            <li>
              Dane osobowe będą przetwarzane wyłącznie w celu realizacji
              Wydarzenia, w szczególności do weryfikacji uczestnictwa, kontaktu
              oraz dokumentacji.
            </li>
            <li>
              Dane będą przechowywane przez okres do{" "}
              {new Date(event.startDate).getFullYear() + 1} roku.
            </li>
            <li>
              Przetwarzane będą Pani/Pana poniższe dane:
              <ol className="mx-4 list-[lower-alpha] [&>li]:my-1">
                <li>email</li>
                <li>
                  dane dotyczące urządzenia tj. adres IP, dane sesji,
                  identyfikator użytkownika
                </li>
                {/* TODO(backend): Precise list of attributes */}
                <li>dane wprowadzone do pól formularzy</li>
              </ol>
            </li>
            <li>
              Pani/Pana danych osobowe mogą być przekazywane:
              <ol className="mx-4 list-[lower-alpha] [&>li]:my-1">
                <li>
                  uprawnionym podmiotom na podstawie obowiązujących przepisów
                  (np. sądowi lub Policji)
                </li>
                <li>
                  wolontariuszom świadczącym usługi w imieniu Administratora w
                  niezbędnym do tego celu zakresie
                </li>
                <li>
                  podmiotom utrzymującym infrastrukturę Administratora oraz
                  świadczącym usługi na Pani/Pana rzecz w imieniu Administratora
                </li>
                <li>Politechnice Wrocławskiej</li>
              </ol>
            </li>
            <li>
              Posiada Pani/Pan prawo:
              <ol className="mx-4 list-[lower-alpha] [&>li]:my-1">
                <li>dostępu do swoich danych osobowych,</li>
                <li>żądania kopii przetwarzanych danych osobowych</li>
                <li>żądania przekazania danych osobowych</li>
                <li>sprostowania swoich danych osobowych,</li>
                <li>usunięcia swoich danych osobowych</li>
                <li>ograniczenia przetwarzania swoich danych osobowych</li>
                <li>
                  cofnięcia zgody na przetwarzanie danych osobowych poprzez
                  kontakt mailowy z administratorem danych osobowych - jeżeli
                  uprzednio wyrazili Państwo taką zgodę i przetwarzanie
                  dotyczących Państwa danych odbywa się na jej podstawie
                  (cofnięcie zgody nie powoduje, że przetwarzanie ich do tego
                  czasu było bezprawne)
                </li>
                <li>
                  przenoszenia swoich danych osobowych, i. wniesienia sprzeciwu
                  wobec przetwarzania swoich danych osobowych z przyczyn
                  związanych z szczególną Pani/Pana sytuacją zgodnie z art. 21
                  RODO.{" "}
                </li>
              </ol>
            </li>
            <li>
              Niezależnie od powyższego, przysługuje Pani/Panu uprawnienie do
              wniesienia skargi do organu nadzorczego, tj. Prezesa Urzędu
              Ochrony Danych Osobowych, gdy uznają Państwo, iż przetwarzanie
              Państwa danych osobowych narusza przepisy RODO.
            </li>
            <li>
              Podanie przez Pana/Panią danych osobowych jest dobrowolne, ale
              niezbędne do realizacji usługi.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
