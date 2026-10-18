import { describe, expect, it } from "vitest";

import { resolveTurnstileConfig } from "@/lib/turnstile-config";

describe("Turnstile site key configuration", () => {
  it("prefers the canonical variable", () => {
    expect(
      resolveTurnstileConfig({
        turnstile: " 0x4AAAAAAABkMYinukE8nzY ",
        legacyHcaptcha: "1x00000000000000000000AA",
      }),
    ).toEqual({
      status: "ok",
      sitekey: "0x4AAAAAAABkMYinukE8nzY",
      deprecatedSource: false,
    });
  });

  it("accepts a Turnstile key under the deprecated hCaptcha variable", () => {
    expect(
      resolveTurnstileConfig({ legacyHcaptcha: "1x00000000000000000000AA" }),
    ).toEqual({
      status: "ok",
      sitekey: "1x00000000000000000000AA",
      deprecatedSource: true,
    });
  });

  it.each([
    [
      "an hCaptcha UUID",
      { legacyHcaptcha: "10000000-ffff-ffff-ffff-000000000001" },
    ],
    ["a placeholder", { turnstile: "MEGANIETAJNYKLUCZ" }],
  ])("rejects %s instead of passing it to Turnstile", (_, env) => {
    expect(resolveTurnstileConfig(env)).toEqual({ status: "invalid" });
  });

  it("reports a missing key", () => {
    expect(
      resolveTurnstileConfig({ turnstile: " ", legacyHcaptcha: "" }),
    ).toEqual({ status: "missing" });
  });
});
