import { ChatRoomList } from "@/components/mobile/social/chat-room-list";
import { MobileTabPage } from "@/components/mobile/tab-page";

export default function ChatsPage() {
  return (
    <MobileTabPage title="Czaty">
      <ChatRoomList />
    </MobileTabPage>
  );
}
