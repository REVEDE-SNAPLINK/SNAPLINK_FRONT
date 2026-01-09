import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createOrGetChatRoom,
  getChatMessages,
  getChatRooms,
  getChatRoom,
  getChatRoomDetail,
  uploadChatFile,
  type CreateOrGetRoomRequest,
  type GetChatMessagesParams,
  type UploadChatFileParams,
} from '@/api/chat';
import { chatQueryKeys } from '@/queries/keys';

/** 채팅방 목록 */
export const useChatRoomsQuery = () =>
  useQuery({
    queryKey: chatQueryKeys.rooms(),
    queryFn: () => getChatRooms(),
    staleTime: 1000 * 10,
    refetchInterval: 3000,
    refetchIntervalInBackground: true,
  });

/** 특정 채팅방 조회 (캐시 우선, 없으면 API 호출) */
export const useChatRoomQuery = (roomId: number | undefined) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: roomId ? chatQueryKeys.room(roomId) : [],
    queryFn: async () => {
      if (!roomId) throw new Error('roomId is required');

      // 먼저 rooms 캐시에서 찾기
      const roomsData = queryClient.getQueryData<Awaited<ReturnType<typeof getChatRooms>>>(
        chatQueryKeys.rooms()
      );
      const cachedRoom = roomsData?.find((r) => r.roomId === roomId);

      if (cachedRoom) {
        return cachedRoom;
      }

      // 캐시에 없으면 rooms API 호출하여 전체 목록 가져오기
      const rooms = await getChatRooms();
      // rooms 캐시에 저장
      queryClient.setQueryData(chatQueryKeys.rooms(), rooms);

      // 해당 roomId 찾기
      const room = rooms.find((r) => r.roomId === roomId);
      if (room) {
        return room;
      }

      // 전체 목록에도 없으면 개별 API 호출
      return getChatRoom(roomId);
    },
    enabled: typeof roomId === 'number',
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 3000,
    refetchIntervalInBackground: true,
  });
};

/** 특정 채팅방 상세 정보 조회 (닉네임, 프로필 이미지, 차단 상태) */
export const useChatRoomDetailQuery = (roomId: number | undefined) => {
  return useQuery({
    queryKey: roomId ? chatQueryKeys.roomDetail(roomId) : [],
    queryFn: () => {
      if (!roomId) throw new Error('roomId is required');
      return getChatRoomDetail(roomId);
    },
    enabled: typeof roomId === 'number',
    staleTime: 1000 * 30, // 30 seconds
  });
};

/**
 * 채팅방 메시지 기록 infinite
 * 서버 응답이 배열(ChatMessage[])이므로 nextPage 계산을 "length 기반"으로.
 */
export const useChatMessagesInfiniteQuery = (
  roomId: number | undefined,
  paramsWithoutPage: Omit<GetChatMessagesParams, 'page'> = { size: 20 },
) => {
  return useInfiniteQuery({
    queryKey: roomId ? chatQueryKeys.messagesInfinite(roomId, paramsWithoutPage) : [],
    enabled: typeof roomId === 'number',
    initialPageParam: 0,
    queryFn: ({ pageParam }) => getChatMessages(roomId!, { ...paramsWithoutPage, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      const size = paramsWithoutPage.size ?? 20;
      // lastPage가 size보다 작으면 더 이상 없음
      if (!lastPage || lastPage.length < size) return undefined;
      return allPages.length; // 0,1,2... 페이지 인덱스
    },
  });
};

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
export const useUploadChatFileMutation = () => {
  return useMutation({
    mutationFn: (params: UploadChatFileParams) => uploadChatFile(params),
  });
};


