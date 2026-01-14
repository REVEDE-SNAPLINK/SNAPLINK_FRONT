import { useMutation, useQueryClient } from '@tanstack/react-query';
import { blockChatUser, leaveChatRoom, unblockChatUser } from '@/api/chat.ts';
import { chatQueryKeys } from '@/queries/keys.ts';

interface BlockChatUserParams {
  targetId: string;
  roomId: number;
}

interface UnblockChatUserParams {
  targetId: string;
  roomId: number;
}

export const useUnblockChatUserMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ targetId }: UnblockChatUserParams) => unblockChatUser(targetId),
    onSuccess: async (_, { targetId, roomId }) => {
      // Remove from blocked rooms list
      const blockedRooms = qc.getQueryData<Set<number>>(chatQueryKeys.blockedRooms()) || new Set();
      blockedRooms.delete(roomId);
      qc.setQueryData(chatQueryKeys.blockedRooms(), new Set(blockedRooms));

      await qc.invalidateQueries({ queryKey: chatQueryKeys.block(targetId) });
      await qc.invalidateQueries({ queryKey: chatQueryKeys.blockList() });
      await qc.invalidateQueries({ queryKey: chatQueryKeys.rooms() });
    }
  });
}

export const useBlockChatUserMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ targetId }: BlockChatUserParams) => blockChatUser(targetId),
    onSuccess: async (_, { targetId, roomId }) => {
      // Add to blocked rooms list
      const blockedRooms = qc.getQueryData<Set<number>>(chatQueryKeys.blockedRooms()) || new Set();
      blockedRooms.add(roomId);
      qc.setQueryData(chatQueryKeys.blockedRooms(), new Set(blockedRooms));

      await qc.invalidateQueries({ queryKey: chatQueryKeys.block(targetId) });
      await qc.invalidateQueries({ queryKey: chatQueryKeys.blockList() });
      await qc.invalidateQueries({ queryKey: chatQueryKeys.rooms() });
    }
  })
}

export const useLeaveChatRoomMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (roomId: number) => leaveChatRoom(roomId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: chatQueryKeys.rooms() });
    }
  })
}