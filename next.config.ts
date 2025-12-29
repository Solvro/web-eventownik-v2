import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

const photoUrl = new URL(
  process.env.NEXT_PUBLIC_PHOTO_URL ?? "https://api.eventownik.solvro.pl",
);
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: photoUrl.protocol.replace(/:$/, ""),
        hostname: photoUrl.hostname,
      } as RemotePattern,
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
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
    dangerouslyAllowLocalIP: true,
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
    viewTransition: true,
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
