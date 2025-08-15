"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { CircleEllipsis, Mail, Pencil } from "lucide-react";
import Image from "next/image";
import type { JSX } from "react";
import { useRef } from "react";

import { Badge } from "../ui/badge";
import step1Image from "./images/step1.png";

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
  const y = useTransform(scrollYProgress, [0.1, 1], [-100, 200]);

  return (
    <div className="container flex w-full flex-col items-center pt-48">
      {/* This will get covered */}
      <motion.div
        style={{ opacity, y }}
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
          Sprawdź, co możesz zrobić i jak skorzystać z dostępnych możliwości
        </p>
      </motion.div>
      {/* Functionalities */}
      <div
        ref={targetRef}
        className="bg-background divide-input z-10 mx-6 flex w-full flex-col divide-y-[1px] overflow-hidden rounded-4xl lg:grid-cols-2"
      >
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
            src={step1Image}
            alt="Krok 1 - Tworzenie i konfiguracja wydarzeń"
            className="max-w-5xl rounded-3xl"
          />
        </div>
        {/* New functionalities */}
        <div className="divide-input grid w-full grid-cols-1 gap-8 divide-x-[1px] lg:grid-cols-2">
          <div className="grid grid-cols-2 gap-8 p-16">
            <div className="flex flex-col gap-16">
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
            {/* was I the only one who thought it was an image in the design? */}
          </div>
          <div className="grid grid-cols-2 gap-8 p-16">
            <div className="flex flex-col gap-16">
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
            {/* was I the only one who thought it was an image in the design? */}
          </div>
        </div>
      </div>
    </div>
  );
}
