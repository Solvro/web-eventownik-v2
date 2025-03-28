import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default async function DashboardEventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const awaited = await params;
  return (
    <div className="flex grow flex-col gap-4 sm:flex-row sm:gap-14">
      <DashboardSidebar id={awaited.id} />
      <div className="max-w-full grow overflow-x-auto">{children}</div>
    </div>
  );
}
