import {
  ACCESS_TOKEN_EXPIRY_MARGIN_MS,
  getAccessTokenExpiry,
  getSessionExpiry,
  isAccessTokenExpiring,
} from "../session-expiry";

const NOW = Date.UTC(2026, 10, 11, 12, 0, 0);
const MINUTE = 60 * 1000;

function encodeJwtPart(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

/** Unsigned JWT - the frontend never verifies backend tokens, only reads `exp`. */
function makeToken(payload: Record<string, unknown>) {
  return `${encodeJwtPart({ alg: "HS256", typ: "JWT" })}.${encodeJwtPart(payload)}.signature`;
}

function tokenExpiringIn(ms: number) {
  return makeToken({ sub: "admin", exp: (NOW + ms) / 1000 });
}

describe("getAccessTokenExpiry", () => {
  it("returns the exp claim in milliseconds", () => {
    expect(getAccessTokenExpiry(tokenExpiringIn(20 * MINUTE))).toBe(
      NOW + 20 * MINUTE,
    );
  });

  it("returns null for tokens without exp or that are not JWTs", () => {
    expect(getAccessTokenExpiry(makeToken({ sub: "admin" }))).toBeNull();
    expect(getAccessTokenExpiry("not-a-jwt")).toBeNull();
  });
});

describe("getSessionExpiry", () => {
  it("ends the session before a short-lived access token expires", () => {
    const expiry = getSessionExpiry(tokenExpiringIn(20 * MINUTE), 3540, NOW);

    expect(expiry.getTime()).toBe(
      NOW + 20 * MINUTE - ACCESS_TOKEN_EXPIRY_MARGIN_MS,
    );
  });

  it("caps the session at the configured max age", () => {
    const expiry = getSessionExpiry(
      tokenExpiringIn(24 * 60 * MINUTE),
      3540,
      NOW,
    );

    expect(expiry.getTime()).toBe(NOW + 3540 * 1000);
  });

  it("falls back to the max age when the token expiry is unknown", () => {
    const expiry = getSessionExpiry("not-a-jwt", 3540, NOW);

    expect(expiry.getTime()).toBe(NOW + 3540 * 1000);
  });
});

describe("isAccessTokenExpiring", () => {
  it("is false while the token is valid beyond the margin", () => {
    expect(isAccessTokenExpiring(tokenExpiringIn(5 * MINUTE), NOW)).toBe(false);
  });

  it("is true within the margin and after expiry", () => {
    expect(isAccessTokenExpiring(tokenExpiringIn(30 * 1000), NOW)).toBe(true);
    expect(isAccessTokenExpiring(tokenExpiringIn(-MINUTE), NOW)).toBe(true);
  });

  it("leaves tokens without exp to the backend", () => {
    expect(isAccessTokenExpiring(makeToken({ sub: "admin" }), NOW)).toBe(false);
  });
});
