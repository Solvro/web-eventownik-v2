"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";

function sectionElement(sectionId: string) {
  return document.querySelector(`#${CSS.escape(sectionId)}`);
}

function smoothScrollTo(sectionId: string) {
  sectionElement(sectionId)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

/** Smooth-scroll on homepage; from other routes go to /?section=… first. */
export function SectionLink({
  sectionId,
  children,
  onNavigate,
}: {
  sectionId: string;
  children: ReactNode;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const href = `/?section=${sectionId}`;

  return (
    <Link
      href={href}
      onClick={(event) => {
        event.preventDefault();
        onNavigate?.();

        if (pathname === "/") {
          history.pushState(null, "", `/#${sectionId}`);
          smoothScrollTo(sectionId);
          return;
        }

        router.push(href, { scroll: false });
      }}
    >
      {children}
    </Link>
  );
}

/** After /?section=… loads, scroll from the top to that section. */
export function SectionScroll() {
  useEffect(() => {
    const sectionId = new URLSearchParams(window.location.search).get(
      "section",
    );
    if (sectionId == null || sectionId === "") {
      return;
    }

    let cancelled = false;
    let tries = 0;

    const run = () => {
      if (cancelled) {
        return;
      }

      const element = sectionElement(sectionId);
      if (element == null) {
        if (++tries < 40) {
          setTimeout(run, 50);
        }
        return;
      }

      window.scrollTo(0, 0);
      setTimeout(() => {
        if (cancelled) {
          return;
        }
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", `/#${sectionId}`);
      }, 50);
    };

    const timeoutId = setTimeout(run, 100);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  return null;
}

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("Homepage");

  return (
    <>
      <Link href="/events" onClick={onNavigate}>
        {t("events")}
      </Link>
      <SectionLink sectionId="functionalities" onNavigate={onNavigate}>
        {t("features")}
      </SectionLink>
      <SectionLink sectionId="faq" onNavigate={onNavigate}>
        FAQ
      </SectionLink>
      <SectionLink sectionId="team" onNavigate={onNavigate}>
        {t("team")}
      </SectionLink>
    </>
  );
}
