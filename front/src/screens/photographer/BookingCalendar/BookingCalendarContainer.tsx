import { useState, useEffect, useRef, useMemo } from 'react';
import analytics from '@react-native-firebase/analytics';
import BookingCalendarView from '@/screens/photographer/BookingCalendar/BookingCalendarView.tsx';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation.ts';
import { useAuthStore } from '@/store/authStore.ts';
import { useModalStore, PersonalSchedule as UIPersonalSchedule } from '@/store/modalStore.ts';
import { usePhotographerMonthSchedulesQuery, usePhotographerDayDetailQuery } from '@/queries/schedules.ts';
import { useDeletePersonalScheduleMutation } from '@/mutations/schedules.ts';
import { getPhotographerDayDetail } from '@/api/schedules';

// 이번 달이 몇 주인지 계산
const getWeekCountOfMonth = (year: number, month: number) => {
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=일, 1=월 ...
  const lastDate = new Date(year, month, 0).getDate();    // 이번 달 마지막 날짜
  return Math.ceil((firstDay + lastDate) / 7);
};

export default function BookingCalendarContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<any>();
  const handledDeepLinkRef = useRef(false);
  const userId = useAuthStore((state) => state.userId);
  const {
    openAddScheduleModal,
    closeAddScheduleModal,
    openScheduleDetailModal,
    closeScheduleDetailModal,
  } = useModalStore();

  // Mutations
  const deletePersonalSchedule = useDeletePersonalScheduleMutation();

  // Current date and selected date state
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Deep link date mapping effect
  useEffect(() => {
    if (handledDeepLinkRef.current) return;

    const dateParam = route.params?.date;
    if (!dateParam) return;

    const parsedDate = new Date(dateParam);
    if (isNaN(parsedDate.getTime())) return;

    handledDeepLinkRef.current = true;
    setSelectedDate(parsedDate.toISOString().split('T')[0]);
  }, [route.params?.date]);

  // Current year-month state for data fetching
  const [currentYearMonth, setCurrentYearMonth] = useState<string>(() => {
    const parts = (selectedDate === '' ? new Date().toISOString().split('T')[0] : selectedDate).split('-');
    return `${parts[0]}-${parts[1]}`;
  });

  const [currentWeekCount, setCurrentWeekCount] = useState<number>(() => {
    const [y, m] = currentYearMonth.split('-').map(Number);
    return getWeekCountOfMonth(y, m);
  });


  // Extract year and month from currentYearMonth
  const [year, month] = useMemo(() => {
    const parts = currentYearMonth.split('-');
    return [parseInt(parts[0]), parseInt(parts[1])];
  }, [currentYearMonth]);

  // Calculate prev and next month
  const { prevYear, prevMonth, nextYear, nextMonth } = useMemo(() => {
    const prev = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
    const next = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
    return {
      prevYear: prev.year,
      prevMonth: prev.month,
      nextYear: next.year,
      nextMonth: next.month,
    };
  }, [year, month]);

  // Fetch monthly schedules for prev, current, and next month
  const { data: prevMonthScheduleData } = usePhotographerMonthSchedulesQuery(
    { photographerId: userId || '', year: prevYear, month: prevMonth },
    !!userId
  );

  const { data: monthScheduleData } = usePhotographerMonthSchedulesQuery(
    { photographerId: userId || '', year, month },
    !!userId
  );

  const { data: nextMonthScheduleData } = usePhotographerMonthSchedulesQuery(
    { photographerId: userId || '', year: nextYear, month: nextMonth },
    !!userId
  );

  // Fetch day detail for selected date
  const { data: dayDetailData } = usePhotographerDayDetailQuery(
    { photographerId: userId || '', date: selectedDate },
    !!userId && !!selectedDate
  );

  // Enhanced schedule data from API (prev, current, next month)
  const enhancedScheduleData = useMemo(() => {
    const schedulesByDate = new Map<string, {
      hasBooking: boolean;
      publicHoliday: boolean;
      photographerHoliday: boolean;
      hasPersonalSchedule: boolean;
    }>();

    // Helper to add month data to map
    const addMonthData = (data: typeof monthScheduleData, targetYear: number, targetMonth: number) => {
      if (!data || !Array.isArray(data)) return;
      data.forEach(item => {
        const dateString = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(item.day).padStart(2, '0')}`;

        // Parse status to determine the type of schedule
        // status: NONE, HOLIDAY, BOOKING, PERSONAL
        const status = item.status;

        // 1. BOOKING이면 무조건 hasBooking = true
        if (status === 'BOOKING') {
          schedulesByDate.set(dateString, {
            hasBooking: true,
            publicHoliday: false,
            photographerHoliday: false,
            hasPersonalSchedule: false,
          });
          return;
        }

        // 2. PERSONAL이면 hasPersonalSchedule = true
        if (status === 'PERSONAL') {
          schedulesByDate.set(dateString, {
            hasBooking: false,
            publicHoliday: false,
            photographerHoliday: false,
            hasPersonalSchedule: true,
          });
          return;
        }

        // 3. HOLIDAY인 경우 photographerHoliday = true
        if (status === 'HOLIDAY') {
          schedulesByDate.set(dateString, {
            hasBooking: false,
            publicHoliday: false,
            photographerHoliday: true,
            hasPersonalSchedule: false,
          });
          return;
        }

        // 4. NONE이거나 기타 경우
        schedulesByDate.set(dateString, {
          hasBooking: false,
          publicHoliday: false,
          photographerHoliday: false,
          hasPersonalSchedule: false,
        });
      });
    };

    // Add prev, current, and next month data
    addMonthData(prevMonthScheduleData, prevYear, prevMonth);
    addMonthData(monthScheduleData, year, month);
    addMonthData(nextMonthScheduleData, nextYear, nextMonth);

    // Convert map to array
    return Array.from(schedulesByDate.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));
  }, [prevMonthScheduleData, monthScheduleData, nextMonthScheduleData, prevYear, prevMonth, year, month, nextYear, nextMonth]);

  useEffect(() => {
    const [y, m] = currentYearMonth.split('-').map(Number);
    const newWeekCount = getWeekCountOfMonth(y, m);
    setCurrentWeekCount(newWeekCount);
  }, [currentYearMonth]);


  const handlePressBookingItem = (bookingId: number) => {
    analytics().logEvent('photographer_booking_detail_view', {
      user_id: userId ?? '',
      user_type: 'photographer',
      bookingId,
    });
    navigation.navigate('BookingDetails', { bookingId });
  };

  const handlePressPersonalSchedule = (id: number) => {
    const schedule = dayDetailData?.personalSchedules.find((s) => s.id === id);
    if (schedule) {
      // Convert API PersonalSchedule to UI PersonalSchedule
      // Check if it's all day (00:00:00 ~ 23:59:59)
      const isAllDay = schedule.startTime === '00:00:00' && schedule.endTime === '23:59:59';

      const uiSchedule: UIPersonalSchedule = {
        id: String(schedule.id),
        title: schedule.title,
        startDate: new Date(`${selectedDate}T${schedule.startTime}`),
        endDate: new Date(`${selectedDate}T${schedule.endTime}`),
        isAllDay,
        description: schedule.description,
        scheduleType: 'personal',
      };
      openScheduleDetailModal(
        uiSchedule,
        handleEditSchedule,
        handleDeleteSchedule,
        handleDuplicateSchedule
      );
    }
  };

  const handlePressHoliday = async () => {
    if (!dayDetailData || dayDetailData.holidayId === null || !userId) return;

    // 휴가 기간 찾기
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const baseDate = new Date(selectedDate);
    let startDate = new Date(baseDate);
    let endDate = new Date(baseDate);

    // 시작 날짜 찾기 (이전으로 거슬러 올라가기)
    let currentDate = new Date(baseDate);
    currentDate.setDate(currentDate.getDate() - 1);

    while (true) {
      try {
        const dayDetail = await getPhotographerDayDetail({
          photographerId: userId,
          date: formatDate(currentDate),
        });

        if (dayDetail.holidayId !== null) {
          startDate = new Date(currentDate);
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      } catch (error) {
        break;
      }
    }

    // 종료 날짜 찾기 (다음으로 내려가기)
    currentDate = new Date(baseDate);
    currentDate.setDate(currentDate.getDate() + 1);

    while (true) {
      try {
        const dayDetail = await getPhotographerDayDetail({
          photographerId: userId,
          date: formatDate(currentDate),
        });

        if (dayDetail.holidayId !== null) {
          endDate = new Date(currentDate);
          currentDate.setDate(currentDate.getDate() + 1);
        } else {
          break;
        }
      } catch (error) {
        break;
      }
    }

    // 휴가 정보를 PersonalSchedule 형태로 변환
    const holidaySchedule: UIPersonalSchedule = {
      id: String(dayDetailData.holidayId),
      title: '휴가',
      startDate,
      endDate,
      isAllDay: true,
      scheduleType: 'holiday',
      holidayId: dayDetailData.holidayId,
    };

    openScheduleDetailModal(
      holidaySchedule,
      handleEditSchedule,
      handleDeleteSchedule,
      handleDuplicateSchedule
    );
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    // Update currentYearMonth to match the selected date's year-month
    const ym = date.slice(0, 7);
    setCurrentYearMonth(ym);
  };

  const handleMonthChange = (yearMonth: string) => {
    setCurrentYearMonth(yearMonth);

    const [y, m] = yearMonth.split('-').map(Number);
    const newWeekCount = getWeekCountOfMonth(y, m);
    setCurrentWeekCount(newWeekCount); // state 업데이트
  };

  const handleAddSchedule = () => {
    openAddScheduleModal(handleSubmitSchedule, undefined, false, new Date(selectedDate));
  };

  const handleSubmitSchedule = async (schedule: Omit<UIPersonalSchedule, 'id'>) => {
    // AddScheduleModal already handles mutation, just log analytics
    closeAddScheduleModal();
    analytics().logEvent('personal_schedule_created', {
      user_id: userId ?? '',
      user_type: 'photographer',
      start_date: schedule.startDate.toISOString().split('T')[0],
      end_date: schedule.endDate.toISOString().split('T')[0],
      title: schedule.title,
    });
  };

  const handleEditSchedule = (schedule: UIPersonalSchedule) => {
    closeScheduleDetailModal();
    // 수정 모드로 AddScheduleModal 열기
    openAddScheduleModal(async (updatedSchedule) => {
      // AddScheduleModal already handles mutation, just log analytics
      closeAddScheduleModal();
      analytics().logEvent('personal_schedule_updated', {
        user_id: userId ?? '',
        user_type: 'photographer',
        schedule_id: schedule.id,
        start_date: updatedSchedule.startDate.toISOString().split('T')[0],
        end_date: updatedSchedule.endDate.toISOString().split('T')[0],
        title: updatedSchedule.title,
      });
    }, schedule, false); // isDuplicate = false (수정 모드)
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      await deletePersonalSchedule.mutateAsync(Number(scheduleId));
      closeScheduleDetailModal();
      analytics().logEvent('personal_schedule_deleted', {
        user_id: userId ?? '',
        user_type: 'photographer',
        schedule_id: scheduleId,
      });
    } catch (error) {
      console.error('Failed to delete personal schedule:', error);
    }
  };

  const handleDuplicateSchedule = (schedule: UIPersonalSchedule) => {
    closeScheduleDetailModal();
    // 복사 모드로 AddScheduleModal 열기
    openAddScheduleModal(async (duplicatedSchedule) => {
      // AddScheduleModal already handles mutation, just log analytics
      closeAddScheduleModal();
      analytics().logEvent('personal_schedule_duplicated', {
        user_id: userId ?? '',
        user_type: 'photographer',
        original_schedule_id: schedule.id,
        start_date: duplicatedSchedule.startDate.toISOString().split('T')[0],
        end_date: duplicatedSchedule.endDate.toISOString().split('T')[0],
        title: duplicatedSchedule.title,
      });
    }, schedule, true); // isDuplicate = true
  };

  // Calculate D-day from today to selected date
  const dDayText = useMemo(() => {
    const selected = new Date(selectedDate);
    const current = new Date();
    const diffTime = selected.getTime() - current.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '내일';
    if (diffDays === -1) return '어제';
    if (diffDays > 0) return `D+${diffDays}`;
    return `D-${Math.abs(diffDays)}`;
  }, [selectedDate]);

  return (
    <BookingCalendarView
      selectedDate={selectedDate}
      scheduleData={enhancedScheduleData}
      currentYearMonth={currentYearMonth}
      weekCount={currentWeekCount}
      dayDetailData={dayDetailData || null}
      dDayText={dDayText}
      onPressBookingItem={handlePressBookingItem}
      onPressPersonalSchedule={handlePressPersonalSchedule}
      onPressHoliday={handlePressHoliday}
      onSelectDate={handleSelectDate}
      onPressAddSchedule={handleAddSchedule}
      onMonthChange={handleMonthChange}
    />
  );
}
