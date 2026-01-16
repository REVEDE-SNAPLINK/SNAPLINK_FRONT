import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveChatRoom } from '@/api/chat.ts';
import { chatQueryKeys } from '@/queries/keys.ts';

export const useLeaveChatRoomMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (roomId: number) => leaveChatRoom(roomId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: chatQueryKeys.rooms() });
    }
  })
}