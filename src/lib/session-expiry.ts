import { decodeJwt } from "jose";

/**
 * How long before the backend access token expires the session is treated as
 * expired. This leaves time to refresh before the backend starts returning 401.
 */
export const ACCESS_TOKEN_EXPIRY_MARGIN_MS = 60 * 1000;

/**
 * Reads the `exp` claim of a backend access token without verifying it - the
 * backend verifies its own tokens, the frontend only needs to know when to refresh.
 *
 * @returns Expiry as a Unix timestamp in milliseconds, or `null` if the token has none
 */
export function getAccessTokenExpiry(accessToken: string): number | null {
  try {
    const { exp } = decodeJwt(accessToken);
    return typeof exp === "number" ? exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * When a session holding this access token should end: shortly before the token
 * expires, but never later than `maxAgeSeconds` from now.
 */
export function getSessionExpiry(
  accessToken: string,
  maxAgeSeconds: number,
  now = Date.now(),
): Date {
  const maxExpiry = now + maxAgeSeconds * 1000;
  const tokenExpiry = getAccessTokenExpiry(accessToken);

  if (tokenExpiry === null) {
    return new Date(maxExpiry);
  }

  return new Date(
    Math.min(maxExpiry, tokenExpiry - ACCESS_TOKEN_EXPIRY_MARGIN_MS),
  );
}

/**
 * Whether the access token has expired or will within the refresh margin.
 * Tokens without a readable `exp` are left to the backend to judge.
 */
export function isAccessTokenExpiring(
  accessToken: string,
  now = Date.now(),
): boolean {
  const tokenExpiry = getAccessTokenExpiry(accessToken);
  return (
    tokenExpiry !== null && tokenExpiry - ACCESS_TOKEN_EXPIRY_MARGIN_MS <= now
  );
}
