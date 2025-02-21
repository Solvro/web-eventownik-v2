import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default async function DashboardEventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const awaited = await params;
  return (
    <div className="flex grow gap-14">
      <DashboardSidebar slug={awaited.slug} />
      <div className="grow">{children}</div>
    </div>
  );
}
