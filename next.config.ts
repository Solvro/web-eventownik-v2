import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.eventownik.solvro.pl",
      },
      {
        protocol: "https",
        hostname: "www.gravatar.com",
      },
      // for contributors
      {
        protocol: "https",
        hostname: "cms.solvro.pl",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  // eslint-disable-next-line @typescript-eslint/require-await
  async redirects() {
    return [
      {
        source: "/regulamin",
        destination:
          "https://drive.google.com/file/d/1h4f-koiR-Ab2JPrOe7p5JXjohi83mrvB/view",
        permanent: false,
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
