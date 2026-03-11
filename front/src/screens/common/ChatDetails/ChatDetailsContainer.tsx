import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation';
import ChatDetailsView, { FileDownloadState } from './ChatDetailsView';
import { useChatMessagesInfiniteQuery, useUploadChatFileMutation, useChatRoomDetailQuery } from '@/queries/chat.ts';
import { ChatStompClient } from '@/ws/chatClient';
import { chatQueryKeys } from '@/queries/keys';
import { ChatMessage } from '@/api/chat';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { requestPermission } from '@/utils/permissions';
import { Alert } from '@/components/ui';
import { pick } from '@react-native-documents/picker';
import RNBlobUtil from 'react-native-blob-util';
import { AppState, Platform } from 'react-native';
import { CLOUDFRONT_BASE_URL } from '@/config/api.ts';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { useAuthStore } from '@/store/authStore.ts';
import { useModalStore } from '@/store/modalStore.ts';
import { safeLogEvent, trackChatEvent } from '@/utils/analytics.ts';
import crashlytics from '@react-native-firebase/crashlytics';
import { useLeaveChatRoomMutation } from "@/mutations/chat.ts";
import { useBlockChatUserMutation, useUnblockChatUserMutation } from "@/mutations/block.ts";
import { REASON, reportUser } from '@/api/reports.ts';
import { showErrorAlert } from '@/utils/error';

type ChatDetailsRouteProp = RouteProp<MainStackParamList, 'ChatDetails'>;

const recommdationMessages = [
  '안녕하세요!',
  '네, 알겠습니다.',
  '네, 감사합니다.',
  '당일 예약 가능할까요?',
  '그럼 촬영날 뵙겠습니다.',
];

// --- downloadKey util ---
const makeDownloadKey = (url: string) =>
  encodeURIComponent(url.replace(/^\/+/, ''));

// --- verifyDownloaded util ---
const DOWNLOAD_STATE_STORAGE_KEY = (roomId: number | string) => `chat:fileDownloadStates:${roomId}`;

// --- 메시지 읽음 상태 저장 키 ---
const MESSAGE_READ_STATE_STORAGE_KEY = (roomId: number | string) => `chat:messageReadStates:${roomId}`;
const normalizeIosPath = (p: string) => {
  if (!p) return p;
  // RNBlobUtil sometimes returns `file://` URIs; fs.exists/stat expect a plain absolute path.
  return p.startsWith('file://') ? p.replace('file://', '') : p;
};

const verifyDownloaded = async (localPath?: string) => {
  if (!localPath) return false;
  const path = Platform.OS === 'ios' ? normalizeIosPath(localPath) : localPath;
  try {
    const exists = await RNBlobUtil.fs.exists(path);
    if (!exists) return false;
    const stat = await RNBlobUtil.fs.stat(path);
    return Number(stat.size) > 0;
  } catch {
    return false;
  }
};

export default function ChatDetailsContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<ChatDetailsRouteProp>();
  const { userId, userType } = useAuthStore();
  const { openReportModal, setReportModalLoading, closeReportModal } = useModalStore();

  const { roomId } = route.params;
  const queryClient = useQueryClient();

  const [messageInput, setMessageInput] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fileDownloadStates, setFileDownloadStates] = useState<Record<string, FileDownloadState>>({});
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [imagePreviewIndex, setImagePreviewIndex] = useState(0);
  const stompClientRef = useRef<ChatStompClient | null>(null);
  const didHydrateDownloadStatesRef = useRef(false);
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didVerifyDownloadStatesRef = useRef<string | null>(null);

  // ✅ 메시지 읽음 상태 관리 (messageId -> unreadCount: 1 = 상대방 안 읽음, 0 = 모두 읽음)
  const [messageReadStates, setMessageReadStates] = useState<Record<number, number>>({});
  const didHydrateReadStatesRef = useRef(false);
  const readStatePersistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 상대방 메시지 수신 시 enter(읽음) debounce 타이머
  const enterDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ✅ 채팅 이벤트 추적용 상태
  const [messageCount, setMessageCount] = useState(0);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const lastUserMessageTimeRef = useRef<number | null>(null);
  const photographerFirstResponseRef = useRef(true);

  // Fetch chat room detail (nickname, profile image, blocked status)
  const { data: chatRoomDetail } = useChatRoomDetailQuery(roomId);

  // Sync blocked status with QueryClient (초기 로드 시에만 API → 로컬 동기화)
  // 차단 해제는 mutation에서만 처리 (API 응답이 로컬 차단 상태를 덮어쓰지 않도록)
  useEffect(() => {
    if (chatRoomDetail && roomId && chatRoomDetail.blocked) {
      const blockedRooms = queryClient.getQueryData<Set<number>>(chatQueryKeys.blockedRooms()) || new Set();

      if (!blockedRooms.has(roomId)) {
        // API에서 차단 상태일 때만 로컬에 추가 (차단 해제는 mutation에서 처리)
        blockedRooms.add(roomId);
        queryClient.setQueryData(chatQueryKeys.blockedRooms(), new Set(blockedRooms));
      }
    }
  }, [chatRoomDetail, roomId, queryClient]);

  // Fetch messages with infinite scroll
  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatMessagesInfiniteQuery(roomId, { size: 50 }, !chatRoomDetail?.blocked);

  const { mutate: blockMutate } = useBlockChatUserMutation();
  const { mutate: unblockMutate } = useUnblockChatUserMutation();
  const { mutate: leaveMutate } = useLeaveChatRoomMutation();

  // Flatten messages for UI rendering (oldest -> newest)
  // Be robust to whatever ordering/pagination the API returns by sorting by sentAt.
  const messages = useMemo(() => {
    if (!messagesData) return [];

    const all = messagesData.pages.flatMap((page) => page);

    // sentAt: ISO string assumed
    const toTime = (v: any) => {
      const t = new Date(v?.sentAt ?? 0).getTime();
      return Number.isFinite(t) ? t : 0;
    };

    return [...all].sort((a: any, b: any) => {
      const ta = toTime(a);
      const tb = toTime(b);
      if (ta !== tb) return ta - tb;
      // tie-breakers to keep sort stable-ish
      const ida = a?.messageId ?? 0;
      const idb = b?.messageId ?? 0;
      if (ida !== idb) return ida - idb;
      return 0;
    });
  }, [messagesData]);

  // Extract partner info from chatRoomDetail API
  const partnerNickname = chatRoomDetail?.opponentNickname || '';
  const profileImageURI = chatRoomDetail?.opponentProfileImage || '';
  const isBlocked = chatRoomDetail?.blocked || false;
  const opponentId = chatRoomDetail?.opponentId || '';

  // Upload file mutation
  const uploadFileMutation = useUploadChatFileMutation();

  useEffect(() => {
    const logChatEntered = async () => {
      await safeLogEvent('activation_chat_entered', {
        room_id: roomId,
      });
    };

    logChatEntered();
  }, [roomId, userId, userType]);

  // Hydrate fileDownloadStates from AsyncStorage on mount/roomId change
  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      try {
        didHydrateDownloadStatesRef.current = false;
        const raw = await AsyncStorage.getItem(DOWNLOAD_STATE_STORAGE_KEY(roomId));
        if (!raw) {
          didHydrateDownloadStatesRef.current = true;
          didVerifyDownloadStatesRef.current = null;
          return;
        }
        const parsed = JSON.parse(raw) as Record<string, FileDownloadState>;
        if (cancelled || !parsed || typeof parsed !== 'object') {
          didHydrateDownloadStatesRef.current = true;
          didVerifyDownloadStatesRef.current = null;
          return;
        }

        // Merge persisted state (do not clobber in-memory newer entries)
        setFileDownloadStates((prev) => ({ ...parsed, ...prev }));
      } catch (e) {
        console.warn('[ChatDetails] Failed to hydrate download states:', e);
      } finally {
        didHydrateDownloadStatesRef.current = true;
        didVerifyDownloadStatesRef.current = null;
      }
    };

    hydrate();

    return () => {
      cancelled = true;
    };
  }, [roomId]);

  // Persist fileDownloadStates to AsyncStorage (debounced) after hydration
  useEffect(() => {
    if (!didHydrateDownloadStatesRef.current) return;

    if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    persistTimerRef.current = setTimeout(() => {
      AsyncStorage.setItem(
        DOWNLOAD_STATE_STORAGE_KEY(roomId),
        JSON.stringify(fileDownloadStates)
      ).catch((e) => console.warn('[ChatDetails] Failed to persist download states:', e));
    }, 250);

    return () => {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
        persistTimerRef.current = null;
      }
    };
  }, [fileDownloadStates, roomId]);

  // ✅ 메시지 읽음 상태 hydrate (AsyncStorage에서 불러오기)
  useEffect(() => {
    let cancelled = false;

    const hydrateReadStates = async () => {
      try {
        didHydrateReadStatesRef.current = false;
        const raw = await AsyncStorage.getItem(MESSAGE_READ_STATE_STORAGE_KEY(roomId));
        if (!raw) {
          didHydrateReadStatesRef.current = true;
          return;
        }
        const parsed = JSON.parse(raw) as Record<number, number>;
        if (cancelled || !parsed || typeof parsed !== 'object') {
          didHydrateReadStatesRef.current = true;
          return;
        }
        setMessageReadStates((prev) => ({ ...parsed, ...prev }));
      } catch (e) {
        console.warn('[ChatDetails] Failed to hydrate read states:', e);
      } finally {
        didHydrateReadStatesRef.current = true;
      }
    };

    hydrateReadStates();

    return () => {
      cancelled = true;
    };
  }, [roomId]);

  // ✅ 메시지 읽음 상태 persist (AsyncStorage에 저장하기, debounced)
  useEffect(() => {
    if (!didHydrateReadStatesRef.current) return;

    if (readStatePersistTimerRef.current) clearTimeout(readStatePersistTimerRef.current);
    readStatePersistTimerRef.current = setTimeout(() => {
      AsyncStorage.setItem(
        MESSAGE_READ_STATE_STORAGE_KEY(roomId),
        JSON.stringify(messageReadStates)
      ).catch((e) => console.warn('[ChatDetails] Failed to persist read states:', e));
    }, 250);

    return () => {
      if (readStatePersistTimerRef.current) {
        clearTimeout(readStatePersistTimerRef.current);
        readStatePersistTimerRef.current = null;
      }
    };
  }, [messageReadStates, roomId]);

  // Initialize STOMP WebSocket connection (차단된 경우 연결하지 않음)
  useEffect(() => {
    // 차단된 채팅방이면 WebSocket 연결하지 않음
    if (chatRoomDetail?.blocked) {
      console.log('[ChatDetails] Room is blocked, skipping WebSocket connection');
      return;
    }

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
        stompClient.subscribeRoom(roomId, (message: ChatMessage & { type?: string }) => {
          console.log('[ChatDetails] Received message:', JSON.stringify(message, null, 2));

          // ✅ READ_EVENT 처리: 상대방이 읽었으므로 내가 보낸 메시지들의 unreadCount를 0으로 업데이트
          if ((message as any).type === 'READ_EVENT') {
            console.log('[ChatDetails] READ_EVENT received from:', message.senderId);
            // 상대방이 읽었으면 내가 보낸 모든 메시지의 unreadCount를 0으로
            if (message.senderId !== userId) {
              setMessageReadStates(prev => {
                const updated = { ...prev };
                Object.keys(updated).forEach(key => {
                  if (updated[Number(key)] === 1) {
                    updated[Number(key)] = 0;
                  }
                });
                return updated;
              });
            }
            return; // READ_EVENT는 메시지 목록에 추가하지 않음
          }

          // ✅ 작가 응답 추적 (상대방이 작가인 경우)
          if (message.senderId !== userId && userType === 'user') {
            const now = Date.now();
            const responseTime = lastUserMessageTimeRef.current ? (now - lastUserMessageTimeRef.current) / 1000 : null;

            safeLogEvent('photographer_response', {
              photographer_id: message.senderId,
              room_id: roomId,
              is_first_response: photographerFirstResponseRef.current,
              response_time_seconds: responseTime,
            });

            crashlytics().log(`✉️ Photographer responded in room ${roomId} (${responseTime}s)`);

            if (photographerFirstResponseRef.current) {
              photographerFirstResponseRef.current = false;

              // 첫 응답 시간 별도 추적
              if (responseTime !== null) {
                safeLogEvent('photographer_first_response_time', {
                  photographer_id: message.senderId,
                  response_time_seconds: responseTime,
                  response_time_minutes: Math.round(responseTime / 60),
                });
              }
            }
          }

          // ✅ 내가 보낸 새 메시지의 읽음 상태 설정 (1 = 상대방 안 읽음)
          if (message.senderId === userId && message.messageId) {
            setMessageReadStates(prev => ({
              ...prev,
              [message.messageId]: 1,
            }));
          }

          // 상대방 메시지를 받으면 debounce 후 enter로 읽음 처리
          // (연속 메시지 도착 시 마지막 메시지 기준으로 1회만 READ_EVENT 발행)
          if (message.senderId !== userId) {
            if (enterDebounceRef.current) clearTimeout(enterDebounceRef.current);
            enterDebounceRef.current = setTimeout(() => {
              enterDebounceRef.current = null;
              if (stompClientRef.current?.isConnected()) {
                console.log('[ChatDetails] Sending debounced enter for read receipt');
                stompClientRef.current.enter(roomId);
              }
            }, 300);
          }

          // Update query cache with new message
          queryClient.setQueryData(
            chatQueryKeys.messagesInfinite(roomId, { size: 50 }),
            (oldData: any) => {
              if (!oldData) return oldData;

              // Newest-first: prepend to the first (most recent) page
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
      // debounce 타이머 정리
      if (enterDebounceRef.current) {
        clearTimeout(enterDebounceRef.current);
        enterDebounceRef.current = null;
      }
      console.log('[ChatDetails] Leaving and disconnecting WebSocket...');
      // leave를 먼저 전송해야 서버가 unread count를 정확히 관리할 수 있음
      stompClientRef.current?.leave(roomId);
      stompClientRef.current?.disconnect();
      stompClientRef.current = null;
      // 채팅방 나갈 때 목록 갱신하여 unreadCount 반영
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.rooms() });
    };
  }, [roomId, queryClient, userId, userType, chatRoomDetail?.blocked]);

  // 앱이 백그라운드에서 포그라운드로 복귀했을 때 읽음 처리
  // (백그라운드 중 받은 메시지를 읽음 처리하기 위해 enter 재전송)
  useEffect(() => {
    if (chatRoomDetail?.blocked) return;

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        if (stompClientRef.current?.isConnected()) {
          console.log('[ChatDetails] App foregrounded, sending enter for read receipt');
          stompClientRef.current.enter(roomId);
        }
      }
    });

    return () => subscription.remove();
  }, [roomId, chatRoomDetail?.blocked]);

  // [임시] 5초마다 enter를 보내 상대방이 읽었을 때 READ_EVENT를 수신
  // 서버에서 lastReadMessageId 기반 읽음 관리가 구현되면 제거할 것
  useEffect(() => {
    if (chatRoomDetail?.blocked) return;

    const intervalId = setInterval(() => {
      if (stompClientRef.current?.isConnected()) {
        stompClientRef.current.enter(roomId);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [roomId, chatRoomDetail?.blocked]);

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

      // ✅ 메시지 전송 이벤트 로깅
      trackChatEvent('chat_message_sent', roomId.toString(), undefined, {
        is_first_message: isFirstMessage,
        message_length: messageInput.trim().length,
        message_count: messageCount + 1,
      });

      crashlytics().log(`💬 Message sent in room ${roomId} (count: ${messageCount + 1})`);

      if (isFirstMessage) {
        setIsFirstMessage(false);
      }
      setMessageCount(prev => prev + 1);

      // 사용자 메시지 전송 시각 기록 (작가 응답 시간 계산용)
      lastUserMessageTimeRef.current = Date.now();

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
  }, [messageInput, roomId, isFirstMessage, messageCount]);

  const handlePressAlbum = useCallback(async () => {
    requestPermission('photo', async () => {
      try {
        console.log('[ChatDetails] Opening image picker...');
        const result: ImagePickerResponse = await launchImageLibrary({
          mediaType: 'photo',
          selectionLimit: 0,
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

        if (result.assets && result.assets.length > 0) {
          const assets = result.assets
            .filter((a) => !!a?.uri)
            .map((a) => ({
              uri: a.uri!,
              name: a.fileName || `image_${Date.now()}.jpg`,
              type: a.type || 'image/jpeg',
            }));

          if (assets.length === 0) return;

          console.log('[ChatDetails] Uploading images:', assets.length);

          // Upload sequentially to keep things simple/stable
          const urls: string[] = [];
          for (const file of assets) {
            const url = await uploadFileMutation.mutateAsync({ roomId, file });
            urls.push(url);
          }

          console.log('[ChatDetails] Images uploaded successfully:', urls);

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

          const content = urls.length > 1 ? JSON.stringify(urls) : urls[0];
          const imageMessage = {
            roomId,
            content,
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

  const handlePressTool = () => {
    setIsModalVisible(true);
  }

  const handleCloseModal = () => {
    setIsModalVisible(false);
  }

  const handlePressBlock = () => {
    if (isBlocked) {
      // 차단 해제
      Alert.show({
        title: '상대방에 대한 차단을 해제하시겠습니까?',
        message: '이제 상대방의 게시물을 다시 볼 수 있으며, 서로 채팅을 주고받을 수 있습니다.',
        buttons: [
          { text: '취소', onPress: () => { }, type: 'cancel' },
          {
            text: '차단 해제', onPress: () => {
              unblockMutate({ targetId: opponentId, roomId }, {
                onSuccess: () => {
                  Alert.show({
                    title: '차단 해제 완료',
                    message: '해당 사용자가 차단 해제되었습니다.',
                    buttons: [
                      { text: '확인', onPress: () => { } }
                    ]
                  });
                }
              })
            }, type: 'default'
          },
        ]
      })
    } else {
      // 차단
      Alert.show({
        title: `상대방을 차단하시겠습니까?`,
        message: "차단 시 상대방의 모든 게시물이 숨겨지며, 채팅을 주고받을 수 없습니다.",
        buttons: [
          { text: '취소', onPress: () => { }, type: 'cancel' },
          {
            text: '차단', onPress: () => {
              blockMutate({ targetId: opponentId, roomId }, {
                onSuccess: () => {
                  Alert.show({
                    title: '차단 완료',
                    message: '해당 사용자가 차단되었습니다.',
                    buttons: [
                      {
                        text: '확인', onPress: () => {
                          if (navigation.canGoBack()) {
                            navigation.goBack();
                          } else {
                            navigation.reset({ index: 0, routes: [{ name: "Home" }] })
                          }
                        }
                      }
                    ]
                  });
                }
              })
            }, type: 'destructive'
          },
        ]
      })
    }
    setIsModalVisible(false);
  }

  const handlePressReport = () => {
    openReportModal(
      opponentId,
      'CHAT',
      async ({ reason, description }) => {
        setReportModalLoading(true);
        try {
          await reportUser({
            targetId: opponentId,
            targetType: 'CHAT',
            reason: reason as REASON,
            customReason: reason === 'OTHER' ? description : '',
            description: reason === 'OTHER' ? '' : description,
          });
          setReportModalLoading(false);
          Alert.show({
            title: '소중한 의견 감사합니다',
            message: '신고는 익명으로 처리됩니다. \n앞으로 더 나은 경험을 할 수 있도록 개선하겠습니다.',
            buttons: [
              {
                text: '확인', onPress: () => {
                  closeReportModal();
                  setIsModalVisible(false);
                }
              }
            ]
          });
        } catch (error) {
          setReportModalLoading(false);
          showErrorAlert({
            title: '신고 실패',
            action: '신고 처리',
            error,
          });
        }
      },
      userType === 'user' ? 'photographer' : 'user',
    );
  }

  const handleLeaveChatRoom = () => {
    Alert.show({
      title: '채팅방을 나가시겠어요?',
      message: '나가기 버튼을 누르면 이 채팅방이 목록에서 사라지고 대화 내용이 모두 삭제됩니다.',
      buttons: [
        { text: '취소', onPress: () => { }, type: 'cancel' },
        {
          text: '나가기', onPress: () => {
            leaveMutate(roomId, {
              onSuccess: () => {
                navigation.goBack();
              }
            })
          }, type: 'destructive'
        },
      ]
    })
    leaveMutate
  }

  // 파일 메타데이터 가져오기 (HEAD 요청)
  const fetchFileMetadata = useCallback(async (fileUrl: string) => {
    try {
      const response = await fetch(fileUrl, { method: 'HEAD' });

      // Content-Disposition에서 파일명 추출
      let fileName = '파일';
      const contentDisposition = response.headers.get('Content-Disposition');
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          fileName = filenameMatch[1].replace(/['"]/g, '');
        }
      } else {
        // URL에서 파일명 추출
        const urlParts = fileUrl.split('/');
        const lastPart = urlParts[urlParts.length - 1];
        const fileNameFromUrl = lastPart.split('?')[0];
        if (fileNameFromUrl) {
          fileName = decodeURIComponent(fileNameFromUrl);
        }
      }

      // Content-Length에서 파일 크기 추출
      let fileSize = '알 수 없음';
      const contentLength = response.headers.get('Content-Length');
      if (contentLength) {
        const bytes = parseInt(contentLength, 10);
        if (bytes < 1024) {
          fileSize = `${bytes} B`;
        } else if (bytes < 1024 * 1024) {
          fileSize = `${(bytes / 1024).toFixed(1)} KB`;
        } else {
          fileSize = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        }
      }

      return { fileName, fileSize };
    } catch (error) {
      console.error('[ChatDetails] Failed to fetch file metadata:', error);
      // URL에서 파일명 추출 시도
      const urlParts = fileUrl.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      const fileNameFromUrl = lastPart.split('?')[0];
      return {
        fileName: fileNameFromUrl ? decodeURIComponent(fileNameFromUrl) : '파일',
        fileSize: '알 수 없음',
      };
    }
  }, []);

  const sanitizeFileName = (name: string) =>
    name.replace(/[\\/:*?"<>|]/g, '_'); // 파일명 금지문자 제거

  const handlePressFileDownload = useCallback(async (messageId: number, fileUrl: string) => {
    // Use URL-based key for download states
    const downloadKey = makeDownloadKey(fileUrl);
    const currentState = fileDownloadStates[downloadKey];

    if (currentState?.isDownloaded) {
      try {
        if (Platform.OS === 'ios' && currentState.localPath) {
          // iOS: presentPreview for QuickLook
          await RNBlobUtil.ios.presentPreview(currentState.localPath);
          return;
        }
        if (Platform.OS === 'android' && currentState.localPath) {
          const path = currentState.localPath;
          await RNBlobUtil.android.actionViewIntent(path, '*/*');
          return;
        }
      } catch (e) {
        console.error('[ChatDetails] open failed:', e);
      }
    }

    const url = `${CLOUDFRONT_BASE_URL}${fileUrl}`;

    // fileName/fileSize를 로컬 변수로 확정
    let fileName = currentState?.fileName;
    let fileSize = currentState?.fileSize;

    if (!fileName) {
      const metadata = await fetchFileMetadata(url);
      fileName = metadata.fileName;
      fileSize = metadata.fileSize;

      setFileDownloadStates(prev => ({
        ...prev,
        [downloadKey]: {
          ...prev[downloadKey],
          fileName,
          fileSize,
          isDownloaded: false,
          isDownloading: false,
          downloadKey,
        },
      }));
    }

    const safeName = sanitizeFileName(fileName ?? 'download');

    setFileDownloadStates(prev => ({
      ...prev,
      [downloadKey]: { ...prev[downloadKey], isDownloading: true, downloadKey },
    }));

    try {
      if (Platform.OS === 'android') {
        const downloadDir = RNBlobUtil.fs.dirs.DownloadDir;
        const localPath = `${downloadDir}/${safeName}`;

        await RNBlobUtil.config({
          addAndroidDownloads: {
            useDownloadManager: true,
            notification: true,
            title: safeName,
            description: '파일 다운로드',
            path: localPath,
            mime: '*/*',
            mediaScannable: true,
          },
        }).fetch('GET', url);

        setFileDownloadStates(prev => ({
          ...prev,
          [downloadKey]: {
            ...prev[downloadKey],
            isDownloading: false,
            isDownloaded: true,
            localPath,
            downloadKey,
          },
        }));
        return;
      }

      // iOS
      const downloadDir = RNBlobUtil.fs.dirs.DocumentDir;
      const localPath = `${downloadDir}/${safeName}`;
      const res = await RNBlobUtil.config({ fileCache: true, path: localPath }).fetch('GET', url);

      setFileDownloadStates(prev => ({
        ...prev,
        [downloadKey]: {
          ...prev[downloadKey],
          isDownloading: false,
          isDownloaded: true,
          localPath: res.path(),
          downloadKey,
        },
      }));

      await RNBlobUtil.ios.presentPreview(res.path());
    } catch (e) {
      console.error('[ChatDetails] download failed:', e);
      setFileDownloadStates(prev => ({
        ...prev,
        [downloadKey]: { ...prev[downloadKey], isDownloading: false },
      }));
      Alert.show({ title: '다운로드 실패', message: '파일 다운로드에 실패했습니다.' });
    }
  }, [fileDownloadStates, fetchFileMetadata]);

  // 이미지 프리뷰 열기
  const handlePressImage = useCallback((imageUrl: string, imageUrls: string[]) => {
    const index = imageUrls.indexOf(imageUrl);
    setImagePreviewUrls(imageUrls);
    setImagePreviewIndex(index >= 0 ? index : 0);
    setImagePreviewVisible(true);
  }, []);

  // 이미지 다운로드 (프리뷰에서)
  const handleDownloadImage = useCallback(async (imageUrl: string) => {
    setImagePreviewVisible(false);
    requestPermission('photo', async () => {
      try {
        const fileName = `image_${Date.now()}.jpg`;
        const downloadDir = Platform.OS === 'ios'
          ? RNBlobUtil.fs.dirs.DocumentDir
          : RNBlobUtil.fs.dirs.PictureDir;
        const desiredPath = `${downloadDir}/${fileName}`;

        const downloadUrl = `${CLOUDFRONT_BASE_URL}${imageUrl}`;
        console.log('[ChatDetails] Downloading image to:', desiredPath);

        const res = await RNBlobUtil.config({
          fileCache: true,
          path: desiredPath,
        }).fetch('GET', downloadUrl);

        const savedPath = res.path();

        if (Platform.OS === 'ios') {
          // Save to Photos (Camera Roll)
          const fileUri = savedPath.startsWith('file://') ? savedPath : `file://${savedPath}`;
          await CameraRoll.save(fileUri, { type: 'photo' });
        } else {
          // Android: make it visible to gallery apps
          await RNBlobUtil.fs.scanFile([{ path: savedPath }]);
        }

        console.log('[ChatDetails] Image downloaded successfully');
        Alert.show({
          title: '다운로드 완료',
          message: '이미지가 저장되었습니다.',
        });
      } catch (error) {
        console.error('[ChatDetails] Failed to download image:', error);
        Alert.show({
          title: '다운로드 실패',
          message: '이미지 다운로드에 실패했습니다.',
        });
      }
    });
  }, []);

  // 이미지 프리뷰 닫기
  const handleCloseImagePreview = useCallback(() => {
    setImagePreviewVisible(false);
  }, []);

  // 이미지 프리뷰 인덱스 변경
  const handleChangeImagePreviewIndex = useCallback((nextIndex: number) => {
    setImagePreviewIndex(nextIndex);
  }, []);

  // iOS: 실제 파일 존재 기준으로 “다운로드됨” 상태를 한 번만 검증(유실 시만 false로 내림)
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    if (!didHydrateDownloadStatesRef.current) return;

    // roomId별로 1회만 실행
    const key = String(roomId);
    if (didVerifyDownloadStatesRef.current === key) return;
    didVerifyDownloadStatesRef.current = key;

    let cancelled = false;

    const verifyOnce = async () => {
      try {
        const entries = Object.entries(fileDownloadStates);
        if (entries.length === 0) return;

        const keysToDowngrade: string[] = [];
        for (const [k, st] of entries) {
          if (!st?.isDownloaded) continue;
          const ok = await verifyDownloaded(st.localPath);
          if (!ok) keysToDowngrade.push(k);
        }

        if (cancelled || keysToDowngrade.length === 0) return;

        setFileDownloadStates((prev) => {
          let changed = false;
          const next = { ...prev };
          for (const k of keysToDowngrade) {
            const prevSt = prev[k];
            if (!prevSt) continue;
            if (prevSt.isDownloaded) {
              next[k] = { ...prevSt, isDownloaded: false };
              changed = true;
            }
          }
          return changed ? next : prev;
        });
      } catch (e) {
        console.warn('[ChatDetails] verifyOnce failed:', e);
      }
    };

    // hydration 직후 한 번만
    verifyOnce();

    return () => {
      cancelled = true;
    };
  }, [roomId, fileDownloadStates]);

  return (
    <ChatDetailsView
      userType={userType}
      partnerNickname={partnerNickname}
      myUserId={userId}
      opponentProfileImageURI={profileImageURI}
      messages={messages}
      messageInput={messageInput}
      isModalVisible={isModalVisible}
      isBlocked={isBlocked}
      onChangeMessageInput={setMessageInput}
      onPressSend={handlePressSend}
      onPressBack={handlePressBack}
      recommendedMessages={recommdationMessages}
      onPressRecommendedMessage={handlePressRecommendedMessage}
      onCloseModal={handleCloseModal}
      onPressTool={handlePressTool}
      onPressBlock={handlePressBlock}
      onPressReport={handlePressReport}
      onPressAlbum={handlePressAlbum}
      onPressFile={handlePressFile}
      onLeaveChatRoom={handleLeaveChatRoom}
      onLoadMore={handleLoadMore}
      hasNextPage={!!hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fileDownloadStates={fileDownloadStates}
      onPressFileDownload={handlePressFileDownload}
      onPressImage={handlePressImage}
      onDownloadImage={handleDownloadImage}
      imagePreviewVisible={imagePreviewVisible}
      imagePreviewUrls={imagePreviewUrls}
      imagePreviewIndex={imagePreviewIndex}
      onChangeImagePreviewIndex={handleChangeImagePreviewIndex}
      onCloseImagePreview={handleCloseImagePreview}
      navigation={navigation}
      messageReadStates={messageReadStates}
    />
  );
}
