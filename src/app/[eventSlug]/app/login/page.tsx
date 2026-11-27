"use client";

import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useMobile } from "@/components/mobile/mobile-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { requestOtp, verifyOtp } from "../actions";

const RESEND_SECONDS = 60;

export default function MobileLoginPage() {
  const { eventSlug, config } = useMobile();
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const codeInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }
    const timer = setTimeout(() => {
      setCooldown((value) => value - 1);
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, [cooldown]);

  async function sendCode() {
    setError(null);
    setPending(true);
    const result = await requestOtp(eventSlug, email);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setStep("code");
    setCode("");
    setCooldown(RESEND_SECONDS);
    setTimeout(() => codeInput.current?.focus(), 50);
  }

  async function submitCode(value: string) {
    if (pending) {
      return;
    }
    setError(null);
    setPending(true);
    const result = await verifyOtp(eventSlug, email, value);
    if (!result.ok) {
      setPending(false);
      setError(result.error);
      setCode("");
      codeInput.current?.focus();
      return;
    }
    router.replace(
      result.hasProfile ? `/${eventSlug}/app` : `/${eventSlug}/app/onboarding`,
    );
    router.refresh();
  }

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden px-6 pt-[calc(env(safe-area-inset-top)+2.5rem)] pb-[calc(env(safe-area-inset-bottom)+2rem)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[-20%] -top-28 h-[280px] bg-[var(--mobile-accent)] opacity-60 blur-[50px]"
      />
      <p className="relative text-center text-2xl leading-[1.2] font-extrabold">
        Eventownik
      </p>

      <div className="relative mx-auto mt-10 mb-10 w-full max-w-[300px]">
        {config.event.photoUrl === null ? (
          <div className="flex aspect-square w-full -rotate-3 items-center justify-center rounded-[36px] bg-[var(--mobile-accent)] p-8 text-center">
            <span className="line-clamp-4 text-3xl leading-[1.1] font-extrabold text-[var(--mobile-accent-foreground)]">
              {config.event.name}
            </span>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={config.event.photoUrl}
            alt=""
            className="aspect-square w-full -rotate-3 rounded-[36px] bg-[#F4F4F4] object-cover"
          />
        )}
        <span className="absolute -top-3 -right-4 rotate-6 rounded-[22px] bg-[#2B80FF] px-3 py-1.5 text-base font-medium text-white">
          Przygoda🏞️
        </span>
        <span className="absolute -bottom-3 -left-4 -rotate-6 rounded-[22px] bg-[#2B80FF] px-3 py-1.5 text-base font-medium text-white">
          Super zabawa!🥰
        </span>
      </div>

      <div className="relative mb-8 flex flex-col items-center gap-3 text-center">
        <h1 className="text-2xl leading-[1.2] font-extrabold">
          {config.event.name}
        </h1>
        <p className="text-base leading-6 font-medium text-[#414141]">
          {step === "email"
            ? "Zaloguj się adresem e-mail, którego użyłeś przy rejestracji."
            : `Wpisz 6-cyfrowy kod wysłany na ${email}.`}
        </p>
      </div>

      {step === "email" ? (
        <form
          className="relative mt-auto flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void sendCode();
          }}
        >
          <label className="flex flex-col gap-2 text-sm font-semibold">
            Adres e-mail
            <Input
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
              }}
              placeholder="jan@example.com"
              className="h-[60px] rounded-3xl border-none bg-[#F4F4F4] px-5 text-base font-medium shadow-none focus-visible:ring-2 focus-visible:ring-[var(--mobile-accent)] dark:bg-[#F4F4F4]"
            />
          </label>
          {error === null ? null : (
            <p role="alert" className="text-sm font-semibold text-[#E5484D]">
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={pending || email.trim() === ""}
            className="h-[60px] rounded-3xl bg-[#121212] px-6 text-base font-semibold tracking-[0.01em] text-white hover:bg-[#121212]/90"
          >
            {pending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Mail className="size-5" />
            )}
            Wyślij kod
          </Button>
        </form>
      ) : (
        <form
          className="relative mt-auto flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (code.length === 6) {
              void submitCode(code);
            }
          }}
        >
          <label className="flex flex-col gap-2 text-sm font-semibold">
            Kod z e-maila
            <Input
              ref={codeInput}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              disabled={pending}
              onChange={(event) => {
                const value = event.target.value
                  .replaceAll(/\D/g, "")
                  .slice(0, 6);
                setCode(value);
                if (value.length === 6) {
                  void submitCode(value);
                }
              }}
              placeholder="000000"
              className="h-[60px] rounded-3xl border-none bg-[#F4F4F4] text-center font-mono text-2xl tracking-[0.5em] shadow-none focus-visible:ring-2 focus-visible:ring-[var(--mobile-accent)] dark:bg-[#F4F4F4]"
            />
          </label>
          {error === null ? null : (
            <p role="alert" className="text-sm font-semibold text-[#E5484D]">
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={pending || code.length !== 6}
            className="h-[60px] rounded-3xl bg-[#121212] px-6 text-base font-semibold tracking-[0.01em] text-white hover:bg-[#121212]/90"
          >
            {pending ? <Loader2 className="size-5 animate-spin" /> : null}
            Zaloguj się
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-[60px] rounded-3xl border-[#E4E4E4] bg-white text-base font-semibold text-[#121212] shadow-none hover:bg-[#F8F8F8] dark:bg-white"
            disabled={pending || cooldown > 0}
            onClick={() => {
              void sendCode();
            }}
          >
            {cooldown > 0
              ? `Wyślij ponownie za ${String(cooldown)} s`
              : "Wyślij kod ponownie"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-12 rounded-3xl text-sm font-semibold text-[#6F6F6F] hover:bg-[#F8F8F8]"
            onClick={() => {
              setStep("email");
              setError(null);
              setCode("");
            }}
          >
            <ArrowLeft className="size-4" />
            Zmień adres e-mail
          </Button>
        </form>
      )}
    </main>
  );
}
