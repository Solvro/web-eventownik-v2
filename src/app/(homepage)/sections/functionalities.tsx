"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  CircleEllipsis,
  FilePenLine,
  Mail,
  Pencil,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { JSX } from "react";
import { useRef } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";

function FeatureTile({
  name,
  description,
  icon,
}: {
  name: string;
  description: string;
  icon: JSX.Element;
}) {
  return (
    <div className="flex max-w-80 flex-col gap-8">
      <div className="w-min rounded-2xl bg-[#3672FD]/15 p-4 text-[#3672FD]">
        {icon}
      </div>
      <div className="space-y-1.5">
        <p className="text-lg font-medium">{name}</p>
        <p className="text-[#515151] dark:text-[#B4B4B4]">{description}</p>
      </div>
    </div>
  );
}

function FeatureStep({ step }: { step: number }) {
  return <p className="text-lg font-medium sm:text-2xl">Krok {step}</p>;
}

function FeatureTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-2xl font-medium sm:text-5xl">{children}</p>;
}

function FeatureDescription({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-base text-[#515151] sm:text-2xl dark:text-[#B4B4B4]">
      {children}
    </p>
  );
}

function CustomAccordionItem({
  value,
  title,
  children,
}: {
  value: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AccordionItem value={value}>
      <AccordionTrigger className="text-3xl font-bold">
        {title}
      </AccordionTrigger>
      <AccordionContent className="flex flex-col items-start gap-6 text-balance">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}

export function Functionalities() {
  const targetRef = useRef<HTMLDivElement>(null);

  // Get scroll progress relative to target element
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end end"],
    // "start end": top of target hits bottom of viewport
    // "end start": bottom of target hits top of viewport
  });

  // Map progress to fade & slide
  const opacity = useTransform(scrollYProgress, [0.3, 1], [1, 0]);
  const y = useTransform(scrollYProgress, [0.1, 0.6], [-100, 200]);
  const scale = useTransform(scrollYProgress, [0.1, 0.6], [1, 0.5]);

  return (
    <section className="flex w-full flex-col items-center">
      <div className="flex flex-col items-center px-4 pt-24 sm:pt-48">
        {/* This will get covered */}
        <motion.div
          style={{ opacity, y, scale }}
          className="sticky top-0 container flex w-full flex-col items-center gap-8 text-center"
        >
          <div className="rounded-full bg-gradient-to-r from-[#6583C8] to-[#80B3FF] p-0.5">
            <p className="flex h-full w-full rounded-full bg-[#a7b3cd] px-4 py-2 text-sm font-medium sm:text-base dark:bg-[#192237]">
              Funkcjonalności
            </p>
          </div>
          <p className="text-5xl font-bold sm:text-7xl">
            Zakres dostępnych działań dla organizatora
          </p>
          <p className="text-xl text-[#191A1A] sm:text-3xl dark:text-[#D9E8FF]">
            Sprawdź, co możesz zrobić i jak skorzystać z dostępnych możliwości!
          </p>
        </motion.div>
        {/* Functionalities */}
        <div
          ref={targetRef}
          className="z-10 w-full max-w-[104rem] rounded-t-[2.5rem] border-x border-t border-[#798DDE] bg-[#1B4AE4]/40 px-2 pt-2 drop-shadow-[0_-35px_250px_rgba(56,115,255,0.69)] sm:rounded-t-[3rem] sm:px-4 sm:pt-4 dark:bg-[#26486E]/40"
        >
          <div className="divide-input flex w-full flex-col divide-y-[1px] divide-dashed overflow-hidden rounded-t-4xl bg-[#ffffff] dark:bg-[#101011]">
            {/* Step 1 */}
            <div className="grid w-full grid-cols-1 gap-8 p-4 sm:gap-16 sm:p-16 lg:grid-cols-2">
              <div className="flex w-full flex-col gap-8 sm:gap-16">
                <div className="w-full space-y-4">
                  <FeatureStep step={1} />
                  <FeatureTitle>Tworzenie i konfiguracja wydarzeń</FeatureTitle>
                </div>
                <FeatureDescription>
                  Zakładanie wydarzeń przez organizatora, ustawianie atrybutów
                  uczestników oraz dodawanie współorganizatorów.
                </FeatureDescription>
                <FeatureTile
                  name={"Personalizacja wydarzenia"}
                  description={
                    "Pozwala dostosować wygląd, formularze rejestracyjne i ustawienia do potrzeb uczestników i charakteru spotkania."
                  }
                  icon={<Pencil />}
                />
              </div>
              <Image
                src="/assets/landing/functionalities/event-creation.png"
                alt="Krok 1 - Tworzenie i konfiguracja wydarzeń"
                className="order-first rounded-3xl sm:order-last lg:max-w-5xl"
                width={2000}
                height={1000}
              />
            </div>
            {/* New functionalities */}
            <div className="divide-input grid w-full grid-cols-1 divide-y divide-dashed sm:gap-8 sm:divide-x-[1px] lg:grid-cols-2">
              <div className="flex flex-col-reverse overflow-hidden p-4 sm:flex-row sm:py-16 sm:pr-6 sm:pl-16">
                <div className="z-20 flex min-w-3xs flex-col gap-8 sm:gap-16">
                  <div className="w-full space-y-4">
                    <Badge variant="outline" className="text-sm uppercase">
                      Nowe
                    </Badge>
                    <FeatureTitle>Maile</FeatureTitle>
                  </div>
                  <FeatureDescription>
                    Tworzenie szablonów z dynamicznymi danymi, automatyczna i
                    grupowa wysyłka maili w zależności od statusu uczestnika.
                  </FeatureDescription>
                  <FeatureTile
                    name={"Powiadomienia e-mail"}
                    description={
                      "Automatyczne wysyłanie informacji przez organizatora do uczestników."
                    }
                    icon={<Mail />}
                  />
                </div>
                {/* Am I the only one who thought it was an image in the design? */}
                <div className="relative">
                  <span className="absolute z-10 h-full w-full bg-gradient-to-b from-transparent to-white to-90% dark:to-[#101011]" />
                  <div className="flex h-72 flex-col gap-4 overflow-hidden sm:h-auto">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div
                        key={index}
                        className="border-input flex h-min flex-row gap-6 rounded-2xl border bg-[#f7f7f7] p-6 dark:bg-[#151515]"
                      >
                        <Image
                          src={"/assets/landing/gmail.png"}
                          alt="Gmail logo"
                          className="size-10"
                          width={40}
                          height={40}
                        />
                        <div className="flex h-min flex-col gap-1">
                          <p className="text-sm whitespace-nowrap">
                            Eventownik - nowe wydarzenie &#x2022;
                            <span className="text-xs text-[#515151] dark:text-[#B4B4B4]">
                              {" "}
                              2 minuty temu
                            </span>
                          </p>
                          <p className="text-xs text-[#515151] dark:text-[#B4B4B4]">
                            Dodano nowe wydarzenie, sprawdź je!
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col-reverse p-4 sm:flex-row sm:gap-8 sm:p-16">
                <div className="flex min-w-3xs flex-col gap-8 sm:gap-16">
                  <div className="w-full space-y-4">
                    <Badge variant="outline" className="text-sm uppercase">
                      Nowe
                    </Badge>
                    <FeatureTitle>Strona wydarzenia</FeatureTitle>
                  </div>
                  <FeatureDescription>
                    Publiczna strona z harmonogramem i aktualnościami, gotowa do
                    udostępnienia w mediach społecznościowych.
                  </FeatureDescription>
                  <FeatureTile
                    name={"Strona rejestracyjna"}
                    description={
                      "Generowana automatycznie, zawiera wszystkie kluczowe informacje: termin, miejsce, opis i formularz rejestracji."
                    }
                    icon={<CircleEllipsis />}
                  />
                </div>
                <div className="relative space-y-4">
                  <span className="absolute z-10 h-full w-full bg-gradient-to-b from-transparent to-white to-90% dark:to-[#101011]" />
                  <Image
                    src="/assets/landing/functionalities/event-page.png"
                    alt="Strona wydarzenia"
                    className="rounded-3xl"
                    width={2000}
                    height={1000}
                  />
                  <Image
                    src="/assets/landing/functionalities/event-page-2.png"
                    alt="Strona wydarzenia - widok 2"
                    className="rounded-3xl"
                    width={2000}
                    height={1000}
                  />
                </div>
              </div>
            </div>
            {/* Step 2 */}
            <div className="grid w-full grid-cols-1 gap-8 p-4 sm:gap-16 sm:p-16 lg:grid-cols-2">
              <div className="grid grid-cols-2 gap-4 sm:gap-8">
                <Image
                  src="/assets/landing/functionalities/form.png"
                  alt="Widok formularza"
                  className="h-full rounded-3xl object-contain"
                  width={500}
                  height={1000}
                />
                <Image
                  src="/assets/landing/functionalities/signup.png"
                  alt="Widok zapisów"
                  className="h-full rounded-3xl object-contain"
                  width={500}
                  height={1000}
                />
              </div>
              <div className="flex w-full flex-col gap-8 sm:gap-16">
                <div className="w-full space-y-4">
                  <FeatureStep step={2} />
                  <FeatureTitle>Formularze i zapisy na miejsca</FeatureTitle>
                </div>
                <FeatureDescription>
                  Tworzenie formularzy z wybranymi atrybutami, generowanie
                  linków rejestracyjnych i automatyczne udostępnianie formularzy
                  II etapu - w tym zapisy na miejsca aktualizowane w czasie
                  rzeczywistym.
                </FeatureDescription>
                <FeatureTile
                  name={"Zarządzanie zapisami"}
                  description={
                    "Ustaw w jaki sposób będą pokazywać się osoby zapisane na poszczególne miejsca - anonimowo, imię i nazwisko, a może nawet inny atrybut."
                  }
                  icon={<FilePenLine />}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-input z-20 flex w-full flex-col items-center border-t border-dashed bg-white dark:bg-[#101011]">
        <div className="container grid grid-cols-1 lg:grid-cols-2">
          <div className="z-10 space-y-12 bg-white p-16 dark:bg-[#101011]">
            <div className="space-y-2">
              <Accordion
                type="single"
                collapsible
                className="divide-input w-full"
                defaultValue="contact"
              >
                <CustomAccordionItem value="contact" title="Osoba kontaktowa">
                  <p className="text-xl font-medium text-[#515151] dark:text-[#B4B4B4]">
                    Przy zakładaniu wydarzenia na Eventowniku zachęcamy do
                    kontaktu z naszą osobą kontaktową - chętnie wytłumaczymy i
                    pomożemy w razie problemów. Jednak jeśli nie czujesz takiej
                    potrzeby, możesz założyć wydarzenie w pełni samodzielnie!
                  </p>
                  <Button
                    asChild
                    variant="link"
                    className="p-0 text-xl font-medium text-[#6583c8]"
                  >
                    <Link href="mailto:eventownik@pwr.edu.pl">
                      Skontaktuj się z nami <ArrowRight />
                    </Link>
                  </Button>
                  <div className="space-y-2">
                    <p className="text-xl font-medium">
                      Osoba do kontaktu: Amelia Sroczyńska (Project Manager
                      Eventownika)
                    </p>
                    <ul className="list-inside list-disc text-lg">
                      <li>Telefon: (+48) 606 365 628</li>
                      <li>Email: eventownik@pwr.edu.pl</li>
                    </ul>
                  </div>
                </CustomAccordionItem>
                <CustomAccordionItem
                  value="instruction"
                  title="Jasna instrukcja"
                >
                  <p className="text-xl font-medium text-[#515151] dark:text-[#B4B4B4]">
                    Aby ułatwić organizatorom stworzenie ich pierwszego
                    wydarzenia na Eventowniku oraz pozwolić im w pełni
                    wykorzystać możliwości platformy, przygotowaliśmy
                    przejrzystą i szczegółową instrukcję opisującą wszystkie
                    dostępne funkcje.
                  </p>
                  <Button
                    asChild
                    variant="link"
                    className="p-0 text-xl font-medium text-[#6583c8]"
                  >
                    <Link href="/">
                      Zapoznaj się z instrukcją <ArrowRight />
                    </Link>
                  </Button>
                </CustomAccordionItem>
                <CustomAccordionItem
                  value="no-account-needed"
                  title="Brak potrzeby zakładania konta dla uczestników"
                >
                  <p className="text-xl font-medium text-[#515151] dark:text-[#B4B4B4]">
                    Uczestnicy zapisują się na wydarzenie bez korzystania z
                    konta - nie muszą go wcale zakładać. Konto wymagane jest
                    jedynie dla organizatorów, aby utworzyć wydarzenie.
                  </p>
                  <Button
                    asChild
                    variant="link"
                    className="p-0 text-xl font-medium text-[#6583c8]"
                  >
                    <Link href="/auth/register">
                      Utwórz konto <ArrowRight />
                    </Link>
                  </Button>
                </CustomAccordionItem>
                <CustomAccordionItem
                  value="multiple-coorganizers"
                  title="Współtworzenie wydarzenia przez wiele osób"
                >
                  <p className="text-xl font-medium text-[#515151] dark:text-[#B4B4B4]">
                    Podczas tworzenia wydarzenia istnieje możliwość dodania
                    współorganizatorów oraz przypisania im konkretnych
                    uprawnień, takich jak dostęp wyłącznie do listy uczestników
                    czy możliwość edycji formularza. Dzięki temu współpraca
                    staje się znacznie łatwiejsza, gdy wydarzenie jest
                    realizowane przez cały sztab organizacyjny!
                  </p>
                </CustomAccordionItem>
                <CustomAccordionItem value="security" title="Bezpieczeństwo">
                  <p className="text-xl font-medium text-[#515151] dark:text-[#B4B4B4]">
                    Eventownik powstał przy konsultacji z jednostkami
                    Politechniki Wrocławskiej - Działem Informatyzacji, Działem
                    Informatyzacji, Inspektorem Ochrony Danych i innymi. Dzięki
                    temu spełnia najwyższe standardy bezpieczeństwa. Co więcej,
                    wytrzyma nawet bardzo duże obciążenia i może obsłużyć
                    jednocześnie duże ilości użytkowników bez utraty
                    stabilności.
                  </p>
                </CustomAccordionItem>
              </Accordion>
            </div>
          </div>
          <div className="flex flex-col items-center -space-y-32 px-8 py-16">
            <div className="-translate-x-8 rounded-4xl border border-[#798DDE] bg-[#1B4AE4]/40 p-2 drop-shadow-[0_-4px_72px_rgba(56,115,255,0.69)] dark:bg-[#26486E]/40">
              <Image
                src="/assets/landing/functionalities/organizer-view.jpg"
                alt="Organizer View"
                className="max-w-xl rounded-3xl"
                width={2000}
                height={1000}
              />
            </div>
            <div className="translate-x-8 rounded-4xl border border-[#798DDE] bg-[#1B4AE4]/40 p-2 drop-shadow-[0_-4px_72px_rgba(56,115,255,0.69)] dark:bg-[#26486E]/40">
              <Image
                src="/assets/landing/functionalities/organizer-view.jpg"
                alt="Organizer View"
                className="max-w-xl rounded-3xl"
                width={2000}
                height={1000}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
