import { useCallback, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import ScheduleFormView, { ScheduleFormData } from './ScheduleFormView';
import { Alert } from '@/components/ui';
import { useAuthStore } from '@/store/authStore.ts';
import { useWeeklyScheduleQuery } from '@/queries/schedules.ts';
import { useUpdateWeeklyScheduleMutation } from '@/mutations/schedules.ts';
import { DayOfWeek, PhotographerScheduleItem } from '@/api/photographers.ts';
import { GetWeeklyScheduleRespnose } from '@/api/schedules.ts';
import { MainNavigationProp } from '@/types/navigation.ts';
import { showErrorAlert } from '@/utils/error';

const DAY_OF_WEEK_MAP: Record<DayOfWeek, string> = {
  MONDAY: '월요일',
  TUESDAY: '화요일',
  WEDNESDAY: '수요일',
  THURSDAY: '목요일',
  FRIDAY: '금요일',
  SATURDAY: '토요일',
  SUNDAY: '일요일',
};

const DAY_OF_WEEK_REVERSE_MAP: Record<string, DayOfWeek> = {
  '월요일': 'MONDAY',
  '화요일': 'TUESDAY',
  '수요일': 'WEDNESDAY',
  '목요일': 'THURSDAY',
  '금요일': 'FRIDAY',
  '토요일': 'SATURDAY',
  '일요일': 'SUNDAY',
};

// Convert API response to form data
const convertToFormData = (schedules: GetWeeklyScheduleRespnose[]): ScheduleFormData => {
  const availableDays: string[] = [];
  const daySchedules: { [day: string]: { startTime: Date | null; endTime: Date | null } } = {};

  schedules.forEach((schedule) => {
    const dayName = DAY_OF_WEEK_MAP[schedule.dayOfWeek];
    availableDays.push(dayName);

    // Parse time string (HH:mm) to Date
    const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
    const [endHour, endMinute] = schedule.endTime.split(':').map(Number);

    const startTime = new Date();
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date();
    endTime.setHours(endHour, endMinute, 0, 0);

    daySchedules[dayName] = { startTime, endTime };
  });

  return { availableDays, daySchedules };
};

// Convert form data to API request
const convertToApiRequest = (formData: ScheduleFormData): PhotographerScheduleItem[] => {
  const selectedWeekdays = formData.availableDays.filter((day) => day !== '공휴일');

  return selectedWeekdays.map((day) => {
    const schedule = formData.daySchedules[day];
    const dayOfWeek = DAY_OF_WEEK_REVERSE_MAP[day];

    const startTime = schedule.startTime
      ? `${String(schedule.startTime.getHours()).padStart(2, '0')}:${String(schedule.startTime.getMinutes()).padStart(2, '0')}`
      : '00:00';

    const endTime = schedule.endTime
      ? `${String(schedule.endTime.getHours()).padStart(2, '0')}:${String(schedule.endTime.getMinutes()).padStart(2, '0')}`
      : '00:00';

    return { dayOfWeek, startTime, endTime };
  });
};

export default function ScheduleFormContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const userId = useAuthStore((state) => state.userId);

  // Fetch weekly schedule
  const { data: weeklyScheduleData, isLoading } = useWeeklyScheduleQuery(userId || '', !!userId);
  const updateWeeklyScheduleMutation = useUpdateWeeklyScheduleMutation(userId || '');

  const { control, handleSubmit, watch, reset } = useForm<ScheduleFormData>({
    defaultValues: {
      availableDays: [],
      daySchedules: {},
    },
    mode: 'onChange',
  });

  // Initialize form with fetched data
  useEffect(() => {
    if (weeklyScheduleData && weeklyScheduleData.length > 0) {
      const formData = convertToFormData(weeklyScheduleData);
      reset(formData);
    }
  }, [weeklyScheduleData, reset]);

  const watchedAvailableDays = watch('availableDays');
  const watchedDaySchedules = watch('daySchedules');

  const isValid = useMemo(() => {
    if (watchedAvailableDays.length < 1) return false;

    const selectedWeekdays = watchedAvailableDays.filter((day) => day !== '공휴일');

    // 공휴일만 선택한 경우 OK
    if (selectedWeekdays.length === 0 && watchedAvailableDays.includes('공휴일')) {
      return true;
    }

    // 선택된 요일(공휴일 제외)은 모두 start/end 있어야 OK
    return selectedWeekdays.every((day) => {
      const schedule = watchedDaySchedules?.[day];
      return schedule && schedule.startTime !== null && schedule.endTime !== null;
    });
  }, [watchedAvailableDays, watchedDaySchedules]);

  const onPressBack = () => navigation.goBack();

  const onSubmit = useCallback(
    async (data: ScheduleFormData) => {
      const apiRequest = convertToApiRequest(data);

      updateWeeklyScheduleMutation.mutate(apiRequest, {
        onSuccess: () => {
          Alert.show({
            title: '저장 완료',
            message: '촬영 가능 일정이 저장되었습니다.',
            buttons: [
              {
                text: '확인',
                onPress: () => navigation.goBack(),
              },
            ],
          });
        },
        onError: (error) => {
          showErrorAlert({
            title: '저장 실패',
            action: '촬영 가능 일정 저장',
            error,
          });
        },
      });
    },
    [navigation, updateWeeklyScheduleMutation]
  );

  const onPressSubmit = useCallback(() => {
    if (!isValid) return;
    handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit, isValid]);

  return (
    <ScheduleFormView
      control={control}
      onPressBack={onPressBack}
      onPressSubmit={onPressSubmit}
      isSubmitDisabled={!isValid || isLoading || updateWeeklyScheduleMutation.isPending}
      submitButtonText="저장하기"
      navigation={navigation}
    />
  );
}