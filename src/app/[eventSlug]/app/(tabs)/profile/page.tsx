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
              className="mt-4 h-[60px] w-full rounded-3xl border-[#E4E4E4] bg-white text-base font-semibold text-[#121212] shadow-none hover:bg-[#F8F8F8] dark:bg-white"
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
              className="ring-4 ring-white"
            />
            <div className="flex flex-col gap-2">
              <p className="text-2xl leading-[1.2] font-bold">
                {profile.displayName}
              </p>
              <p className="text-base leading-[1.2] font-semibold text-[#868686]">
                {me.data.participant.email}
              </p>
            </div>
            {profile.bio === null || profile.bio === "" ? null : (
              <p className="w-full rounded-[32px] bg-[#F8F8F8] p-6 text-left text-base leading-6 font-medium whitespace-pre-line text-[#1A1919]">
                {profile.bio}
              </p>
            )}
          </div>
          <div className="flex flex-col overflow-hidden rounded-3xl bg-[#F8F8F8]">
            <button
              type="button"
              className="flex h-16 items-center gap-3 px-5 text-left text-base font-semibold transition active:bg-[#F0F0F0]"
              onClick={() => {
                setEditing(true);
              }}
            >
              <Pencil className="size-5" />
              <span className="flex-1">Edytuj profil</span>
              <ChevronRight className="size-5 text-[#6F6F6F]" />
            </button>
            {config.app.features.tinder ? (
              <div className="flex h-16 items-center gap-3 border-t border-[#E4E4E4] px-5 text-base font-semibold">
                <Flame className="size-5" />
                <span className="flex-1">Tinderownik</span>
                <span className="text-sm font-semibold text-[#6F6F6F]">
                  {profile.tinderOptIn ? "włączony" : "wyłączony"}
                </span>
              </div>
            ) : null}
            <button
              type="button"
              className="flex h-16 items-center gap-3 border-t border-[#E4E4E4] px-5 text-left text-base font-semibold text-[#E5484D] transition active:bg-[#F0F0F0] disabled:opacity-50"
              disabled={loggingOut}
              onClick={() => {
                void handleLogout();
              }}
            >
              <LogOut className="size-5" />
              <span className="flex-1">Wyloguj się</span>
            </button>
          </div>
        </div>
      )}
    </MobileTabPage>
  );
}
