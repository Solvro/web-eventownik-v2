"use client";

import { useTranslations } from "next-intl";

import { LogoMarquee } from "@/components/logo-marquee";

export function Organizations() {
  const t = useTranslations("Homepage");

  const partnerLogos = [
    {
      src: "/assets/landing/partners/samorzad-pwr.png",
      href: "https://samorzad.pwr.edu.pl",
      name: t("studentGovernmentWust"),
    },
    {
      src: "/assets/landing/partners/wuzetka.jpg",
      href: "https://www.facebook.com/SSWuZetka",
      name: t("studentGovernmentW8N"),
    },
    {
      src: "/assets/landing/partners/samorzad-wit.jpg",
      href: "https://www.facebook.com/samorzad.wita",
      name: t("studentGovernmentW4N"),
    },
    {
      src: "/assets/landing/partners/samorzad-chemiczny.jpg",
      href: "https://www.facebook.com/samorzadwch",
      name: t("studentGovernmentW3"),
    },
    {
      src: "/assets/landing/partners/samorzad-wggg.jpg",
      href: "https://www.facebook.com/samorzadw6",
      name: t("studentGovernmentW6"),
    },
    {
      src: "/assets/landing/partners/wydzial-elektroniki.jpg",
      href: "https://www.facebook.com/samorzadw12n",
      name: t("studentGovernmentW12N"),
    },
    {
      src: "/assets/landing/partners/neuron.jpg",
      href: "https://www.facebook.com/knneuronpwr",
      name: "KN Neuron",
    },
    {
      src: "/assets/landing/partners/hossa-pro-capital.png",
      href: "https://hossaprocapital.pl",
      name: "Hossa Pro Capital",
    },
    {
      src: "/assets/landing/partners/4s.png",
      href: "https://www.facebook.com/4SSoftSkillsSupportSquad",
      name: "4S",
    },
  ];

  return (
    <div className="flex w-full flex-col items-center text-center">
      <section
        id="organizations"
        className="border-input z-20 flex w-full flex-col items-center gap-8 overflow-hidden py-10"
      >
        <div className="flex flex-col items-center gap-8">
          <div className="rounded-full bg-gradient-to-r from-[#6583C8] to-[#80B3FF] p-0.5">
            <p className="flex h-full w-full rounded-full bg-[#a7b3cd] px-4 py-2 text-sm font-medium sm:text-base dark:bg-[#192237]">
              {t("organizationsBadge")}
            </p>
          </div>
          <p className="text-5xl font-bold sm:text-7xl">
            {t("organizationsTitle")}
          </p>
          <p className="text-xl text-[#191A1A] sm:text-3xl dark:text-[#D9E8FF]">
            {t.rich("organizationsDescription", {
              span: (chunks) => (
                <span className="text-[#6583C8]">{chunks}</span>
              ),
              count: 22,
            })}
          </p>
        </div>

        <LogoMarquee
          logos={partnerLogos}
          className="container w-full py-8 xl:max-w-6xl"
        />
      </section>
    </div>
  );
}
