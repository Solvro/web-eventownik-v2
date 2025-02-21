import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default function DashboardEventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  return (
    <div className="flex grow gap-14">
      <DashboardSidebar slug={params.slug} />
      <div className="grow">{children}</div>
    </div>
  );
}
