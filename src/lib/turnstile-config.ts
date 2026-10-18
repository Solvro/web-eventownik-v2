/**
 * Turnstile site keys look like `0x4AAAAAAA…` (production) or `1x0000…AA`,
 * `2x…`, `3x…` (Cloudflare test keys). hCaptcha keys are UUIDs and must never
 * be handed to Turnstile.
 */
const TURNSTILE_SITEKEY_PATTERN = /^[0-3]x[\w-]{8,}$/;

export type TurnstileConfig =
  | { status: "ok"; sitekey: string; deprecatedSource: boolean }
  | { status: "missing" }
  | { status: "invalid" };

/**
 * Resolves the public Turnstile key. `NEXT_PUBLIC_TURNSTILE_SITEKEY` is
 * canonical; `NEXT_PUBLIC_HCAPTCHA_SITEKEY` is accepted only as a deprecated
 * fallback for deployments that already store the Turnstile key under the old
 * name, and only when the value is actually a Turnstile key.
 */
export function resolveTurnstileConfig(env: {
  turnstile?: string;
  legacyHcaptcha?: string;
}): TurnstileConfig {
  const canonical = env.turnstile?.trim() ?? "";
  const legacy = env.legacyHcaptcha?.trim() ?? "";
  const value = canonical === "" ? legacy : canonical;
  if (value === "") {
    return { status: "missing" };
  }
  if (!TURNSTILE_SITEKEY_PATTERN.test(value)) {
    return { status: "invalid" };
  }
  return { status: "ok", sitekey: value, deprecatedSource: canonical === "" };
}

export function getTurnstileConfig() {
  // Literal `process.env.NEXT_PUBLIC_*` accesses so Next.js inlines them.
  return resolveTurnstileConfig({
    turnstile: process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY,
    legacyHcaptcha: process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY,
  });
}
