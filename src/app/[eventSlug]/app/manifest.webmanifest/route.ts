import { NextResponse } from "next/server";

import { getMobilePublicConfig } from "@/lib/mobile/session";
import { mobileAccent } from "@/lib/mobile/theme";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventSlug: string }> },
) {
  const { eventSlug } = await params;
  const config = await getMobilePublicConfig(eventSlug).catch(() => null);
  if (config === null) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  const base = `/${eventSlug}/app`;
  const name = config.event.name;
  const manifest = {
    id: base,
    name,
    short_name: name.length > 12 ? name.slice(0, 12).trim() : name,
    description: `Aplikacja wydarzenia ${name}`,
    lang: "pl",
    start_url: base,
    scope: base,
    display: "standalone",
    orientation: "portrait",
    theme_color: mobileAccent(
      config.app.accentColor ?? config.event.primaryColor,
    ),
    background_color: "#0b1324",
    icons: [
      {
        src: "/assets/mobile/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/assets/mobile/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/assets/mobile/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
  return new NextResponse(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=300",
    },
  });
}
