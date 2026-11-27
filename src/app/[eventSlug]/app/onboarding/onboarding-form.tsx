"use client";

import { useRouter } from "next/navigation";

import { useMobile } from "@/components/mobile/mobile-context";
import { ProfileForm } from "@/components/mobile/profile-form";

export function OnboardingForm() {
  const { eventSlug, config } = useMobile();
  const router = useRouter();
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden px-6 pt-[calc(env(safe-area-inset-top)+2.5rem)] pb-[calc(env(safe-area-inset-bottom)+2rem)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[-20%] -top-28 h-[260px] bg-[var(--mobile-accent)] opacity-60 blur-[50px]"
      />
      <h1 className="relative text-center text-2xl leading-[1.2] font-extrabold">
        Witaj na {config.event.name}! 👋🏼
      </h1>
      <p className="text-muted-foreground relative mt-3 mb-8 text-center text-base leading-6 font-medium">
        Uzupełnij krótki profil — tak zobaczą Cię inni uczestnicy na czacie i w
        zabawach.
      </p>
      <div className="relative">
        <ProfileForm
          eventSlug={eventSlug}
          initial={null}
          showTinder={config.app.features.tinder}
          submitLabel="Gotowe, wchodzę!"
          onSaved={() => {
            router.replace(`/${eventSlug}/app`);
            router.refresh();
          }}
        />
      </div>
    </main>
  );
}
