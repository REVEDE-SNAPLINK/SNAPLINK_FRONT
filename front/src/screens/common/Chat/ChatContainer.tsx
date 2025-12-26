import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation';
import ChatView from '@/screens/common/Chat/ChatView.tsx';
import { useChatRoomsQuery } from '@/queries/chat.ts';

export default function ChatContainer() {
  const navigation = useNavigation<MainNavigationProp>();

  // Fetch chat rooms
  const { data: chatRooms = [] } = useChatRoomsQuery();

  const handlePressChatRoom = (chatRoomId: number, opponentId: string) => {
    const room = chatRooms.find((r) => r.roomId === chatRoomId);
    const profileImageURI = room?.opponentProfileImageUrl || '';
    navigation.navigate('ChatDetails', { chatRoomId, opponentProfileImageURI: profileImageURI, opponentId });
  };

  return (
    <ChatView
      chatRooms={chatRooms}
      onPressChatRoom={handlePressChatRoom}
    />
  )
}
