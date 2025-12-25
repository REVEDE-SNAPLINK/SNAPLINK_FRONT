import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patchNotificationRead, PatchNotificationReadParams } from '@/api/notifications';
import { notificationsQueryKeys } from '@/queries/keys';

export const usePatchNotificationReadMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (params: PatchNotificationReadParams) => patchNotificationRead(params),

    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: notificationsQueryKeys.list() }),
        qc.invalidateQueries({ queryKey: notificationsQueryKeys.unreadStatus() }),
      ]);
    },
  });
};