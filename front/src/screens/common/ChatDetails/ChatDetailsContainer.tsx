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
import { pick } from '@react-native-documents/picker';

type ChatDetailsRouteProp = RouteProp<MainStackParamList, 'ChatDetails'>;

const recommdationMessages = [
  '안녕하세요!',
  '네, 알겠습니다.',
  '네, 감사합니다.',
  '당일 예약 가능할까요?',
  '그럼 촬영날 뵙겠습니다.',
]

export default function ChatDetailsContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<ChatDetailsRouteProp>();

  const { chatRoomId, profileImageURI, opponentId } = route.params;
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
    const stompClient = new ChatStompClient();
    stompClientRef.current = stompClient;

    const run = async () => {
      try {
        console.log('[ChatDetails] Connecting to WebSocket...');
        await stompClient.connect((error) => {
          console.error('[ChatDetails] STOMP connection error:', error);
        });
        console.log('[ChatDetails] WebSocket connected successfully');

        console.log('[ChatDetails] Subscribing to room:', roomId);
        stompClient.subscribeRoom(roomId, (message: ChatMessage) => {
          console.log('[ChatDetails] Received message:', JSON.stringify(message, null, 2));

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

        console.log('[ChatDetails] Entering room:', roomId);
        stompClient.enter(roomId);
      } catch (e) {
        console.error('[ChatDetails] STOMP init failed:', e);
      }
    };

    run();

    return () => {
      console.log('[ChatDetails] Disconnecting WebSocket...');
      stompClientRef.current?.disconnect();
      stompClientRef.current = null;
    };
  }, [roomId, queryClient]);

  const handlePressBack = () => {
    navigation.goBack();
  };

  const handlePressRecommendedMessage = (message: string) => {
    setMessageInput(message);
  }

  const handlePressSend = useCallback(async () => {
    if (messageInput.trim().length === 0) return;

    if (!stompClientRef.current) {
      console.error('[ChatDetails] STOMP client not initialized');
      Alert.show({
        title: '연결 오류',
        message: '채팅 서버에 연결되지 않았습니다.',
      });
      return;
    }

    // Wait for connection if not connected yet (max 5 seconds)
    if (!stompClientRef.current.isConnected()) {
      console.log('[ChatDetails] Waiting for WebSocket connection...');
      let waitTime = 0;
      const maxWait = 5000;
      const checkInterval = 100;

      while (!stompClientRef.current.isConnected() && waitTime < maxWait) {
        await new Promise(resolve => setTimeout(resolve, checkInterval));
        waitTime += checkInterval;
      }

      if (!stompClientRef.current.isConnected()) {
        console.error('[ChatDetails] Connection timeout after', maxWait, 'ms');
        Alert.show({
          title: '연결 오류',
          message: '채팅 서버 연결 대기 시간이 초과되었습니다.',
        });
        return;
      }
      console.log('[ChatDetails] Connection established after', waitTime, 'ms');
    }

    try {
      const messageData = {
        roomId,
        content: messageInput.trim(),
        type: 'TEXT' as const,
      };
      console.log('[ChatDetails] Sending message:', JSON.stringify(messageData, null, 2));

      stompClientRef.current.sendMessage(messageData);
      setMessageInput('');
      console.log('[ChatDetails] Message sent successfully');
    } catch (error) {
      console.error('[ChatDetails] Failed to send message:', error);
      Alert.show({
        title: '전송 실패',
        message: '메시지 전송에 실패했습니다.',
      });
    }
  }, [messageInput, roomId]);

  const handlePressAlbum = useCallback(async () => {
    requestPermission('photo', async () => {
      try {
        console.log('[ChatDetails] Opening image picker...');
        const result: ImagePickerResponse = await launchImageLibrary({
          mediaType: 'photo',
          selectionLimit: 1,
          quality: 0.8,
        });

        if (result.didCancel) {
          console.log('[ChatDetails] Image picker cancelled');
          return;
        }

        if (result.errorCode) {
          console.error('[ChatDetails] Image picker error:', result.errorCode, result.errorMessage);
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

          console.log('[ChatDetails] Uploading image:', file.name);
          // Upload file to server
          const url = await uploadFileMutation.mutateAsync({ roomId, file });
          console.log('[ChatDetails] Image uploaded successfully:', url);

          if (!stompClientRef.current) {
            console.error('[ChatDetails] STOMP client not initialized');
            Alert.show({
              title: '연결 오류',
              message: '채팅 서버에 연결되지 않았습니다.',
            });
            return;
          }

          // Wait for connection if not connected yet
          if (!stompClientRef.current.isConnected()) {
            console.log('[ChatDetails] Waiting for WebSocket connection (image)...');
            let waitTime = 0;
            const maxWait = 5000;
            const checkInterval = 100;

            while (!stompClientRef.current.isConnected() && waitTime < maxWait) {
              await new Promise(resolve => setTimeout(resolve, checkInterval));
              waitTime += checkInterval;
            }

            if (!stompClientRef.current.isConnected()) {
              console.error('[ChatDetails] Connection timeout after', maxWait, 'ms');
              Alert.show({
                title: '연결 오류',
                message: '채팅 서버 연결 대기 시간이 초과되었습니다.',
              });
              return;
            }
            console.log('[ChatDetails] Connection established after', waitTime, 'ms');
          }

          const imageMessage = {
            roomId,
            content: url,
            type: 'IMAGE' as const,
          };
          console.log('[ChatDetails] Sending image message:', JSON.stringify(imageMessage, null, 2));
          stompClientRef.current.sendMessage(imageMessage);
          console.log('[ChatDetails] Image message sent successfully');
        }
      } catch (error) {
        console.error('[ChatDetails] Failed to upload image:', error);
        Alert.show({
          title: '업로드 실패',
          message: '이미지 업로드에 실패했습니다.',
        });
      }
    });
  }, [roomId, uploadFileMutation]);

  const handlePressFile = useCallback(async () => {
    try {
      console.log('[ChatDetails] Opening document picker...');
      const result = await pick();

      console.log('[ChatDetails] Document picked:', result);

      if (result && result[0]) {
        const pickedFile = result[0];
        const file = {
          uri: pickedFile.uri,
          name: pickedFile.name || 'file',
          type: pickedFile.type || 'application/octet-stream',
        };

        console.log('[ChatDetails] Uploading file:', file.name);
        // Upload file to server
        const url = await uploadFileMutation.mutateAsync({ roomId, file });
        console.log('[ChatDetails] File uploaded successfully:', url);

        if (!stompClientRef.current) {
          console.error('[ChatDetails] STOMP client not initialized');
          Alert.show({
            title: '연결 오류',
            message: '채팅 서버에 연결되지 않았습니다.',
          });
          return;
        }

        // Wait for connection if not connected yet
        if (!stompClientRef.current.isConnected()) {
          console.log('[ChatDetails] Waiting for WebSocket connection (file)...');
          let waitTime = 0;
          const maxWait = 5000;
          const checkInterval = 100;

          while (!stompClientRef.current.isConnected() && waitTime < maxWait) {
            await new Promise(resolve => setTimeout(resolve, checkInterval));
            waitTime += checkInterval;
          }

          if (!stompClientRef.current.isConnected()) {
            console.error('[ChatDetails] Connection timeout after', maxWait, 'ms');
            Alert.show({
              title: '연결 오류',
              message: '채팅 서버 연결 대기 시간이 초과되었습니다.',
            });
            return;
          }
          console.log('[ChatDetails] Connection established after', waitTime, 'ms');
        }

        const fileMessage = {
          roomId,
          content: url,
          type: 'FILE' as const,
        };
        console.log('[ChatDetails] Sending file message:', JSON.stringify(fileMessage, null, 2));
        stompClientRef.current.sendMessage(fileMessage);
        console.log('[ChatDetails] File message sent successfully');
      }
    } catch (error) {
      console.error('[ChatDetails] Failed to upload file:', error);
      Alert.show({
        title: '업로드 실패',
        message: '파일 업로드에 실패했습니다.',
      });
    }
  }, [roomId, uploadFileMutation]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <ChatDetailsView
      partnerNickname={partnerNickname}
      opponentId={opponentId}
      opponentProfileImageURI={profileImageURI}
      messages={messages}
      messageInput={messageInput}
      onChangeMessageInput={setMessageInput}
      onPressSend={handlePressSend}
      onPressBack={handlePressBack}
      recommendedMessages={recommdationMessages}
      onPressRecommendedMessage={handlePressRecommendedMessage}
      onPressAlbum={handlePressAlbum}
      onPressFile={handlePressFile}
      onLoadMore={handleLoadMore}
      isFetchingNextPage={isFetchingNextPage}
    />
  );
}
