import type { Metadata } from "next";
import React from "react";

import { EventNotFound } from "@/app/[eventSlug]/event-not-found";
import { API_URL, PHOTO_URL } from "@/lib/api";
import { getAttributeLabel } from "@/lib/utils";
import type { Event } from "@/types/event";

import { EventPageLayout } from "../event-page-layout";

interface EventPageProps {
  params: Promise<{ eventSlug: string; locale: string }>;
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

  return (
    <EventPageLayout
      event={event}
      description={event.description ?? ""}
      variant="form"
    >
      <h2 className="text-center text-3xl leading-relaxed font-bold md:text-4xl">
        Polityka Prywatności wydarzenia <br /> „{event.name}”
      </h2>
      <div className="bg-primary/5 m-2 rounded-md p-4 leading-relaxed [&>ol>li]:my-6">
        <p className="mb-2">
          Zgodnie z art. 13 ust. 1 i ust. 2 Rozporządzenia Parlamentu
          Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w
          sprawie ochrony osób fizycznych w związku z przetwarzaniem danych
          osobowych i w sprawie swobodnego przepływu takich danych oraz
          uchylenia dyrektywy 95/46/WE (ogólne rozporządzenie o ochronie danych,
          dalej „RODO”), informujemy, iż:
        </p>
        <ol className="mx-8 list-decimal">
          <li>
            Administratorem Pani/Pana danych osobowych (dalej „Administratorem”)
            jest Politechnika Wrocławska z siedzibą przy ul. Wybrzeże Stanisława
            Wyspiańskiego 27, 50-370 Wrocław, NIP: 8960005851, REGON: 000001614.
          </li>
          <li>
            W sprawach związanych z ochroną danych osobowych można kontaktować
            się z Administratorem Ochrony Danych pod adresem e-mail
            eventownik@pwr.edu.pl
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
          <li>Dane są przetwarzane w sposób zautomatyzowany.</li>
          <li>
            Przetwarzane będą Pani/Pana poniższe dane:
            <ol className="mx-4 list-[lower-alpha] [&>li]:my-1">
              <li>email</li>
              <li>
                dane dotyczące urządzenia tj. adres IP, dane sesji,
                identyfikator użytkownika
              </li>
              {event.attributes.map((attribute) => {
                return (
                  <li key={attribute.uuid}>
                    {getAttributeLabel(attribute.name, "pl")}
                    {attribute.isSensitiveData
                      ? ` (Wyrażam zgodę na przetwarzanie tej informacji w celu: '${attribute.reason ?? "nie podano"}')`
                      : ""}
                  </li>
                );
              })}
            </ol>
          </li>
          <li>
            Pani/Pana danych osobowe mogą być przekazywane:
            <ol className="mx-4 list-[lower-alpha] [&>li]:my-1">
              <li>
                uprawnionym podmiotom na podstawie obowiązujących przepisów (np.
                sądowi lub Policji)
              </li>
              <li>
                wolontariuszom świadczącym usługi w imieniu Administratora w
                niezbędnym do tego celu zakresie
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
              <li>przenoszenia swoich danych osobowych,</li>
              <li>
                wniesienia sprzeciwu wobec przetwarzania swoich danych osobowych
                z przyczyn związanych z szczególną Pani/Pana sytuacją zgodnie z
                art. 21 RODO.
              </li>
            </ol>
          </li>
          <li>
            Niezależnie od powyższego, przysługuje Pani/Panu uprawnienie do
            wniesienia skargi do organu nadzorczego, tj. Prezesa Urzędu Ochrony
            Danych Osobowych, gdy uznają Państwo, iż przetwarzanie Państwa
            danych osobowych narusza przepisy RODO.
          </li>
          <li>
            Podanie przez Pana/Panią danych osobowych jest dobrowolne, ale
            niezbędne do realizacji usługi.
          </li>
        </ol>
      </div>
    </EventPageLayout>
  );
}
