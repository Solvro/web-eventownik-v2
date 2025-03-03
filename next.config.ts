import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.eventownik.solvro.pl",
      },
    ],
  },
};

export default nextConfig;
