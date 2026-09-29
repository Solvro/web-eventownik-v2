export interface CookieOptions {
  name: string;
  value: string;
  path?: string;
  domain?: string;
  httpOnly?: boolean;
  secure?: boolean;
  maxAge?: number;
  expires?: Date;
  sameSite?: "lax" | "strict" | "none";
}

export function parseSetCookieHeader(setCookieHeader: string): CookieOptions {
  const parts = setCookieHeader.split(";").map((part) => part.trim());
  const [nameValue, ...attributes] = parts;
  const eqIndex = nameValue.indexOf("=");
  const cookieName = nameValue.slice(0, eqIndex);
  const cookieValue = nameValue.slice(eqIndex + 1);

  const cookieOptions: CookieOptions = {
    name: cookieName,
    value: cookieValue,
  };

  for (const attribute of attributes) {
    const [key, value] = attribute
      .split("=")
      .map((item) => item.trim().toLowerCase());

    if (key === "path") {
      cookieOptions.path = "/";
    }
    if (key === "domain") {
      cookieOptions.domain = value;
    }
    if (key === "httponly") {
      cookieOptions.httpOnly = true;
    }
    if (key === "secure") {
      cookieOptions.secure = true;
    }
    if (key === "max-age") {
      cookieOptions.maxAge = Number.parseInt(value, 10);
    }
    if (key === "expires") {
      cookieOptions.expires = new Date(value);
    }
    if (key === "samesite") {
      cookieOptions.sameSite = value as "lax" | "strict" | "none";
    }
  }

  return cookieOptions;
}
