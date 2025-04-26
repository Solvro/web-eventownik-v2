import { notFound, redirect } from "next/navigation";

import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { API_URL } from "@/lib/api";
import { verifySession } from "@/lib/session";
import type { Attribute } from "@/types/attributes";

export default async function DashboardEventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const awaited = await params;
  const session = await verifySession();
  if (session == null) {
    redirect("/auth/login");
  }
  const { bearerToken } = session;
  const { id } = await params;

  const response = await fetch(`${API_URL}/events/${id}/attributes`, {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  });

  if (!response.ok) {
    notFound();
  }

  const attributes = (await response.json()) as Attribute[];

  return (
    <div className="flex grow flex-col gap-4 sm:flex-row sm:gap-14">
      <DashboardSidebar id={awaited.id} attributes={attributes} />
      <div className="max-w-full grow overflow-x-auto">{children}</div>
    </div>
  );
}
