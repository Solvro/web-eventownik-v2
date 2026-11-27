"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Camera, Loader2 } from "lucide-react";
import { useRef, useState } from "react";

import { MobileAvatar } from "@/components/mobile/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { MobileApiError, mobileApi, mobileKeys } from "@/lib/mobile/client";
import { downscaleImage } from "@/lib/mobile/image";
import type {
  MobileMe,
  MobileProfile,
  MobileProfilePayload,
} from "@/types/mobile";

/** Shared by onboarding and the profile tab. */
export function ProfileForm({
  eventSlug,
  initial,
  showTinder,
  submitLabel,
  onSaved,
}: {
  eventSlug: string;
  initial: MobileProfile | null;
  showTinder: boolean;
  submitLabel: string;
  onSaved: (profile: MobileProfile) => void;
}) {
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState(initial?.displayName ?? "");
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [tinderOptIn, setTinderOptIn] = useState(initial?.tinderOptIn ?? false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(
    initial?.photoUrl ?? null,
  );
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function pickPhoto(file: File | undefined) {
    if (file === undefined) {
      return;
    }
    const blob = await downscaleImage(file);
    setPhoto(blob);
    setPhotoUrl(URL.createObjectURL(blob));
  }

  async function save() {
    const name = displayName.trim();
    if (name === "") {
      setError("Podaj swoje imię lub pseudonim.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload: MobileProfilePayload = {
        displayName: name,
        bio: bio.trim() === "" ? null : bio.trim(),
      };
      if (showTinder) {
        payload.tinderOptIn = tinderOptIn;
      }
      let profile = await mobileApi<MobileProfile>(eventSlug, "me/profile", {
        method: "PUT",
        json: payload,
      });
      if (photo !== null) {
        const form = new FormData();
        form.append("photo", photo, "photo.jpg");
        await mobileApi<unknown>(eventSlug, "me/photo", {
          method: "POST",
          body: form,
        });
        setPhoto(null);
        const me = await mobileApi<MobileMe>(eventSlug, "me");
        profile = me.profile ?? profile;
      }
      await queryClient.invalidateQueries({
        queryKey: mobileKeys.me(eventSlug),
      });
      onSaved(profile);
    } catch (error_) {
      setError(
        error_ instanceof MobileApiError
          ? error_.message
          : "Nie udało się zapisać profilu.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          className="relative rounded-full"
          aria-label="Zmień zdjęcie"
          onClick={() => fileInput.current?.click()}
        >
          <MobileAvatar
            person={{ displayName: displayName || "?", photoUrl }}
            size={112}
          />
          <span className="border-background absolute right-0 bottom-0 flex size-9 items-center justify-center rounded-full border-2 bg-[var(--mobile-accent)] text-[var(--mobile-accent-foreground)] shadow-[0_3px_9px_var(--mobile-accent-glow)]">
            <Camera className="size-4" />
          </span>
        </button>
        <span className="text-muted-foreground text-xs font-semibold">
          Zdjęcie jest opcjonalne
        </span>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => {
            void pickPhoto(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </div>
      <label className="flex flex-col gap-2 text-sm font-semibold">
        Imię lub pseudonim *
        <Input
          value={displayName}
          maxLength={50}
          required
          autoComplete="nickname"
          onChange={(event) => {
            setDisplayName(event.target.value);
          }}
          className="bg-secondary dark:bg-secondary h-14 rounded-3xl border-none px-5 text-base font-medium shadow-none focus-visible:ring-2 focus-visible:ring-[var(--mobile-accent)]"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-semibold">
        O mnie
        <Textarea
          value={bio}
          maxLength={300}
          rows={3}
          placeholder="Kilka słów o sobie (opcjonalnie)"
          onChange={(event) => {
            setBio(event.target.value);
          }}
          className="bg-secondary dark:bg-secondary min-h-28 rounded-3xl border-none px-5 py-4 text-base font-medium shadow-none focus-visible:ring-2 focus-visible:ring-[var(--mobile-accent)]"
        />
      </label>
      {showTinder ? (
        <div className="bg-card flex items-center justify-between gap-4 rounded-3xl p-5">
          <span className="flex flex-col">
            <label htmlFor="mobile-tinder-opt-in" className="font-semibold">
              Tinderownik
            </label>
            <span className="text-muted-foreground text-xs font-semibold">
              Pokazuj mój profil innym uczestnikom do poznawania się
            </span>
          </span>
          <Switch
            id="mobile-tinder-opt-in"
            checked={tinderOptIn}
            onCheckedChange={setTinderOptIn}
          />
        </div>
      ) : null}
      {error === null ? null : (
        <p role="alert" className="text-sm font-semibold text-[#E5484D]">
          {error}
        </p>
      )}
      <Button
        type="submit"
        disabled={saving}
        className="bg-primary text-primary-foreground hover:bg-primary/90 h-[60px] rounded-3xl px-6 text-base font-semibold tracking-[0.01em]"
      >
        {saving ? <Loader2 className="size-5 animate-spin" /> : null}
        {submitLabel}
      </Button>
    </form>
  );
}
