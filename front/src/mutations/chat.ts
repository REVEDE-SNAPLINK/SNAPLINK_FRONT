import { useMutation, useQueryClient } from '@tanstack/react-query';
import { blockChatUser, leaveChatRoom, unblockChatUser } from '@/api/chat.ts';
import { chatQueryKeys } from '@/queries/keys.ts';

export const useUnblockChatUserMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (targetId: string)=> unblockChatUser(targetId),
    onSuccess: async (_, targetId) => {
      await qc.invalidateQueries({ queryKey: chatQueryKeys.block(targetId) });
      await qc.invalidateQueries({ queryKey: chatQueryKeys.blockList() });
      await qc.invalidateQueries({ queryKey: chatQueryKeys.rooms() });
    }
  });
}

export const useBlockChatUserMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (targetId: string)=> blockChatUser(targetId),
    onSuccess: async (_, targetId) => {
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