"use client";

import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

const asideContents = new Map<string, React.ReactNode>([
  [
    "contact",
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      key="contact"
      className="flex h-full w-full items-center justify-center px-4 pt-4 sm:pt-8 xl:justify-start xl:px-0"
    >
      <div className="relative grid h-full w-full max-w-3xl grid-cols-5 items-end gap-4 sm:grid-cols-2 sm:gap-0">
        <Image
          src="/assets/landing/functionalities/mobile-mockup.png"
          alt="Wygląd Eventownika na urządzeniach mobilnych"
          className="col-span-3 w-full justify-self-end rounded-3xl drop-shadow-[-200px_-35px_50000px_rgba(56,115,255,0.69)] sm:col-span-1 sm:px-8"
          width={2000}
          height={1000}
        />
        <div className="col-span-2 flex h-full w-full flex-col items-center justify-center gap-4 py-8 sm:col-span-1 sm:gap-8 sm:px-8">
          <p className="w-full rounded-full border border-black bg-transparent px-2 py-1.5 text-center text-xs font-medium drop-shadow-[0_-35px_100px_rgba(56,115,255,0.69)] sm:w-auto sm:px-5 sm:py-3 sm:text-lg dark:border-white">
            Project Manager Eventownik
          </p>
          <p className="z-10 text-center text-sm font-bold sm:text-3xl">
            Amelia Sroczyńska
          </p>
          <Image
            src="https://cms.solvro.pl/assets/8b57e57a-e701-4d9a-88e5-c254e9299fee?key=member"
            alt="Amelia Sroczyńska"
            width={250}
            height={250}
            className="aspect-square h-32 w-auto -rotate-6 rounded-4xl drop-shadow-[0px_-35px_500px_rgba(56,115,255,0.69)] sm:h-auto"
          />
          <div className="flex flex-col items-center text-center text-xs text-[#515151] sm:text-xl dark:text-[#B4B4B4]">
            <a href="tel:+48606365628">+48 606 365 628</a>
            <a href="mailto:eventownik@pwr.edu.pl">eventownik@pwr.edu.pl</a>
          </div>
        </div>
      </div>
    </motion.div>,
  ],
  [
    "instruction",
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      key="instruction"
      className="relative h-96 w-full overflow-visible sm:h-full sm:min-h-160"
    >
      <div className="absolute top-1/2 left-0 flex w-full -translate-y-1/2 justify-center overflow-visible xl:justify-start">
        <div className="grid w-full max-w-3xl grid-cols-2 items-center gap-4 overflow-visible px-4 sm:gap-8 sm:px-8">
          <div className="flex flex-col gap-4 overflow-visible sm:gap-8">
            <div className="overflow-visible rounded-[2.5rem] border border-[#798DDE] bg-[#26486E]/40 p-2 drop-shadow-[0_-35px_100px_rgba(56,115,255,0.69)]">
              <Image
                src="/assets/landing/functionalities/instruction-1.png"
                width={500}
                height={900}
                className="rounded-4xl"
                alt=""
              />
            </div>
            <div className="overflow-visible rounded-[2.5rem] border border-[#798DDE] bg-[#26486E]/40 p-2 drop-shadow-[0_-35px_100px_rgba(56,115,255,0.69)]">
              <Image
                src="/assets/landing/functionalities/instruction-2.png"
                width={500}
                height={900}
                className="rounded-4xl"
                alt=""
              />
            </div>
          </div>
          <div className="flex flex-col gap-4 overflow-visible sm:gap-8">
            <div className="overflow-visible rounded-[2.5rem] border border-[#798DDE] bg-[#26486E]/40 p-2 drop-shadow-[0_-35px_100px_rgba(56,115,255,0.69)]">
              <Image
                src="/assets/landing/functionalities/instruction-1.png"
                width={500}
                height={900}
                alt=""
                className="rounded-4xl"
              />
            </div>
            <div className="overflow-visible rounded-[2.5rem] border border-[#798DDE] bg-[#26486E]/40 p-2 drop-shadow-[0_-35px_100px_rgba(56,115,255,0.69)]">
              <Image
                src="/assets/landing/functionalities/instruction-3.png"
                width={500}
                height={900}
                alt=""
                className="rounded-4xl"
              />
            </div>
            <div className="overflow-visible rounded-[2.5rem] border border-[#798DDE] bg-[#26486E]/40 p-2 drop-shadow-[0_-35px_100px_rgba(56,115,255,0.69)]">
              <Image
                src="/assets/landing/functionalities/instruction-3.png"
                width={500}
                height={900}
                alt=""
                className="rounded-4xl"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>,
  ],
  [
    "no-account-needed",
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      key="no-account-needed"
      className="flex h-96 flex-col items-center justify-center overflow-hidden p-4 sm:h-full sm:min-h-160 sm:p-8 xl:items-start"
    >
      <div className="relative flex h-full w-full max-w-3xl flex-col items-center justify-center">
        <div className="absolute hidden max-w-3/5 -translate-x-32 translate-y-16 rounded-[2.5rem] border border-[#798DDE] bg-[#26486E]/40 p-2 drop-shadow-[0_-35px_100px_rgba(56,115,255,0.69)] sm:block">
          <div className="z-10 flex flex-col items-center gap-8 rounded-4xl bg-white p-8 dark:bg-[#101011]">
            <div className="space-y-2 text-center">
              <p className="text-3xl font-black">Logowanie organizatora</p>
              <p>Podaj swój email by się zalogować.</p>
            </div>
            <div className="w-full max-w-sm space-y-4">
              <Input type="email" placeholder="E-mail" />
              <Input type="password" placeholder="Hasło" />
              <Button type="button" className="w-full">
                Kontynuuj
              </Button>
              <p
                className={`w-full cursor-pointer text-neutral-600 ${buttonVariants(
                  {
                    variant: "link",
                  },
                )}`}
              >
                Nie masz jeszcze konta? Zarejestruj się
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-[2.5rem] border border-[#798DDE] bg-[#26486E]/40 p-2 drop-shadow-[0_-35px_100px_rgba(56,115,255,0.69)] sm:absolute sm:mt-16 sm:max-w-3/5 sm:translate-x-32 sm:-translate-y-56">
          <div className="z-10 flex flex-col items-center gap-8 rounded-4xl bg-white p-8 dark:bg-[#101011]">
            <div className="space-y-2 text-center">
              <p className="text-3xl font-black">Logowanie na wydarzenie</p>
              <p>Podaj swój email by się zalogować.</p>
            </div>
            <div className="w-full max-w-sm space-y-4">
              <Button
                type="button"
                variant="outline"
                className="w-full bg-transparent"
              >
                Kontynuuj bez konta
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>,
  ],
  [
    "coorganizers",
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      key="coorganizers"
      className="relative flex h-96 w-full flex-col items-center justify-center overflow-hidden p-4 sm:h-192 sm:p-8 xl:items-start"
    >
      <div className="z-10 flex w-full max-w-3xl -translate-y-3/4 flex-row items-center justify-center drop-shadow-[0_-35px_100px_rgba(56,115,255,0.69)] sm:-translate-y-3/5">
        <div className="relative flex translate-8 flex-col items-center justify-center">
          <div className="absolute hidden -translate-y-10 flex-col items-center drop-shadow-2xl sm:flex sm:-translate-y-30">
            <div className="pointer-events-none flex flex-row items-center gap-4 rounded-full bg-[#ffc94b] px-5 py-2.5 text-sm text-black">
              <p className="text-xs font-bold whitespace-nowrap sm:text-base">
                Organizator
              </p>
            </div>
            <span className="h-24 border-l-2 border-dashed border-[#ffc94b]"></span>
          </div>
          <Image
            src="https://cms.solvro.pl/assets/e1424e35-9130-486b-9a5d-49771b6ea6eb?key=member"
            alt=""
            width={200}
            height={200}
            className="aspect-square h-full w-40 -rotate-6 rounded-4xl shadow-2xl drop-shadow-2xl sm:w-auto"
          />
        </div>
        <div className="relative z-10 flex translate-y-4 flex-col items-center justify-center sm:translate-y-0">
          <div className="absolute hidden -translate-y-10 flex-col items-center drop-shadow-2xl sm:flex sm:-translate-y-30">
            <div className="pointer-events-none flex flex-row items-center gap-4 rounded-full bg-[#fd36fa] px-5 py-2.5 text-sm text-black">
              <p className="text-xs font-bold whitespace-nowrap sm:text-base">
                Organizator
              </p>
            </div>
            <span className="h-24 border-l-2 border-dashed border-[#fd36fa]"></span>
          </div>
          <Image
            src="https://cms.solvro.pl/assets/8b57e57a-e701-4d9a-88e5-c254e9299fee?key=member"
            alt=""
            width={200}
            height={200}
            className="z-10 aspect-square h-full w-40 rounded-4xl shadow-2xl drop-shadow-2xl sm:w-auto"
          />
        </div>
        <div className="relative flex -translate-x-8 translate-y-8 flex-col items-center justify-center">
          <div className="absolute hidden -translate-y-10 flex-col items-center drop-shadow-2xl sm:flex sm:-translate-y-30">
            <div className="pointer-events-none flex flex-row items-center gap-4 rounded-full bg-[#3089dc] px-5 py-2.5 text-sm text-black">
              <p className="text-xs font-bold whitespace-nowrap sm:text-base">
                Organizator
              </p>
            </div>
            <span className="h-24 border-l-2 border-dashed border-[#3089dc]"></span>
          </div>
          <Image
            src="https://cms.solvro.pl/assets/77255d90-0ec0-4219-9c81-707cc50babc4?key=member"
            alt=""
            width={200}
            height={200}
            className="aspect-square h-full w-40 rotate-6 rounded-4xl shadow-2xl drop-shadow-2xl sm:w-auto"
          />
        </div>
      </div>
      <Image
        src="/assets/landing/functionalities/event-settings.png"
        alt="Ustawienia współorganizatorów w panelu organizatora"
        className="absolute translate-y-2/3 rounded-4xl border border-[#798DDE] bg-[#26486E]/40 p-2 drop-shadow-[0_-35px_100px_rgba(56,115,255,0.69)] sm:translate-y-3/5"
        width={2000}
        height={1000}
      />
    </motion.div>,
  ],
  [
    "security",
    <motion.div
      key="security"
      className="flex h-96 w-full flex-col items-center justify-center p-4 sm:h-full sm:p-16 xl:items-start xl:px-32"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Image
        src="/assets/landing/functionalities/shield.png"
        alt=""
        className="h-full w-auto drop-shadow-[0_-35px_100px_rgba(56,115,255,0.69)] sm:h-auto sm:w-full sm:max-w-lg"
        width={1000}
        height={1000}
      />
    </motion.div>,
  ],
]);

export function FeatureAccordion() {
  const [selectedAside, setSelectedAside] = useState<string>("contact");
  return (
    <section
      id="faq"
      className="border-input z-20 flex w-full flex-col items-center overflow-hidden border-t border-dashed bg-white dark:bg-[#101011]"
    >
      <div className="grid w-full grid-cols-1 items-center justify-center xl:grid-cols-2">
        <div className="z-10 flex h-full w-full items-center justify-center bg-white xl:justify-end dark:bg-[#101011]">
          <div className="w-full space-y-2 p-8 sm:p-16 xl:max-w-3xl">
            <p className="pb-4 text-4xl font-bold sm:text-5xl">
              Najczęściej zadawane pytania
            </p>
            <Accordion
              type="single"
              collapsible
              className="divide-input w-full"
              defaultValue="contact"
              onValueChange={(value) => {
                setSelectedAside(value);
              }}
            >
              <CustomAccordionItem value="contact" title="Osoba kontaktowa">
                <p className="text-xl font-medium text-[#515151] dark:text-[#B4B4B4]">
                  Przy zakładaniu wydarzenia na Eventowniku zachęcamy do
                  kontaktu z naszą osobą kontaktową - chętnie wytłumaczymy i
                  pomożemy w razie problemów. Jeśli nie czujesz takiej potrzeby,
                  możesz założyć wydarzenie w pełni samodzielnie!
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
              </CustomAccordionItem>
              <CustomAccordionItem value="instruction" title="Jasna instrukcja">
                <p className="text-xl font-medium text-[#515151] dark:text-[#B4B4B4]">
                  Aby ułatwić organizatorom stworzenie ich pierwszego wydarzenia
                  na Eventowniku oraz pozwolić im w pełni wykorzystać możliwości
                  platformy, przygotowaliśmy przejrzystą i szczegółową
                  instrukcję opisującą wszystkie dostępne funkcje.
                </p>
                <Button
                  asChild
                  variant="link"
                  className="p-0 text-xl font-medium text-[#6583c8]"
                >
                  <a
                    href="https://docs.solvro.pl/projects/eventownik/handbook/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Zapoznaj się z instrukcją <ArrowRight />
                  </a>
                </Button>
              </CustomAccordionItem>
              <CustomAccordionItem
                value="no-account-needed"
                title="Brak potrzeby zakładania konta dla uczestników"
              >
                <p className="text-xl font-medium text-[#515151] dark:text-[#B4B4B4]">
                  Uczestnicy zapisujący się na wydarzenia nie muszą posiadać
                  konta. Założenie jego jest wymagane jedynie przez
                  organizatorów, aby utworzyć wydarzenie.
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
                value="coorganizers"
                title="Współtworzenie wydarzenia przez wiele osób"
              >
                <p className="text-xl font-medium text-[#515151] dark:text-[#B4B4B4]">
                  Podczas tworzenia wydarzenia istnieje możliwość dodania
                  współorganizatorów oraz przypisania im konkretnych uprawnień,
                  takich jak dostęp wyłącznie do listy uczestników czy możliwość
                  edycji formularza. Dzięki temu współpraca staje się znacznie
                  łatwiejsza, gdy wydarzenie jest realizowane przez cały sztab
                  organizacyjny!
                </p>
              </CustomAccordionItem>
              <CustomAccordionItem value="security" title="Bezpieczeństwo">
                <p className="text-xl font-medium text-[#515151] dark:text-[#B4B4B4]">
                  Eventownik powstał przy konsultacji z jednostkami Politechniki
                  Wrocławskiej - Działem Informatyzacji, Inspektorem Ochrony
                  Danych i innymi. Dzięki temu spełnia najwyższe standardy
                  bezpieczeństwa. Co więcej, wytrzyma nawet bardzo duże
                  obciążenia i może obsłużyć jednocześnie duże ilości
                  użytkowników bez utraty stabilności.
                </p>
              </CustomAccordionItem>
            </Accordion>
          </div>
        </div>
        <aside className="order-first h-full w-full xl:order-last">
          <AnimatePresence mode="wait">
            {asideContents.get(selectedAside)}
          </AnimatePresence>
        </aside>
      </div>
    </section>
  );
}
