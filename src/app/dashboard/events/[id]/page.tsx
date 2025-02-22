export default async function DashboardEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const awaited = await params;
  return <h1 className="text-3xl font-bold">Event o ID {awaited.id}</h1>;
}
