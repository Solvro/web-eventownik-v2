import { ChatConversation } from "@/components/mobile/social/chat-conversation";

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ eventSlug: string; roomUuid: string }>;
}) {
  const { roomUuid } = await params;
  return <ChatConversation roomUuid={roomUuid} />;
}
