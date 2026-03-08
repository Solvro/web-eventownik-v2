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
  params: Promise<{ id: string }>;
}) {
  const session = await verifySession();
  if (session === null) {
    redirect("/auth/login");
  }
  const { id } = await params;

  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["participants", id],
      queryFn: async () => getParticipants(id),
    }),
    queryClient.prefetchQuery({
      queryKey: ["attributes", id],
      queryFn: async () => getAttributes(id),
    }),
    queryClient.prefetchQuery({
      queryKey: ["emails", id],
      queryFn: async () => getEmails(id),
    }),
  ]);

  const attributes = queryClient.getQueryData<Attribute[]>(["attributes", id]);

  if (attributes != null) {
    await queryClient.prefetchQuery({
      queryKey: ["blocks", id, attributes],
      queryFn: async () => getBlocks(id, attributes),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ParticipantsLoader eventId={id} />
    </HydrationBoundary>
  );
}
