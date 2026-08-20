"use client";

import Image from "next/image";

export function CtaSection() {
  return (
    <section className="bg-white px-4 py-12 sm:px-8 dark:bg-[#101011]">
      <div className="container mx-auto">
        <div
          className="relative overflow-hidden rounded-[32px] lg:rounded-[38px]"
          style={{ minHeight: 379 }}
        >
          <Image
            src="/assets/landing/cta-bg.png"
            alt=""
            fill
            className="object-cover object-center"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(14, 18, 33, 0.72) 0%, rgba(19, 23, 40, 0.56) 33%, rgba(19, 23, 40, 0.24) 56%, rgba(19, 23, 40, 0.08) 100%)",
            }}
          />
          <div className="absolute inset-0 bg-[#0d1430]/10" />

          <div className="absolute top-8 left-8 z-10 flex max-w-[340px] flex-col gap-4 sm:top-[44px] sm:left-[46px] sm:max-w-[540px] sm:gap-5">
            <p className="text-xs font-medium tracking-[0.18em] text-white/80 uppercase">
              Współpraca
            </p>
            <h2 className="text-3xl leading-[1.02] font-bold tracking-tight text-white sm:text-[54px] sm:leading-[0.98]">
              Chciałbyś użyć Eventownika na swoim wydarzeniu?
            </h2>
            <a
              href="mailto:eventownik@pwr.edu.pl"
              className="w-fit rounded-full border border-white/50 bg-transparent px-5 py-3 text-base font-medium text-white transition hover:bg-white/10"
            >
              Skontaktuj się z nami →
            </a>
          </div>

          <p className="absolute right-4 bottom-4 z-10 text-sm text-white/80 sm:right-8 sm:bottom-6 sm:text-xl">
            Fot. HackYeah2025
          </p>
        </div>
      </div>
    </section>
  );
}
