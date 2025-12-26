import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createOrGetChatRoom,
  getChatMessages,
  getChatRooms,
  uploadChatFile,
  type CreateOrGetRoomRequest,
  type GetChatMessagesParams,
  type UploadChatFileParams,
} from '@/api/chat';
import { chatQueryKeys } from '@/queries/keys';
import { withMockData, withMockMutation, getMockChatRooms } from '@/__dev__';

/** 채팅방 목록 */
export const useChatRoomsQuery = () =>
  useQuery({
    queryKey: chatQueryKeys.rooms(),
    queryFn: () => withMockData(
      () => getMockChatRooms(),
      () => getChatRooms(),
    ),
    staleTime: 1000 * 10,
  });

/**
 * 채팅방 메시지 기록 infinite
 * 서버 응답이 배열(ChatMessage[])이므로 nextPage 계산을 "length 기반"으로.
 */
export const useChatMessagesInfiniteQuery = (
  roomId: number | undefined,
  paramsWithoutPage: Omit<GetChatMessagesParams, 'page'> = { size: 20 },
) => {
  const { getMockChatMessages } = require('@/__dev__');

  return useInfiniteQuery({
    queryKey: roomId ? chatQueryKeys.messagesInfinite(roomId, paramsWithoutPage) : [],
    enabled: typeof roomId === 'number',
    initialPageParam: 0,
    queryFn: ({ pageParam }) => withMockData(
      () => getMockChatMessages(roomId!, pageParam, paramsWithoutPage.size || 20),
      () => getChatMessages(roomId!, { ...paramsWithoutPage, page: pageParam }),
    ),
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
  const { createOrGetMockChatRoom } = require('@/__dev__');

  return useMutation({
    mutationFn: (body: CreateOrGetRoomRequest) => withMockMutation(
      () => createOrGetMockChatRoom(body.receiverId),
      () => createOrGetChatRoom(body),
    ),
    onSuccess: async () => {
      // 방이 생기거나 lastMessage/unreadCount 변화 가능
      await qc.invalidateQueries({ queryKey: chatQueryKeys.rooms() });
    },
  });
};

/** 채팅 파일 업로드 -> url 반환 */
export const useUploadChatFileMutation = () => {
  const { uploadMockChatFile } = require('@/__dev__');

  return useMutation({
    mutationFn: (params: UploadChatFileParams) => withMockMutation(
      () => uploadMockChatFile(params.roomId),
      () => uploadChatFile(params),
    ),
  });
};
