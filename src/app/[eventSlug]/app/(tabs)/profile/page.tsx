"use client";

import { ChevronRight, Flame, LogOut, Pencil } from "lucide-react";
import { useState } from "react";

import { MobileAvatar } from "@/components/mobile/avatar";
import { useMobile } from "@/components/mobile/mobile-context";
import { ProfileForm } from "@/components/mobile/profile-form";
import {
  MobileErrorState,
  MobileListSkeleton,
  MobileTabPage,
} from "@/components/mobile/tab-page";
import { MobileThemeSwitcher } from "@/components/mobile/theme-switcher";
import { useMobileMe } from "@/components/mobile/use-me";
import { Button } from "@/components/ui/button";

import { logout } from "../../actions";

export default function MobileProfilePage() {
  const { eventSlug, config } = useMobile();
  const me = useMobileMe(eventSlug);
  const [editing, setEditing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await logout(eventSlug);
    globalThis.location.assign(`/${eventSlug}/app/login`);
  }

  const profile = me.data?.profile ?? null;

  return (
    <MobileTabPage title="Profil">
      {me.isPending ? (
        <MobileListSkeleton rows={2} />
      ) : me.isError ? (
        <MobileErrorState
          onRetry={() => {
            void me.refetch();
          }}
        />
      ) : editing || profile === null ? (
        <div className="pb-4">
          <ProfileForm
            eventSlug={eventSlug}
            initial={profile}
            showTinder={config.app.features.tinder}
            submitLabel="Zapisz"
            onSaved={() => {
              setEditing(false);
            }}
          />
          {profile === null ? null : (
            <Button
              variant="outline"
              className="border-border bg-background text-foreground hover:bg-card dark:bg-background dark:hover:bg-card mt-4 h-[60px] w-full rounded-3xl text-base font-semibold shadow-none"
              onClick={() => {
                setEditing(false);
              }}
            >
              Anuluj
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-8 pb-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <MobileAvatar
              person={profile}
              size={112}
              className="ring-background ring-4"
            />
            <div className="flex flex-col gap-2">
              <p className="text-2xl leading-[1.2] font-bold">
                {profile.displayName}
              </p>
              <p className="dark:text-muted-foreground text-base leading-[1.2] font-semibold text-[#868686]">
                {me.data.participant.email}
              </p>
            </div>
            {profile.bio === null || profile.bio === "" ? null : (
              <p className="bg-card text-foreground w-full rounded-[32px] p-6 text-left text-base leading-6 font-medium whitespace-pre-line">
                {profile.bio}
              </p>
            )}
          </div>
          <div className="bg-card flex flex-col overflow-hidden rounded-3xl">
            <button
              type="button"
              className="dark:active:bg-secondary flex h-16 items-center gap-3 px-5 text-left text-base font-semibold transition active:bg-[#F0F0F0]"
              onClick={() => {
                setEditing(true);
              }}
            >
              <Pencil className="size-5" />
              <span className="flex-1">Edytuj profil</span>
              <ChevronRight className="text-muted-foreground size-5" />
            </button>
            {config.app.features.tinder ? (
              <div className="border-border flex h-16 items-center gap-3 border-t px-5 text-base font-semibold">
                <Flame className="size-5" />
                <span className="flex-1">Tinderownik</span>
                <span className="text-muted-foreground text-sm font-semibold">
                  {profile.tinderOptIn ? "włączony" : "wyłączony"}
                </span>
              </div>
            ) : null}
            <button
              type="button"
              className="border-border dark:active:bg-secondary flex h-16 items-center gap-3 border-t px-5 text-left text-base font-semibold text-[#E5484D] transition active:bg-[#F0F0F0] disabled:opacity-50"
              disabled={loggingOut}
              onClick={() => {
                void handleLogout();
              }}
            >
              <LogOut className="size-5" />
              <span className="flex-1">Wyloguj się</span>
            </button>
          </div>
          <MobileThemeSwitcher />
        </div>
      )}
    </MobileTabPage>
  );
}
