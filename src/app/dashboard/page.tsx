import { verifySession } from "@/lib/session";

export default async function DashboardHomepage() {
  const session = await verifySession();
  return (
    <h1 className="text-3xl font-bold">
      Panel organizatora | {session?.bearerToken}
    </h1>
  );
}
