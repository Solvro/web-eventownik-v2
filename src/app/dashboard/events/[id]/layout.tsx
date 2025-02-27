import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default async function DashboardEventLayout({
  children,
  modals,
  params,
}: {
  children: React.ReactNode;
  modals: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const awaited = await params;
  return (
    <div className="flex grow gap-14">
      <DashboardSidebar id={awaited.id} />
      <div className="grow">{children}</div>
      {modals}
    </div>
  );
}
