import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useQueries } from '@tanstack/react-query';
import { MainNavigationProp } from '@/types/navigation.ts';
import ShootingManageView from '@/screens/photographer/ShootingManage/ShootingManageView.tsx';
import { useMyShootingsQuery } from '@/queries/shootings.ts';
import { useWeeklyScheduleQuery } from '@/queries/schedules.ts';
import { useDeleteShootingMutation } from '@/mutations/shootings.ts';
import { shootingsQueryKeys } from '@/queries/keys.ts';
import { getShootingOptions } from '@/api/shootings.ts';
import { Alert } from '@/components/theme';
import { useAuthStore } from '@/store/authStore.ts';
import { DayOfWeek } from '@/api/photographers.ts';

const DAY_OF_WEEK_MAP: Record<DayOfWeek, string> = {
  MONDAY: '월요일',
  TUESDAY: '화요일',
  WEDNESDAY: '수요일',
  THURSDAY: '목요일',
  FRIDAY: '금요일',
  SATURDAY: '토요일',
  SUNDAY: '일요일',
};

export default function ShootingManageContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const userId = useAuthStore((state) => state.userId);

  // Fetch weekly schedule
  const { data: weeklyScheduleData } = useWeeklyScheduleQuery(userId || '', !!userId);

  // Convert weekly schedule to days string
  const days = useMemo(() => {
    if (!weeklyScheduleData || weeklyScheduleData.length === 0) {
      return '설정된 일정 없음';
    }
    return weeklyScheduleData
      .map((schedule) => DAY_OF_WEEK_MAP[schedule.dayOfWeek])
      .join(', ');
  }, [weeklyScheduleData]);

  // Fetch shooting list
  const { data: shootings = [] } = useMyShootingsQuery();

  // Fetch options for each shooting
  const optionsQueries = useQueries({
    queries: shootings.map((shooting) => ({
      queryKey: shootingsQueryKeys.options(shooting.id),
      queryFn: () => getShootingOptions(shooting.id),
      enabled: !!shooting.id,
    })),
  });

  // Combine shootings with their options
  const shootingsWithOptions = useMemo(() => {
    return shootings.map((shooting, index) => ({
      ...shooting,
      optionalOptions: optionsQueries[index]?.data || [],
    }));
  }, [shootings, optionsQueries]);

  const deleteShootingMutation = useDeleteShootingMutation();

  const handlePressBack = () => navigation.goBack();

  const handlePressCreateProduct = () => {
    navigation.navigate('ServiceForm', {});
  };

  const handlePressEditProduct = (productId: number) => {
    navigation.navigate('ServiceForm', { productId });
  };

  const handlePressDeleteProduct = (productId: number) => {
    Alert.show({
      title: '촬영 서비스를 삭제하시겠습니까?',
      message: '삭제된 서비스는 복구할 수 없습니다.',
      buttons: [
        {
          text: '취소',
          type: 'cancel',
          onPress: () => {},
        },
        {
          text: '삭제',
          type: 'destructive',
          onPress: () => {
            deleteShootingMutation.mutate(productId, {
              onSuccess: () => {
                Alert.show({
                  title: '삭제 완료',
                  message: '촬영 서비스가 삭제되었습니다.',
                  buttons: [{ text: '확인', onPress: () => {} }],
                });
              },
              onError: () => {
                Alert.show({
                  title: '삭제 실패',
                  message: '촬영 서비스 삭제에 실패했습니다.',
                  buttons: [{ text: '확인', onPress: () => {} }],
                });
              },
            });
          },
        },
      ],
    });
  };

  const handlePressEditSchedule = () => {
    navigation.navigate('ScheduleForm');
  };

  return (
    <ShootingManageView
      onPressBack={handlePressBack}
      onPressCreateProduct={handlePressCreateProduct}
      onPressEditProduct={handlePressEditProduct}
      onPressDeleteProduct={handlePressDeleteProduct}
      onPressEditSchedule={handlePressEditSchedule}
      shootings={shootingsWithOptions}
      days={days}
      navigation={navigation}
    />
  );
}