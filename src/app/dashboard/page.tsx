import { getUser } from "@/lib/dal";
import { verifySession } from "@/lib/session";

export default async function DashboardHomepage() {
  const session = await verifySession();
  const user = await getUser();
  return (
    <h1 className="text-3xl font-bold">
      Panel organizatora | Bearer token: {session?.bearerToken} | Email:{" "}
      {user?.email}
    </h1>
  );
}
