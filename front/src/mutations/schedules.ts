import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  updateWeeklySchedule,
  createPersonalSchedule,
  updatePersonalSchedule,
  deletePersonalSchedule,
  PersonalSchedule,
} from '@/api/schedules.ts';
import { schedulesQueryKeys } from '@/queries/keys.ts';
import { PhotographerScheduleItem } from '@/api/photographers.ts';

export const useUpdateWeeklyScheduleMutation = (photographerId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (schedules: PhotographerScheduleItem[]) =>
      updateWeeklySchedule(photographerId, { schedules }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: schedulesQueryKeys.weeklySchedule(photographerId),
      });
    },
  });
};

export const useCreatePersonalScheduleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: PersonalSchedule) => createPersonalSchedule(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulesQueryKeys.all });
    },
  });
};

export const useUpdatePersonalScheduleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: PersonalSchedule }) =>
      updatePersonalSchedule(id, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: schedulesQueryKeys.personalSchedule(variables.id) });
      queryClient.invalidateQueries({ queryKey: schedulesQueryKeys.all });
    },
  });
};

export const useDeletePersonalScheduleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deletePersonalSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulesQueryKeys.all });
    },
  });
};
