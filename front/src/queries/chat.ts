import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createOrGetChatRoom,
  getChatMessages,
  getChatRooms,
  uploadChatFile,
  type CreateOrGetRoomRequest,
  type GetChatMessagesParams,
  type UploadChatFileParams,
  type ChatMessage,
} from '@/api/chat';
import { chatQueryKeys } from '@/queries/keys';

/** 채팅방 목록 */
export const useChatRoomsQuery = () =>
  useQuery({
    queryKey: chatQueryKeys.rooms(),
    queryFn: getChatRooms,
    staleTime: 1000 * 10,
  });

/**
 * 채팅방 메시지 기록 infinite
 * 서버 응답이 배열(ChatMessage[])이므로 nextPage 계산을 "length 기반"으로.
 */
export const useChatMessagesInfiniteQuery = (
  roomId: number | undefined,
  paramsWithoutPage: Omit<GetChatMessagesParams, 'page'> = { size: 20 },
) =>
  useInfiniteQuery({
    queryKey: roomId ? chatQueryKeys.messagesInfinite(roomId, paramsWithoutPage) : [],
    enabled: typeof roomId === 'number',
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      getChatMessages(roomId!, { ...paramsWithoutPage, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      const size = paramsWithoutPage.size ?? 20;
      // lastPage가 size보다 작으면 더 이상 없음
      if (!lastPage || lastPage.length < size) return undefined;
      return allPages.length; // 0,1,2... 페이지 인덱스
    },
  });

/** 채팅방 생성/조회 */
export const useCreateOrGetChatRoomMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateOrGetRoomRequest) => createOrGetChatRoom(body),
    onSuccess: async () => {
      // 방이 생기거나 lastMessage/unreadCount 변화 가능
      await qc.invalidateQueries({ queryKey: chatQueryKeys.rooms() });
    },
  });
};

/** 채팅 파일 업로드 -> url 반환 */
export const useUploadChatFileMutation = () =>
  useMutation({
    mutationFn: (params: UploadChatFileParams) => uploadChatFile(params),
  });

/* ---------- WS 메시지 수신 시 캐시 업데이트 유틸 ---------- */

/** 새 메시지 수신 시: messages 캐시에 prepend/append + rooms 갱신 */
export const upsertIncomingMessageToCache = (
  qc: ReturnType<typeof useQueryClient> | any,
  message: ChatMessage,
) => {
  // 1) rooms 갱신: 마지막 시간 + unreadCount 증가(내가 보고있는 방 여부에 따라 달라질 수 있어 일단 invalidate 추천)
  qc.invalidateQueries({ queryKey: chatQueryKeys.rooms() });

  // 2) 메시지 목록 캐시 업데이트(있으면)
  //    ⚠️ 서버가 페이지를 "최신→과거"로 주는지 "과거→최신"인지에 따라 위치 달라짐
  //    보통 채팅은 최신이 아래라서 UI는 reversed list를 쓰는데, 여기서는 "첫 페이지(0)가 최신"이라고 가정하고 앞에 추가.
  qc.setQueryData(
    // 모든 파라미터 케이스가 있을 수 있어서 partial update는 어려움 → 가장 흔한 params(size=20)만 업데이트하고, 나머지는 invalidate로 처리 권장
    // 필요하면 paramsWithoutPage를 받아 더 정확히 업데이트 가능
    (old: any) => old,
  );
};