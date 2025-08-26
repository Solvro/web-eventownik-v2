"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  CircleEllipsis,
  ClipboardList,
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

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import EventPageScreenshot2 from "./images/event-page-screenshot-2.png";
import EventPageScreenshot from "./images/event-page-screenshot.png";
import Events from "./images/events.png";
import Forms from "./images/forms.jpg";
import Gmail from "./images/gmail.png";
import OrganizerView from "./images/organizer-view.jpg";

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
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
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
      <div className="flex flex-col items-center px-6 pt-48">
        {/* This will get covered */}
        <motion.div
          style={{ opacity, y, scale }}
          className="sticky top-0 container flex w-full flex-col items-center gap-8 px-4 text-center"
        >
          <div className="rounded-full bg-gradient-to-r from-[#6583C8] to-[#80B3FF] p-0.5">
            <p className="flex h-full w-full rounded-full bg-[#a7b3cd] px-4 py-2 font-medium dark:bg-[#192237]">
              Funkcjonalności
            </p>
          </div>
          <p className="text-7xl font-bold">
            Zakres dostępnych działań dla organizatora
          </p>
          <p className="text-3xl text-[#191A1A] dark:text-[#D9E8FF]">
            Sprawdź, co możesz zrobić i jak skorzystać z dostępnych możliwości!
          </p>
        </motion.div>
        {/* Functionalities */}
        <div
          ref={targetRef}
          className="z-10 w-full max-w-[104rem] rounded-t-[3rem] border-x border-t border-[#798DDE] bg-[#1B4AE4]/40 px-4 pt-4 drop-shadow-[0_-35px_250px_rgba(56,115,255,0.69)] dark:bg-[#26486E]/40"
        >
          <div className="divide-input flex w-full flex-col divide-y-[1px] divide-dashed overflow-hidden rounded-t-4xl bg-[#ffffff] dark:bg-[#101011]">
            {/* Step 1 */}
            <div className="grid w-full grid-cols-1 gap-8 p-16 lg:grid-cols-2">
              <div className="flex w-full flex-col gap-16">
                <div className="w-full space-y-4">
                  <p className="text-2xl font-medium">Krok 1</p>
                  <p className="text-5xl font-medium">
                    Tworzenie i konfiguracja wydarzeń
                  </p>
                </div>
                <p className="text-muted-foreground text-2xl">
                  Zakładanie wydarzeń przez organizatora, ustawianie atrybutów
                  uczestników oraz dodawanie współorganizatorów.
                </p>
                <FeatureTile
                  name={"Personalizacja wydarzenia"}
                  description={
                    "Pozwala dostosować wygląd, formularze rejestracyjne i ustawienia do potrzeb uczestników i charakteru spotkania."
                  }
                  icon={<Pencil />}
                />
              </div>
              <Image
                src={Events}
                alt="Krok 1 - Tworzenie i konfiguracja wydarzeń"
                className="rounded-3xl lg:max-w-5xl"
              />
            </div>
            {/* New functionalities */}
            <div className="divide-input grid w-full grid-cols-1 gap-8 divide-x-[1px] divide-dashed lg:grid-cols-2">
              <div className="flex flex-row gap-8 overflow-hidden py-16 pr-6 pl-16">
                <div className="flex min-w-3xs flex-col gap-16">
                  <div className="w-full space-y-4">
                    <Badge variant="outline" className="text-sm uppercase">
                      Nowe
                    </Badge>
                    <p className="text-5xl font-medium">Maile</p>
                  </div>
                  <p className="text-muted-foreground text-2xl">
                    Tworzenie szablonów z dynamicznymi danymi, automatyczna i
                    grupowa wysyłka maili w zależności od statusu uczestnika.
                  </p>
                  <FeatureTile
                    name={"Powiadomienia e-mail"}
                    description={
                      "Automatyczne wysyłanie informacji przez organizatora do uczestników."
                    }
                    icon={<Mail />}
                  />
                </div>
                {/* Am I the only one who thought it was an image in the design? */}
                <div className="relative space-y-4">
                  <span className="absolute z-10 h-full w-full bg-gradient-to-b from-transparent to-white to-90% dark:to-[#101011]" />
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="border-input flex h-min flex-row gap-6 overflow-hidden rounded-2xl border bg-[#f7f7f7] p-6 dark:bg-[#151515]"
                    >
                      <Image src={Gmail} alt="Gmail logo" className="size-10" />
                      <div className="flex h-min flex-col gap-1">
                        <p className="text-sm whitespace-nowrap">
                          Eventownik - nowe wydarzenie &#x2022;
                          <span className="text-muted-foreground text-xs">
                            {" "}
                            2 minuty temu
                          </span>
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Dodano nowe wydarzenie, sprawdź je!
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-row gap-8 p-16">
                <div className="flex min-w-3xs flex-col gap-16">
                  <div className="w-full space-y-4">
                    <Badge variant="outline" className="text-sm uppercase">
                      Nowe
                    </Badge>
                    <p className="text-5xl font-medium">Strona wydarzenia</p>
                  </div>
                  <p className="text-muted-foreground text-2xl">
                    Publiczna strona z harmonogramem i aktualnościami, gotowa do
                    udostępnienia w mediach społecznościowych.
                  </p>
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
                    src={EventPageScreenshot}
                    alt="Strona wydarzenia"
                    className="rounded-3xl"
                  />
                  <Image
                    src={EventPageScreenshot2}
                    alt="Strona wydarzenia - widok 2"
                    className="rounded-3xl"
                  />
                </div>
              </div>
            </div>
            {/* Step 2 */}
            {/*
        <div className="flex flex-col gap-8 p-16 lg:flex-row">
          <Image
            src={step1Image}
            alt="Krok 1 - Tworzenie i konfiguracja wydarzeń"
            className="self-center rounded-3xl lg:max-w-5xl lg:-translate-x-1/2"
          />
          <div className="flex w-full flex-col gap-16 pr-16 lg:max-w-1/2">
            <div className="w-full space-y-4">
              <p className="text-2xl font-medium">Krok 2</p>
              <p className="text-5xl font-medium">
                Tworzenie i konfiguracja wydarzeń
              </p>
            </div>
            <p className="text-muted-foreground text-2xl">
              Zakładanie wydarzeń przez organizatora, ustawianie atrybutów
              uczestników oraz dodawanie współorganizatorów.
            </p>
            <FeatureTile
              name={"Personalizacja wydarzenia"}
              description={
                "Pozwala dostosować wygląd, formularze rejestracyjne i ustawienia do potrzeb uczestników i charakteru spotkania."
              }
              icon={<Pencil />}
            />
          </div>
        </div>*/}
            {/* Step 2 */}
            <div className="grid w-full grid-cols-1 gap-8 p-16 lg:grid-cols-2">
              <div className="flex w-full flex-col gap-16">
                <div className="w-full space-y-4">
                  <p className="text-2xl font-medium">Krok 2</p>
                  <p className="text-5xl font-medium">Formularze</p>
                </div>
                <p className="text-muted-foreground text-2xl">
                  Tworzenie formularzy z wybranymi atrybutami, generowanie
                  linków rejestracyjnych i automatyczne udostępnianie formularzy
                  II etapu.
                </p>
                <FeatureTile
                  name={"Zarządzanie szczegółami"}
                  description={
                    "Ustaw datę, miejsce, agendę i prowadzących wydarzenie."
                  }
                  icon={<ClipboardList />}
                />
              </div>
              <Image
                src={Forms}
                alt="Krok 2 - Formularze"
                className="rounded-3xl lg:max-w-5xl"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="border-input z-20 flex w-full flex-col items-center border-t border-dashed bg-white dark:bg-[#101011]">
        <div className="container grid grid-cols-1 lg:grid-cols-2">
          <div className="z-10 space-y-12 bg-white p-16 dark:bg-[#101011]">
            <div className="space-y-6">
              <p className="text-3xl font-bold">Kopiowanie wydarzenia</p>
              <p className="text-muted-foreground text-2xl font-medium">
                Skorzystaj z opcji kopiowania — wszystkie dane zostaną
                automatycznie uzupełnione. Wystarczy nanieść ewentualne zmiany i
                gotowe!
              </p>
            </div>
            <div className="space-y-2">
              <Button
                asChild
                variant="link"
                className="p-0 text-xl font-medium text-[#6583c8]"
              >
                <Link href="/">
                  Więcej informacji <ArrowRight />
                </Link>
              </Button>
              <Accordion
                type="single"
                collapsible
                className="divide-input border-input w-full border-t"
                defaultValue="item-1"
              >
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-2xl font-bold">
                    Limit miejsc
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4 text-balance">
                    <p>
                      Our flagship product combines cutting-edge technology with
                      sleek design. Built with premium materials, it offers
                      unparalleled performance and reliability.
                    </p>
                    <p>
                      Key features include advanced processing capabilities, and
                      an intuitive user interface designed for both beginners
                      and experts.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-2xl font-bold">
                    Ukrywanie wydarzenia
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4 text-balance">
                    <p>
                      We offer worldwide shipping through trusted courier
                      partners. Standard delivery takes 3-5 business days, while
                      express shipping ensures delivery within 1-2 business
                      days.
                    </p>
                    <p>
                      All orders are carefully packaged and fully insured. Track
                      your shipment in real-time through our dedicated tracking
                      portal.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-2xl font-bold">
                    Własne pytania w formularzu
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4 text-balance">
                    <p>
                      We stand behind our products with a comprehensive 30-day
                      return policy. If you&apos;re not completely satisfied,
                      simply return the item in its original condition.
                    </p>
                    <p>
                      Our hassle-free return process includes free return
                      shipping and full refunds processed within 48 hours of
                      receiving the returned item.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-2xl font-bold">
                    Rejestracja
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4 text-balance">
                    <p>
                      We stand behind our products with a comprehensive 30-day
                      return policy. If you&apos;re not completely satisfied,
                      simply return the item in its original condition.
                    </p>
                    <p>
                      Our hassle-free return process includes free return
                      shipping and full refunds processed within 48 hours of
                      receiving the returned item.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
          <div className="flex flex-col items-center -space-y-32 px-8 py-16">
            <div className="-translate-x-8 rounded-4xl border border-[#798DDE] bg-[#1B4AE4]/40 p-2 drop-shadow-[0_-4px_72px_rgba(56,115,255,0.69)] dark:bg-[#26486E]/40">
              <Image
                src={OrganizerView}
                alt="Organizer View"
                className="max-w-xl rounded-3xl"
              />
            </div>
            <div className="translate-x-8 rounded-4xl border border-[#798DDE] bg-[#1B4AE4]/40 p-2 drop-shadow-[0_-4px_72px_rgba(56,115,255,0.69)] dark:bg-[#26486E]/40">
              <Image
                src={OrganizerView}
                alt="Organizer View"
                className="max-w-xl rounded-3xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
