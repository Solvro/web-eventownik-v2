"use client";

import { useQuery } from "@tanstack/react-query";
import { LifeBuoy, Phone } from "lucide-react";

import { useMobile } from "@/components/mobile/mobile-context";
import {
  MobileEmptyState,
  MobileErrorState,
  MobileListSkeleton,
  MobileSectionHeading,
  MobileTabPage,
} from "@/components/mobile/tab-page";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { mobileApi, mobileKeys } from "@/lib/mobile/client";
import type { MobileSos } from "@/types/mobile";

export default function MobileSosPage() {
  const { eventSlug } = useMobile();
  const sos = useQuery({
    queryKey: mobileKeys.sos(eventSlug),
    queryFn: async () => mobileApi<MobileSos>(eventSlug, "sos"),
  });

  return (
    <MobileTabPage title="SOS i FAQ" subtitle="Potrzebujesz pomocy? Zadzwoń.">
      {sos.isPending ? (
        <MobileListSkeleton />
      ) : sos.isError ? (
        <MobileErrorState
          onRetry={() => {
            void sos.refetch();
          }}
        />
      ) : (
        <div className="flex flex-col gap-8 pb-4">
          <section className="flex flex-col gap-3">
            {sos.data.contacts.length === 0 ? (
              <MobileEmptyState
                icon={<LifeBuoy />}
                title="Brak kontaktów"
                description="Organizatorzy nie dodali jeszcze numerów alarmowych."
              />
            ) : (
              sos.data.contacts
                .toSorted((a, b) => a.order - b.order)
                .map((contact) => (
                  <a
                    key={contact.uuid}
                    href={`tel:${contact.phone.replaceAll(/[^\d+]/g, "")}`}
                    className="bg-card flex items-center gap-4 rounded-3xl p-4 transition active:scale-[0.98]"
                  >
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[var(--mobile-danger)] text-white shadow-[0_3px_9px_rgba(229,72,77,0.4)]">
                      <Phone className="size-6" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="text-base leading-[1.2] font-bold">
                        {contact.label}
                      </span>
                      <span className="text-base leading-[1.2] font-semibold tracking-normal text-[var(--mobile-danger)] tabular-nums">
                        {contact.phone}
                      </span>
                      {contact.description === null ? null : (
                        <span className="text-muted-foreground text-sm leading-[1.3] font-medium">
                          {contact.description}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 rounded-[22px] bg-[var(--mobile-danger)] px-3 py-2 text-xs leading-none font-semibold tracking-normal text-white">
                      Zadzwoń
                    </span>
                  </a>
                ))
            )}
          </section>
          <section>
            <MobileSectionHeading>Najczęstsze pytania</MobileSectionHeading>
            {sos.data.faq.length === 0 ? (
              <p className="bg-card text-muted-foreground rounded-[32px] p-6 text-base font-medium">
                Brak pytań i odpowiedzi.
              </p>
            ) : (
              <Accordion
                type="single"
                collapsible
                className="flex w-full flex-col gap-3"
              >
                {sos.data.faq
                  .toSorted((a, b) => a.order - b.order)
                  .map((item) => (
                    <AccordionItem
                      key={item.uuid}
                      value={item.uuid}
                      className="bg-card rounded-3xl border-none px-5"
                    >
                      <AccordionTrigger className="[&>svg]:text-foreground py-5 text-left text-base leading-[1.2] font-semibold hover:no-underline [&>svg]:size-5">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="pb-5 text-base leading-6 font-medium whitespace-pre-line text-[#414141] dark:text-[#C4C4C4]">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            )}
          </section>
        </div>
      )}
    </MobileTabPage>
  );
}
