import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createHolidays,
  updateHolidays,
  deleteHoliday,
  CreateHolidayRequest,
  UpdateHolidayParam,
} from '@/api/photographers.ts';
import { photographersQueryKeys, schedulesQueryKeys } from '@/queries/keys.ts';

export const useCreateHolidayMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateHolidayRequest) => createHolidays(body),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: photographersQueryKeys.holidays() }),
        // 휴무일 추가 시 스케줄도 영향을 받을 수 있으므로 invalidate
        qc.invalidateQueries({ queryKey: schedulesQueryKeys.all }),
      ]);
    },
  });
};

export const useUpdateHolidayMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ param, body }: { param: UpdateHolidayParam; body: CreateHolidayRequest }) =>
      updateHolidays(param, body),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: photographersQueryKeys.holidays() }),
        qc.invalidateQueries({ queryKey: schedulesQueryKeys.all }),
      ]);
    },
  });
};

export const useDeleteHolidayMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (holidayId: number) => deleteHoliday(holidayId),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: photographersQueryKeys.holidays() }),
        qc.invalidateQueries({ queryKey: schedulesQueryKeys.all }),
      ]);
    },
  });
};
