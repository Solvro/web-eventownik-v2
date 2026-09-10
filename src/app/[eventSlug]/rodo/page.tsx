import { formatRelative, subDays } from "date-fns";
import { getLocale } from "next-intl/server";
import Link from "next/link";

import { getDateLocale } from "@/i18n/utils";
import { API_URL } from "@/lib/api";
import type { Event } from "@/types/event";

import { EventNotFound } from "../event-not-found";
import { EventPageLayout } from "../event-page-layout";

interface RodoPageProps {
  params: Promise<{ eventSlug: string }>;
}

export default async function RodoPage({ params }: RodoPageProps) {
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

  const locale = await getLocale();
  const dateLocale = getDateLocale(locale);

  return (
    <EventPageLayout
      event={event}
      description={event.description ?? ""}
      variant="form"
    >
      <article className="px-6 py-10 sm:px-10">
        <header className="mb-8 text-center">
          <h1 className="text-xl font-semibold">
            Informacja dotycząca przetwarzania danych osobowych dla osoby
            fizycznej uczestnika Wydarzenia w związku z zapisami przez własną
            aplikację Politechniki Wrocławskiej – Eventownik
          </h1>
          <p className="mt-3 text-sm">
            Ostatnia aktualizacja:{" "}
            {formatRelative(subDays(new Date(event.updatedAt), 3), new Date(), {
              locale: dateLocale,
            })}
          </p>
        </header>

        <div className="bg-primary/5 m-2 space-y-10 rounded-md p-4">
          <section>
            <h2 className="mb-3 font-semibold">
              1. Tożsamość administratora danych i jego dane kontaktowe
            </h2>
            <p>
              Administratorem Pana/Pani danych osobowych jest Politechnika
              Wrocławska z siedzibą we Wrocławiu. Politechnika Wrocławska ma
              siedzibę przy Wybrzeżu Wyspiańskiego 27 (50-370) we Wrocławiu. Z
              administratorem można się kontaktować w pierwszej kolejności na
              adres organizatora Wydarzenia:{" "}
              <span className="font-medium">{event.contactEmail}</span>.
            </p>
            <p className="mt-3">
              Z Administratorem można się też skontaktować pocztą tradycyjną na
              adres siedziby Uczelni.
            </p>
            <p className="mt-3">
              Dodatkowe (alternatywne) dane kontaktowe administratora:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                formularz na stronie:{" "}
                <Link
                  href="https://www.pwr.edu.pl/kontakt"
                  className="text-(--event-primary-color)/90 underline"
                  target="_blank"
                >
                  www.pwr.edu.pl/kontakt
                </Link>
              </li>
              <li>adres ePUAP: /PolitechnikaWroclaw/SkrytkaESP</li>
              <li>adres do e-doręczeń: AE:PL-90232-41299-GTBVI-12</li>
            </ul>
            <p className="mt-3">
              W Politechnice Wrocławskiej wyznaczono Inspektora Ochrony Danych
              (IOD). Kontakt z IOD mailowo: iod@pwr.edu.pl (albo na powyższe
              adresy z dopiskiem „dla IOD PWr”).
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-semibold">2. Źródło pochodzenia danych</h2>
            <p>
              Jeśli danych osobowych nie uzyskujemy bezpośrednio od Pana/Pani,
              to takie dane zazwyczaj udostępnia Organizatorowi podmiot, który
              Pana/Panią kieruje lub deleguje na Wydarzenie. Robią to zazwyczaj
              przedstawiciele podmiotu/firmy/instytucji przy uzgodnieniach
              roboczych i ustalaniu składu osobowego swoich przedstawicieli na
              Wydarzenie. Dane osobowe pozyskujemy też i uzupełniamy, czerpiąc z
              publicznie dostępnych źródeł – w tym stron WWW.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-semibold">3. Zakres danych</h2>
            <p>
              Niezbędne są dane w zakresie koniecznym do realizacji i
              rozliczenia świadczeń wynikających z Umowy zawieranej z
              Politechniką Wrocławską. W sytuacji jeśli określono zasady, którym
              ma podlegać Wydarzenie (np. regulamin, przepisy porządkowe itp.),
              a uczestnik jest zobowiązany je zaakceptować i stosować (a jest to
              warunkiem zapisu na Wydarzenie), to Uczestnik zawiera umowę z
              Organizatorem (choćby nawet nieodpłatną). Przetwarzanie danych
              jest wtedy już niezbędne do wykonania umowy lub do podjęcia
              działań na żądanie osoby, której dane dotyczą, przed zawarciem
              umowy. Zakres takich danych nie wykracza co do zasady ponad imiona
              i nazwisko lub podstawowe dane identyfikacyjne i kontaktowe oraz
              numer PESEL (w przypadku podpisania np. zgłoszenia czy
              korespondencji kwalifikowanym podpisem elektronicznym zgodnie z
              art. 78(1) § 1 Kodeksu cywilnego). Podanie danych jest konieczne
              do zawarcia takiej umowy o udział w Wydarzeniu, ale samo jej
              zawarcie jest dobrowolne.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-semibold">
              4. Cel i okresy przetwarzania danych osobowych
            </h2>
            <p>
              Pani/Pana dane osobowe Politechnika Wrocławska przetwarza w celu:
            </p>
            <ul className="mt-2 list-disc space-y-3 pl-5">
              <li>
                wykonania zobowiązań umownych związanych z udziałem w Wydarzeniu
                osoby, której dane dotyczą (na podstawie art. 6 ust. 1 lit. b
                RODO); przetwarzanie danych będzie trwać co najmniej przez okres
                obowiązywania umowy;
              </li>
              <li>
                realizacji obowiązków prawnych (w tym rachunkowych, podatkowych
                i dotyczących finansów publicznych), ponieważ administrator musi
                przechowywać dokumenty księgowe (przez okres 5 lat liczony od
                początku roku następującego po roku obrotowym, w którym
                zatwierdzono sprawozdanie finansowe, którego te dokumenty
                dotyczą), musi je archiwizować (przez okres przewidziany w
                jednolitym rzeczowym wykazie akt Uczelni) i jest zobowiązany do
                dochodzenia należności Skarbu Państwa (uzasadniony okres
                przetwarzania danych jest tu uzależniony od okresów
                przedawnienia określonych w kodeksie cywilnym, w szczególności w
                księdze pierwszej (tytuł VI, art. 117–125), i może wynosić 6 lat
                albo 3 lata – dla roszczeń związanych z prowadzeniem
                działalności gospodarczej – lub 2 lata od dnia oddania dzieła w
                związku z art. 646 k.c.); podstawą przetwarzania są art. 6 ust.
                1 lit. c RODO w związku z przepisami prawa właściwego dla tych
                obowiązków;
              </li>
              <li>
                wykonania zadania realizowanego w interesie publicznym
                podejmowanego dla dobra ogółu, które obejmuje działania takie
                jak promocja osiągnięć nauki i wiedzy (zgodnie z art. 6 ust. 1
                lit. e RODO); przetwarzanie takie administrator danych realizuje
                co najmniej w okresie samej realizacji takiego zadania oraz
                później – w przewidzianych na podstawie prawa okresach
                trwałości, sprawozdawczości i raportowania (ewaluacji i
                kontroli);
              </li>
              <li>
                realizacji uzasadnionych prawnie interesów, takich jak
                zapobieganie nadużyciom, oszustwom i dbałość o bezpieczeństwo
                świadczenia usług (w tym przez systemy teleinformatyczne
                Politechniki Wrocławskiej podlegającej wymogom Ustawy o Krajowym
                Systemie Cyberbezpieczeństwa) – przez okres odpowiedni dla
                danego obowiązku prawnego (podstawa: art. 6 ust. 1 lit. f RODO);
                do takiego przetwarzania nie dochodzi w sytuacji, w której
                nadrzędny wobec interesów administratora (lub strony trzeciej)
                charakter mają interesy lub podstawowe prawa i wolności osoby,
                której dane dotyczą.
              </li>
            </ul>
            <p className="mt-3">
              Przetwarzanie danych w tych celach jest niezbędne
              Administratorowi, a odmowa udostępnienia danych uniemożliwi udział
              w Wydarzeniu objętym zapisami. Dostęp do podawanych przy zapisach
              danych mają upoważnione przez Administratora osoby, w ramach
              wykonywanych obowiązków i zadań służbowych (np. do kontaktu,
              weryfikacji uprawnień, nadzoru nad bezpieczeństwem systemów itd.).
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-semibold">5. Odbiorcy danych</h2>
            <p>
              Odbiorcami Pana/Pani danych (w rozumieniu art. 4 pkt 9 RODO) mogą
              być podmioty (prawne i osoby fizyczne), którym administrator te
              dane udostępni, np. w związku ze współuczestnictwem w organizacji
              Wydarzenia, sponsorowaniem Wydarzenia, zapewnieniem obsługi
              logistycznej, pobytowej i cateringowej, ale też w związku z
              obsługą prawną Uczelni, audytami, doradztwem oraz rozliczeniem
              (np. będą to też operatorzy płatności on-line w przypadku Wydarzeń
              odpłatnych).
            </p>
            <p className="mt-3">
              Konkretni odbiorcy danych dla tego Wydarzenia:{" "}
              <span className="font-medium">
                {event.dataRecipients ??
                  "brak dodatkowych zewnętrznych odbiorców"}
              </span>
            </p>
            <p className="mt-3">
              Administrator udostępnia dane osobowe wykonawcom usług
              informatycznych (w tym komunikacji na odległość), archiwalnych,
              przechowywania i niszczenia dokumentów, ochrony mienia i osób,
              pocztowych i przewozowych itp. W takich przypadkach przetwarzają
              oni dane osobowe za Uczelnię zazwyczaj na podstawie umowy
              powierzenia przetwarzania danych osobowych.
            </p>
            <p className="mt-3">
              Odbiorcy mogą stać się odrębnymi administratorami danych we
              własnych celach, o czym mogą odrębnie informować, a w niektórych
              przypadkach także poprosić Pana/Panią o zgodę na przetwarzanie.
            </p>
            <p className="mt-3">
              W przypadku prowadzenia komunikacji on-line dane osobowe mogą
              zostać udostępnione dostawcom takich usług (w tym również spoza
              EOG) na podstawie odpowiedniej decyzji stwierdzającej odpowiedni
              stopień ochrony w państwie docelowym. Od 10 lipca 2023 roku
              transfer danych do organizacji w USA odbywa się na podstawie
              porozumienia Data Privacy Framework. Lista takich podmiotów, do
              których można legalnie transferować Pana/Pani dane, znajduje się
              na:{" "}
              <Link
                href="https://www.dataprivacyframework.gov/s/participant-search"
                className="text-(--event-primary-color)/90 underline"
                target="_blank"
              >
                https://www.dataprivacyframework.gov/s/participant-search
              </Link>
              . Transferowane mogą być rozmaite dane osobowe: adres e-mail czy
              identyfikator uczestnika, ale też mogą to być dane o aktywności
              użytkownika w Internecie, a nawet treść komunikacji czy treść
              przesyłanych dokumentów. W związku z tym Administrator zaleca w
              komunikacji z sobą szyfrowanie załączników (w razie potrzeby
              zachowania poufności ich treści) i wspiera korzystanie z
              identyfikatorów nieujawniających tożsamości użytkownika.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-semibold">
              6. Prawa osób, których dane dotyczą
            </h2>
            <p>
              W związku z przetwarzaniem danych osobowych w celach związanych z
              zawieraniem umów z udziałem Politechniki Wrocławskiej,
              administrator danych zapewnia Pani/Panu (po potwierdzeniu
              tożsamości) prawa do:
            </p>

            <ul className="mt-2 list-disc space-y-3 pl-5">
              <li>
                uzyskania przejrzystych informacji o zakresie informacji na
                Pani/Pana temat przetwarzanych przez Administratora (art. 12–15
                RODO); Administrator danych ma obowiązek dostarczenia
                nieodpłatnie pierwszej kopii danych osobowych podlegających
                przetwarzaniu, z tym zastrzeżeniem, że nie może to niekorzystnie
                wpływać na prawa i wolności innych;
              </li>
              <li>
                żądania sprostowania (w tym poprawiania i uzupełniania) swoich
                danych osobowych (art. 16 RODO); jeżeli uważa Pan/Pani, że dane
                są niepełne lub nieprawdziwe, prosimy o kontakt celem ich
                uzupełnienia lub sprostowania;
              </li>
              <li>
                żądania usunięcia takich swoich danych osobowych (art. 17 RODO):
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>
                    które są już administratorowi zbędne do celów, w których
                    zostały zebrane albo były przetwarzane niezgodnie z prawem;
                  </li>
                  <li>
                    które zostały zebrane w związku z oferowaniem usług
                    społeczeństwa informacyjnego;
                  </li>
                  <li>
                    których dotyczy wycofana zgoda (jeśli przetwarzanie na niej
                    się opiera, a nie ma innej podstawy prawnej przetwarzania);
                  </li>
                  <li>
                    których dotyczy sprzeciw na mocy art. 21 RODO (z uwagi na
                    szczególną sytuację osoby, której dane dotyczą, albo po
                    prostu jeśli dane są przetwarzane na potrzeby marketingu
                    bezpośredniego);
                  </li>
                  <li>
                    które administrator musi usunąć w celu wywiązania się z
                    obowiązku prawnego, jakiemu on sam podlega.
                  </li>
                </ul>
              </li>
              <li>
                żądania ograniczenia przetwarzania (w związku z art. 18 RODO)
                swoich danych, jeśli:
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>kwestionuje Pan/Pani prawidłowość tych danych,</li>
                  <li>
                    przetwarzanie jest niezgodne z prawem, ale jednocześnie nie
                    chce Pan/Pani żądać usunięcia danych,
                  </li>
                  <li>
                    dane są zbędne administratorowi, ale potrzebne Pani/Panu do
                    ustalenia, dochodzenia lub obrony roszczeń.
                  </li>
                </ul>
              </li>
              <li>
                otrzymania od Politechniki Wrocławskiej swoich danych osobowych
                w ustrukturyzowanym, powszechnie używanym formacie nadającym się
                do odczytu maszynowego; może Pan/Pani przesłać te swoje dane
                osobowe innemu administratorowi (art. 20 RODO);
              </li>
              <li>
                niepodlegania decyzji, która opierałaby się wyłącznie na
                zautomatyzowanym przetwarzaniu danych osobowych (w tym
                profilowaniu) i wywoływałaby wobec Pana/Pani skutki prawne lub w
                podobny sposób istotnie na Pana/Panią wpływała (art. 21 RODO),
                chyba że taka decyzja jest niezbędna do zawarcia lub wykonania
                umowy między osobą, której dane dotyczą, a administratorem; w
                takim przypadku Politechnika zastosuje środki ochrony praw,
                wolności i prawnie uzasadnionych interesów osoby, której dane
                dotyczą – w tym zapewni możliwość wyrażenia własnego stanowiska
                i zakwestionowania tej decyzji wobec odpowiedniej osoby (lub
                osób) ze strony administratora danych.
              </li>
            </ul>

            <p className="mt-4">
              Ponadto osobie, której dotyczą dane osobowe i która uważa, że
              Administrator danych narusza RODO, przysługuje prawo do wniesienia
              skargi do Prezesa Urzędu Ochrony Danych (ul. Moniuszki 1A, 00-014
              Warszawa).
            </p>
          </section>
        </div>
      </article>
    </EventPageLayout>
  );
}
