export default async function DashboardEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const awaited = await params;
  return <h1 className="text-3xl font-bold">{awaited.slug}</h1>;
}
