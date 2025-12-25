import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation';
import ChatView from '@/screens/common/Chat/ChatView.tsx';
import { useChatRoomsQuery } from '@/queries/chat.ts';

export default function ChatContainer() {
  const navigation = useNavigation<MainNavigationProp>();

  // Fetch chat rooms
  const { data: chatRooms = [] } = useChatRoomsQuery();

  const handlePressChatRoom = (chatRoomId: string) => {
    navigation.navigate('ChatDetails', { chatRoomId });
  };

  return <ChatView chatRooms={chatRooms} onPressChatRoom={handlePressChatRoom} />;
}
