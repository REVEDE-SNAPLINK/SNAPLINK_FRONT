import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation';
import ChatDetailsView, { FileDownloadState } from './ChatDetailsView';
import { useChatMessagesInfiniteQuery, useUploadChatFileMutation, useChatRoomQuery } from '@/queries/chat.ts';
import { ChatStompClient } from '@/ws/chatClient';
import { chatQueryKeys } from '@/queries/keys';
import { ChatMessage } from '@/api/chat';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { requestPermission } from '@/utils/permissions';
import { Alert } from '@/components/theme';
import { pick } from '@react-native-documents/picker';
import RNBlobUtil from 'react-native-blob-util';
import { Platform } from 'react-native';
import { CLOUDFRONT_BASE_URL } from '@/config/api.ts';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { useAuthStore } from '@/store/authStore.ts';
import analytics from '@react-native-firebase/analytics';


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

  const { roomId, opponentNickname: paramNickname, opponentProfileImageURI: paramProfileImageURI } = route.params;
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

  // Fetch chat room info (cache first, then API if needed)
  const { data: chatRoom } = useChatRoomQuery(roomId);

  // Fetch messages with infinite scroll
  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatMessagesInfiniteQuery(roomId, { size: 50 });

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

  // Extract partner info from params first, then fall back to chatRoom data
  const partnerNickname = paramNickname || chatRoom?.opponentNickname || '';
  const profileImageURI = paramProfileImageURI || chatRoom?.profileImageURI || '';
  const opponentId = chatRoom?.opponentId || '';

  // Upload file mutation
  const uploadFileMutation = useUploadChatFileMutation();

  useEffect(() => {
    const logChatEntered = async () => {
      await analytics().logEvent('activation_chat_entered', {
        room_id: roomId,
        platform: Platform.OS,
        user_id: userId || 'anonymous',
        user_type: userType || 'guest',
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
    Alert.show({
      title: '사용자 차단',
      message: '해당 사용자를 차단하시겠습니까?',
      buttons: [
        { text: '취소', onPress: () => {}, type: 'cancel' },
        { text: '차단', onPress: () => {
          Alert.show({
            title: '차단 완료',
            message: '해당 사용자가 차단되었습니다.',
            buttons: [
              { text: '확인', onPress: () => navigation.goBack()}
            ]
          })
          }, type: 'destructive' },
      ]
    })
  }

  const handlePressReport = () => {
    Alert.show({
      title: '사용자 신고',
      message: '해당 사용자를 신고하시겠습니까?\n모든 과정은 익명으로 처리됩니다.',
      buttons: [
        { text: '취소', onPress: () => {}, type: 'cancel' },
        { text: '신고', onPress: () => {
            Alert.show({
              title: '신고 완료가 완료되었습니다.',
              message: '보내주신 소중한 의견으로 신고가 접수되었습니다.',
              buttons: [
                { text: '확인', onPress: () => navigation.goBack()}
              ]
            })
          }, type: 'destructive' },
      ]
    })
  }

  // 파일 메타데이터 가져오기 (HEAD 요청)
  const fetchFileMetadata =  useCallback(async (fileUrl: string) => {
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
      partnerNickname={partnerNickname}
      opponentId={opponentId}
      opponentProfileImageURI={profileImageURI}
      messages={messages}
      messageInput={messageInput}
      isModalVisible={isModalVisible}
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
    />
  );
}
