import { useState, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import HolidayManageView from './HolidayManageView';
import { MainNavigationProp } from '@/types/navigation';
import { useHolidaysQuery } from '@/queries/photographers';
import {
  useCreateHolidayMutation,
  useUpdateHolidayMutation,
  useDeleteHolidayMutation,
} from '@/mutations/photographers';
import { GetHolidayResponse } from '@/api/photographers';
import { Alert } from '@/components/theme';
import { getPhotographerBookings } from '@/api/bookings';

// 연속된 휴가를 그룹화한 타입
export interface HolidayGroup {
  ids: number[];
  startDate: string;
  endDate: string;
  reason: string;
}

export default function HolidayManageContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const { data: holidays = [] } = useHolidaysQuery();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isActionModalVisible, setIsActionModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<HolidayGroup | null>(null);
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');

  const createMutation = useCreateHolidayMutation();
  const updateMutation = useUpdateHolidayMutation();
  const deleteMutation = useDeleteHolidayMutation();

  // 연속된 날짜의 휴가를 그룹화
  const groupedHolidays = useMemo(() => {
    if (!holidays || holidays.length === 0) return [];

    // reason별로 그룹화
    const groupsByReason: { [reason: string]: GetHolidayResponse[] } = {};
    holidays.forEach((holiday) => {
      if (!groupsByReason[holiday.reason]) {
        groupsByReason[holiday.reason] = [];
      }
      groupsByReason[holiday.reason].push(holiday);
    });

    const groups: HolidayGroup[] = [];

    // 각 reason별로 연속된 날짜 확인
    Object.entries(groupsByReason).forEach(([reason, items]) => {
      // 날짜순 정렬
      const sorted = items.sort((a, b) => a.holidayDate.localeCompare(b.holidayDate));

      let currentGroup: GetHolidayResponse[] = [sorted[0]];

      for (let i = 1; i < sorted.length; i++) {
        const prevDate = new Date(sorted[i - 1].holidayDate);
        const currDate = new Date(sorted[i].holidayDate);
        const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

        if (dayDiff === 1) {
          // 연속된 날짜
          currentGroup.push(sorted[i]);
        } else {
          // 연속되지 않음 - 현재 그룹 저장하고 새 그룹 시작
          groups.push({
            ids: currentGroup.map((h) => h.id),
            startDate: currentGroup[0].holidayDate,
            endDate: currentGroup[currentGroup.length - 1].holidayDate,
            reason,
          });
          currentGroup = [sorted[i]];
        }
      }

      // 마지막 그룹 저장
      if (currentGroup.length > 0) {
        groups.push({
          ids: currentGroup.map((h) => h.id),
          startDate: currentGroup[0].holidayDate,
          endDate: currentGroup[currentGroup.length - 1].holidayDate,
          reason,
        });
      }
    });

    return groups.sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [holidays]);

  const handlePressBack = () => {
    navigation.goBack();
  };

  const handlePressAdd = () => {
    setEditMode('create');
    setSelectedGroup(null);
    setIsModalVisible(true);
  };

  const handlePressMore = (group: HolidayGroup) => {
    setSelectedGroup(group);
    setIsActionModalVisible(true);
  };

  const handlePressEdit = () => {
    setIsActionModalVisible(false);
    setEditMode('edit');
    setIsModalVisible(true);
  };

  const handlePressDelete = () => {
    if (!selectedGroup) return;

    setIsActionModalVisible(false);

    Alert.show({
      title: '휴가 삭제',
      message: '휴가를 삭제하시겠습니까?\n해당 날짜의 예약이 다시 활성화됩니다.',
      buttons: [
        {
          text: '취소',
          type: 'cancel',
          onPress: () => {}
        },
        {
          text: '삭제',
          type: 'destructive',
          onPress: async () => {
            // 그룹의 모든 휴가 ID 삭제
            for (const id of selectedGroup.ids) {
              await deleteMutation.mutateAsync(id);
            }
            Alert.show({
              title: '삭제 완료',
              message: '휴가가 삭제되었습니다.',
            });
          },
        },
      ],
    });
  };

  const handleSubmitHoliday = async (startDate: string, endDate: string, reason: string) => {
    // 날짜 범위 생성
    const dates: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      dates.push(date.toISOString().split('T')[0]);
    }

    setIsModalVisible(false);

    // 휴가 기간 내 WAITING_FOR_APPROVAL 상태인 예약 수 조회
    let bookingCount = 0;
    try {
      // 큰 size로 예약 목록 조회 (페이징 없이 전체 조회)
      const bookingsResponse = await getPhotographerBookings({ page: 0, size: 1000 });

      // 날짜 범위 내에 있고 WAITING_FOR_APPROVAL 상태인 예약만 필터링
      const conflictingBookings = bookingsResponse.content.filter((booking) => {
        const bookingDate = booking.shootingDate;
        return (
          booking.status === 'WAITING_FOR_APPROVAL' &&
          bookingDate >= startDate &&
          bookingDate <= endDate
        );
      });

      bookingCount = conflictingBookings.length;
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      // 에러가 발생해도 휴가 등록은 진행 (bookingCount는 0으로 유지)
    }

    const confirmMessage =
      editMode === 'create'
        ? `${dates.length}일 동안의 휴가를 등록하시겠습니까?${
            bookingCount > 0
              ? `\n\n해당 기간에 ${bookingCount}건의 예약 요청이 자동 거부됩니다.`
              : ''
          }`
        : `휴가를 수정하시겠습니까?${
            bookingCount > 0
              ? `\n\n해당 기간에 ${bookingCount}건의 예약 요청이 자동 거부됩니다.`
              : ''
          }`;

    Alert.show({
      title: editMode === 'create' ? '휴가 등록' : '휴가 수정',
      message: confirmMessage,
      buttons: [
        {
          text: '취소',
          type: 'cancel',
          onPress: () => {}
        },
        {
          text: editMode === 'create' ? '등록' : '수정',
          onPress: async () => {
            try {
              if (editMode === 'create') {
                // 새 휴가 생성
                for (const date of dates) {
                  await createMutation.mutateAsync({
                    holidayDate: date,
                    reason,
                  });
                }
              } else if (editMode === 'edit' && selectedGroup) {
                // 기존 날짜와 새 날짜 비교
                const existingDates: string[] = [];
                const start = new Date(selectedGroup.startDate);
                const end = new Date(selectedGroup.endDate);
                for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
                  existingDates.push(date.toISOString().split('T')[0]);
                }

                // 삭제할 날짜 (기존에는 있었지만 새로운 범위에는 없는 날짜)
                const datesToDelete = existingDates.filter((date) => !dates.includes(date));
                // 추가할 날짜 (새로운 범위에는 있지만 기존에는 없던 날짜)
                const datesToAdd = dates.filter((date) => !existingDates.includes(date));

                // 삭제
                for (const date of datesToDelete) {
                  const holiday = holidays.find(
                    (h) => h.holidayDate === date && selectedGroup.ids.includes(h.id)
                  );
                  if (holiday) {
                    await deleteMutation.mutateAsync(holiday.id);
                  }
                }

                // 추가
                for (const date of datesToAdd) {
                  await createMutation.mutateAsync({
                    holidayDate: date,
                    reason,
                  });
                }

                // 기존 날짜 중 reason 업데이트
                const datesToUpdate = dates.filter((date) => existingDates.includes(date));
                for (const date of datesToUpdate) {
                  const holiday = holidays.find(
                    (h) => h.holidayDate === date && selectedGroup.ids.includes(h.id)
                  );
                  if (holiday && holiday.reason !== reason) {
                    await updateMutation.mutateAsync({
                      holidayId: holiday.id,
                      body: { holidayDate: date, reason },
                    });
                  }
                }
              }

              Alert.show({
                title: '완료',
                message:
                  editMode === 'create'
                    ? '휴가가 등록되었습니다.'
                    : '휴가가 수정되었습니다.',
              });
            } catch (error) {
              Alert.show({
                title: '오류',
                message:
                  editMode === 'create'
                    ? '휴가 등록에 실패했습니다.'
                    : '휴가 수정에 실패했습니다.',
              });
            }
          },
        },
      ],
    });
  };

  return (
    <HolidayManageView
      onPressBack={handlePressBack}
      onPressAdd={handlePressAdd}
      onPressMore={handlePressMore}
      holidays={groupedHolidays}
      isModalVisible={isModalVisible}
      onCloseModal={() => setIsModalVisible(false)}
      onSubmitHoliday={handleSubmitHoliday}
      isActionModalVisible={isActionModalVisible}
      onCloseActionModal={() => setIsActionModalVisible(false)}
      onPressEdit={handlePressEdit}
      onPressDelete={handlePressDelete}
      editMode={editMode}
      selectedGroup={selectedGroup}
    />
  );
}
