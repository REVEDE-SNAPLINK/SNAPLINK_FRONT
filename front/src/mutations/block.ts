import { useMutation, useQueryClient } from '@tanstack/react-query';
import { blockUser, unblockUser } from '@/api/block';
import { blockKeys, chatQueryKeys } from '@/queries/keys';

export const useBlockUserMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (targetId: string) => blockUser(targetId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: blockKeys.list() });
    },
  });
};

export const useUnblockUserMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (targetId: string) => unblockUser(targetId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: blockKeys.list() });
    },
  });
};

interface BlockChatUserParams {
  targetId: string;
  roomId: number;
}

export const useBlockChatUserMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ targetId }: BlockChatUserParams) => blockUser(targetId),
    onSuccess: async (_, { roomId }) => {
      const blockedRooms = qc.getQueryData<Set<number>>(chatQueryKeys.blockedRooms()) || new Set();
      blockedRooms.add(roomId);
      qc.setQueryData(chatQueryKeys.blockedRooms(), new Set(blockedRooms));

      await qc.invalidateQueries({ queryKey: blockKeys.list() });
      await qc.invalidateQueries({ queryKey: chatQueryKeys.rooms() });
    },
  });
};

export const useUnblockChatUserMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ targetId }: BlockChatUserParams) => unblockUser(targetId),
    onSuccess: async (_, { roomId }) => {
      const blockedRooms = qc.getQueryData<Set<number>>(chatQueryKeys.blockedRooms()) || new Set();
      blockedRooms.delete(roomId);
      qc.setQueryData(chatQueryKeys.blockedRooms(), new Set(blockedRooms));

      await qc.invalidateQueries({ queryKey: blockKeys.list() });
      await qc.invalidateQueries({ queryKey: chatQueryKeys.rooms() });
    },
  });
};
