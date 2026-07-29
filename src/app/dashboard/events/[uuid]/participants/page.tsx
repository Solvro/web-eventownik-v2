import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { verifySession } from "@/lib/session";
import type { Attribute } from "@/types/attributes";

import {
  getAttributes,
  getBlocks,
  getEmails,
  getParticipants,
} from "./actions";
import { ParticipantsLoader } from "./participants-loader";

export const metadata: Metadata = {
  title: "Uczestnicy",
};

export default async function DashboardEventParticipantsPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const session = await verifySession();
  if (session === null) {
    redirect("/auth/login");
  }
  const { uuid } = await params;

  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["participants", uuid],
      queryFn: async () => getParticipants(uuid),
    }),
    queryClient.prefetchQuery({
      queryKey: ["attributes", uuid],
      queryFn: async () => getAttributes(uuid),
    }),
    queryClient.prefetchQuery({
      queryKey: ["emails", uuid],
      queryFn: async () => getEmails(uuid),
    }),
  ]);

  const attributes = queryClient.getQueryData<Attribute[]>([
    "attributes",
    uuid,
  ]);

  if (attributes != null) {
    await queryClient.prefetchQuery({
      queryKey: ["blocks", uuid, attributes],
      queryFn: async () => getBlocks(uuid, attributes),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ParticipantsLoader eventUuid={uuid} />
    </HydrationBoundary>
  );
}
