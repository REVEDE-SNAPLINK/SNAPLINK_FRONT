import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation';
import ChatDetailsView from './ChatDetailsView';
import { useChatMessagesInfiniteQuery, useChatRoomsQuery, useUploadChatFileMutation } from '@/queries/chat.ts';
import { ChatStompClient } from '@/ws/chatClient';
import { chatQueryKeys } from '@/queries/keys';
import { ChatMessage } from '@/api/chat';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { requestPermission } from '@/utils/permissions';
import { Alert } from '@/components/theme';
import { USE_MOCK_DATA, sendMockChatMessage, markMockChatRoomAsRead } from '@/__dev__';

type ChatDetailsRouteProp = RouteProp<MainStackParamList, 'ChatDetails'>;

export default function ChatDetailsContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<ChatDetailsRouteProp>();

  const { chatRoomId, opponentProfileImageURI, opponentId } = route.params;
  const roomId = Number(chatRoomId);
  const queryClient = useQueryClient();

  const [messageInput, setMessageInput] = useState('');
  const stompClientRef = useRef<ChatStompClient | null>(null);

  // Fetch messages with infinite scroll
  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatMessagesInfiniteQuery(roomId, { size: 50 });

  // Flatten messages from all pages and reverse so newest appear at top
  const messages = useMemo(() => {
    if (!messagesData) return [];
    return messagesData.pages.flatMap((page) => page).reverse();
  }, [messagesData]);

  // Fetch chat rooms to get partner info
  const { data: chatRooms = [] } = useChatRoomsQuery();
  const currentChatRoom = chatRooms.find((room) => room.roomId === roomId);
  const partnerNickname = currentChatRoom?.opponentNickname || '상대방';

  // Upload file mutation
  const uploadFileMutation = useUploadChatFileMutation();

  // Initialize STOMP WebSocket connection

  useEffect(() => {
    // Mock 모드에서는 WebSocket 연결하지 않음
    if (USE_MOCK_DATA) {
      // 채팅방 읽음 처리
      markMockChatRoomAsRead(roomId);
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.rooms() });
      return;
    }

    const stompClient = new ChatStompClient();
    stompClientRef.current = stompClient;

    const run = async () => {
      try {
        await stompClient.connect((error) => {
          console.error('STOMP connection error:', error);
        });

        stompClient.subscribeRoom(roomId, (message: ChatMessage) => {
          console.log('Received message:', message);

          // Update query cache with new message
          queryClient.setQueryData(
            chatQueryKeys.messagesInfinite(roomId, { size: 50 }),
            (oldData: any) => {
              if (!oldData) return oldData;

              // Add new message to first page
              const newPages = [...oldData.pages];
              if (newPages.length > 0) {
                newPages[0] = [message, ...newPages[0]];
              } else {
                newPages[0] = [message];
              }

              return {
                ...oldData,
                pages: newPages,
              };
            }
          );

          // Also invalidate chat rooms to update last message
          queryClient.invalidateQueries({ queryKey: chatQueryKeys.rooms() });
        });


        stompClient.enter(roomId);
      } catch (e) {
        console.error('STOMP init failed:', e);
      }
    };

    run();

    return () => {
      // leave는 연결 안되어도 safePublish가 큐잉할 수 있어서,
      // 여기서는 그냥 disconnect만 해도 됨 (원하면 leave 호출해도 OK)
      stompClientRef.current?.disconnect();
      stompClientRef.current = null;
    };
  }, [roomId, queryClient]);

  const handlePressBack = () => {
    navigation.goBack();
  };

  const handlePressSend = useCallback(() => {
    if (messageInput.trim().length === 0) return;

    // Mock 모드: 직접 query cache 업데이트
    if (USE_MOCK_DATA) {
      try {
        const newMessage = sendMockChatMessage(roomId, messageInput.trim(), 'TEXT');

        // Update query cache
        queryClient.setQueryData(
          chatQueryKeys.messagesInfinite(roomId, { size: 50 }),
          (oldData: any) => {
            if (!oldData) return oldData;

            const newPages = [...oldData.pages];
            if (newPages.length > 0) {
              newPages[0] = [newMessage, ...newPages[0]];
            } else {
              newPages[0] = [newMessage];
            }

            return {
              ...oldData,
              pages: newPages,
            };
          }
        );

        // Update chat rooms
        queryClient.invalidateQueries({ queryKey: chatQueryKeys.rooms() });

        setMessageInput('');
      } catch (error) {
        console.error('Failed to send mock message:', error);
      }
      return;
    }

    // 실제 STOMP 전송
    if (!stompClientRef.current) {
      console.error('STOMP client not connected');
      return;
    }

    try {
      stompClientRef.current.sendMessage({
        roomId,
        content: messageInput.trim(),
        type: 'TEXT',
      });
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.show({
        title: '전송 실패',
        message: '메시지 전송에 실패했습니다.',
      });
    }
  }, [messageInput, roomId, queryClient]);

  const handlePressAlbum = useCallback(async () => {
    requestPermission('photo', async () => {
      try {
        const result: ImagePickerResponse = await launchImageLibrary({
          mediaType: 'photo',
          selectionLimit: 1,
          quality: 0.8,
        });

        if (result.didCancel) return;

        if (result.errorCode) {
          Alert.show({
            title: '갤러리 오류',
            message: result.errorMessage || '알 수 없는 오류',
          });
          return;
        }

        if (result.assets && result.assets[0] && result.assets[0].uri && result.assets[0].fileName && result.assets[0].type) {
          const file = {
            uri: result.assets[0].uri,
            name: result.assets[0].fileName,
            type: result.assets[0].type || 'image/jpeg',
          };

          // Upload file to server
          const url = await uploadFileMutation.mutateAsync({ roomId, file });

          // Mock 모드: 직접 query cache 업데이트
          if (USE_MOCK_DATA) {
            const newMessage = sendMockChatMessage(roomId, url, 'IMAGE');

            queryClient.setQueryData(
              chatQueryKeys.messagesInfinite(roomId, { size: 50 }),
              (oldData: any) => {
                if (!oldData) return oldData;

                const newPages = [...oldData.pages];
                if (newPages.length > 0) {
                  newPages[0] = [newMessage, ...newPages[0]];
                } else {
                  newPages[0] = [newMessage];
                }

                return {
                  ...oldData,
                  pages: newPages,
                };
              }
            );

            queryClient.invalidateQueries({ queryKey: chatQueryKeys.rooms() });
          }
          // 실제 STOMP 전송
          else if (stompClientRef.current) {
            stompClientRef.current.sendMessage({
              roomId,
              content: url,
              type: 'IMAGE',
            });
          }
        }
      } catch (error) {
        console.error('Failed to upload image:', error);
        Alert.show({
          title: '업로드 실패',
          message: '이미지 업로드에 실패했습니다.',
        });
      }
    });
  }, [roomId, uploadFileMutation]);

  const handlePressFile = useCallback(async () => {
    // TODO: 파일 picker 기능은 react-native-document-picker 패키지 설치 필요
    // npm install react-native-document-picker
    Alert.show({
      title: '준비중',
      message: '파일 전송 기능은 준비중입니다.',
    });
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <ChatDetailsView
      partnerNickname={partnerNickname}
      opponentId={opponentId}
      opponentProfileImageURI={opponentProfileImageURI}
      messages={messages}
      messageInput={messageInput}
      onChangeMessageInput={setMessageInput}
      onPressSend={handlePressSend}
      onPressBack={handlePressBack}
      recommendedMessages={[]}
      onPressRecommendedMessage={() => {}}
      onPressAlbum={handlePressAlbum}
      onPressFile={handlePressFile}
      onLoadMore={handleLoadMore}
      isFetchingNextPage={isFetchingNextPage}
    />
  );
}
