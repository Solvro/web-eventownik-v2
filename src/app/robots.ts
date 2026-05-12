import type { MetadataRoute } from "next";

const BASE_URL = "https://eventownik.solvro.pl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/auth/"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
