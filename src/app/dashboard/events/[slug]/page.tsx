export default function DashboardEventPage({
  params,
}: {
  params: { slug: string };
}) {
  return <h1 className="text-3xl font-bold">{params.slug}</h1>;
}
