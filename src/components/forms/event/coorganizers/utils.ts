import { sha256 } from "js-sha256";

const DEFAULT_AVATAR_PARAMS = {
  baseUrl: "https://api.dicebear.com/9.x/avataaars/png",
  options:
    "backgroundType=gradientLinear&backgroundColor=b6e3f4,c0aede,d1d4f9,9ce2f9",
};

export const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const generateAvatarUrl = (email: string) => {
  const hash = sha256(email.trim().toLowerCase());
  const defaultAvatar = `${DEFAULT_AVATAR_PARAMS.baseUrl}/${encodeURIComponent(
    `seed=${email}&${DEFAULT_AVATAR_PARAMS.options}`,
  )}`;
  return `https://www.gravatar.com/avatar/${hash}?d=${encodeURIComponent(defaultAvatar)}`;
};
