import { useState, useCallback, useMemo } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation';
import ChatDetailsView from './ChatDetailsView';
import { useChatMessagesInfiniteQuery, useChatRoomsQuery, useUploadChatFileMutation } from '@/queries/chat.ts';

type ChatDetailsRouteProp = RouteProp<MainStackParamList, 'ChatDetails'>;

export default function ChatDetailsContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<ChatDetailsRouteProp>();

  const { chatRoomId } = route.params;
  const roomId = Number(chatRoomId);

  const [messageInput, setMessageInput] = useState('');

  // Fetch messages with infinite scroll
  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatMessagesInfiniteQuery(roomId, { size: 50 });

  // Flatten messages from all pages
  const messages = useMemo(() => {
    if (!messagesData) return [];
    return messagesData.pages.flatMap((page) => page);
  }, [messagesData]);

  // TODO: 추천 메시지 기능 - 백엔드 API 추가 시 구현
  // GET /api/chat/recommended-messages 엔드포인트 필요
  // const { data: recommendedMessages = [] } = useQuery({
  //   queryKey: chatQueryKeys.recommendedMessages(),
  //   queryFn: getRecommendedMessages,
  // });

  // Fetch chat rooms to get partner info
  const { data: chatRooms = [] } = useChatRoomsQuery();
  const currentChatRoom = chatRooms.find((room) => room.roomId === roomId);
  const partnerNickname = currentChatRoom?.opponentNickname || '상대방';

  // Upload file mutation
  const uploadFileMutation = useUploadChatFileMutation();

  // TODO: 메시지 전송은 STOMP WebSocket으로 처리해야 합니다
  // 현재 REST API에는 메시지 전송 엔드포인트가 없습니다
  // STOMP 클라이언트 연결 후 아래 로직 구현:
  //
  // const stompClient = useStompClient(); // STOMP hook 필요
  //
  // const sendMessageMutation = useMutation({
  //   mutationFn: async ({ content, type }: { content: string; type: 'TEXT' | 'IMAGE' }) => {
  //     return stompClient.send(`/app/chat/rooms/${roomId}/messages`, {
  //       content,
  //       type,
  //     });
  //   },
  //   onSuccess: () => {
  //     setMessageInput('');
  //     // STOMP 구독으로 자동 업데이트되므로 별도 invalidate 불필요
  //   },
  // });

  const handlePressBack = () => {
    navigation.goBack();
  };

  const handlePressSend = useCallback(() => {
    if (messageInput.trim().length === 0) return;

    // TODO: STOMP WebSocket으로 메시지 전송
    // sendMessageMutation.mutate({
    //   content: messageInput.trim(),
    //   type: 'TEXT',
    // });

    console.warn('메시지 전송 기능은 STOMP WebSocket 구현이 필요합니다:', messageInput);
    setMessageInput('');
  }, [messageInput]);

  // TODO: 추천 메시지 기능 - 백엔드 API 추가 시 구현
  // const handlePressRecommendedMessage = useCallback((message: string) => {
  //   setMessageInput(message);
  // }, []);

  const handlePressAlbum = useCallback(async () => {
    // TODO: 이미지 picker로 선택 후 업로드
    // import { launchImageLibrary } from 'react-native-image-picker';
    //
    // const result = await launchImageLibrary({ mediaType: 'photo' });
    // if (result.assets && result.assets[0]) {
    //   const file = {
    //     uri: result.assets[0].uri!,
    //     name: result.assets[0].fileName || 'image.jpg',
    //     type: result.assets[0].type || 'image/jpeg',
    //   };
    //
    //   const url = await uploadFileMutation.mutateAsync({ roomId, file });
    //   // STOMP으로 이미지 URL 메시지 전송
    //   // sendMessageMutation.mutate({ content: url, type: 'IMAGE' });
    // }

    console.log('Open album');
  }, [roomId, uploadFileMutation]);

  const handlePressFile = useCallback(async () => {
    // TODO: 파일 picker로 선택 후 업로드
    // import DocumentPicker from 'react-native-document-picker';
    //
    // const result = await DocumentPicker.pick({ type: [DocumentPicker.types.allFiles] });
    // const file = {
    //   uri: result[0].uri,
    //   name: result[0].name,
    //   type: result[0].type || 'application/octet-stream',
    // };
    //
    // const url = await uploadFileMutation.mutateAsync({ roomId, file });
    // // STOMP으로 파일 URL 메시지 전송
    // // sendMessageMutation.mutate({ content: url, type: 'FILE' });

    console.log('Open file picker');
  }, [roomId, uploadFileMutation]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <ChatDetailsView
      partnerNickname={partnerNickname}
      messages={messages}
      messageInput={messageInput}
      onChangeMessageInput={setMessageInput}
      onPressSend={handlePressSend}
      onPressBack={handlePressBack}
      // recommendedMessages={recommendedMessages}
      // onPressRecommendedMessage={handlePressRecommendedMessage}
      onPressAlbum={handlePressAlbum}
      onPressFile={handlePressFile}
      onLoadMore={handleLoadMore}
      isFetchingNextPage={isFetchingNextPage}
    />
  );
}
