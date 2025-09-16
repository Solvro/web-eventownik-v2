import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

import en from "../../messages/en.json";
import pl from "../../messages/pl.json";

// eslint-disable-next-line import/no-default-export
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("locale");
  const locale = localeCookie?.value ?? "pl"; // Default to Polish

  const messages = locale === "en" ? en : pl;

  return {
    locale,
    messages,
  };
});
