import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import analytics from '@react-native-firebase/analytics';
import BookingCalendarView from '@/screens/photographer/BookingCalendar/BookingCalendarView.tsx';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation.ts';
import { useAuthStore } from '@/store/authStore.ts';
import { useModalStore, PersonalSchedule as UIPersonalSchedule } from '@/store/modalStore.ts';
import { usePhotographerMonthSchedulesQuery, usePhotographerDayDetailQuery } from '@/queries/schedules.ts';
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
  } = useModalStore();

  // Current date and selected date state
  const [selectedDate, setSelectedDate] = useState<string>('');

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

  // Calculate prev, prevPrev, next, nextNext month for pre-fetching
  const { prevPrevYear, prevPrevMonth, prevYear, prevMonth, nextYear, nextMonth, nextNextYear, nextNextMonth } = useMemo(() => {
    const prev = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
    const prevPrev = prev.month === 1 ? { year: prev.year - 1, month: 12 } : { year: prev.year, month: prev.month - 1 };
    const next = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
    const nextNext = next.month === 12 ? { year: next.year + 1, month: 1 } : { year: next.year, month: next.month + 1 };
    return {
      prevPrevYear: prevPrev.year,
      prevPrevMonth: prevPrev.month,
      prevYear: prev.year,
      prevMonth: prev.month,
      nextYear: next.year,
      nextMonth: next.month,
      nextNextYear: nextNext.year,
      nextNextMonth: nextNext.month,
    };
  }, [year, month]);

  // Fetch monthly schedules for prevPrev, prev, current, next, nextNext (5 months)
  const { data: prevPrevMonthScheduleData } = usePhotographerMonthSchedulesQuery(
    { photographerId: userId || '', year: prevPrevYear, month: prevPrevMonth },
    !!userId
  );

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

  const { data: nextNextMonthScheduleData } = usePhotographerMonthSchedulesQuery(
    { photographerId: userId || '', year: nextNextYear, month: nextNextMonth },
    !!userId
  );

  // Fetch day detail for selected date
  const { data: dayDetailData } = usePhotographerDayDetailQuery(
    { photographerId: userId || '', date: selectedDate },
    !!userId && !!selectedDate
  );

  // Enhanced schedule data from API (5 months: prevPrev, prev, current, next, nextNext)
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

        schedulesByDate.set(dateString, {
          hasBooking: status === 'BOOKING',
          publicHoliday: item.publicHoliday,
          photographerHoliday: status === 'HOLIDAY',
          hasPersonalSchedule: status === 'PERSONAL',
        });
      });
    };

    // Add all 5 months data (prevPrev, prev, current, next, nextNext)
    addMonthData(prevPrevMonthScheduleData, prevPrevYear, prevPrevMonth);
    addMonthData(prevMonthScheduleData, prevYear, prevMonth);
    addMonthData(monthScheduleData, year, month);
    addMonthData(nextMonthScheduleData, nextYear, nextMonth);
    addMonthData(nextNextMonthScheduleData, nextNextYear, nextNextMonth);

    // Convert map to array
    return Array.from(schedulesByDate.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));
  }, [
    prevPrevMonthScheduleData, prevMonthScheduleData, monthScheduleData, nextMonthScheduleData, nextNextMonthScheduleData,
    prevPrevYear, prevPrevMonth, prevYear, prevMonth, year, month, nextYear, nextMonth, nextNextYear, nextNextMonth,
  ]);

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
    // scheduleId만 전달하고, 실제 데이터는 모달에서 usePersonalScheduleQuery로 가져옴
    openScheduleDetailModal(id);
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

    openScheduleDetailModal(undefined, holidaySchedule);
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    // Update currentYearMonth to match the selected date's year-month
    const ym = date.slice(0, 7);
    setCurrentYearMonth(ym);
  };

  const handleMonthChange = useCallback((yearMonth: string) => {
    setCurrentYearMonth(yearMonth);

    const [y, m] = yearMonth.split('-').map(Number);
    const newWeekCount = getWeekCountOfMonth(y, m);
    setCurrentWeekCount(newWeekCount);
  }, []);

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

  // // Calculate D-day from today to selected date
  // const dDayText = useMemo(() => {
  //   const selected = new Date(selectedDate);
  //   const current = new Date();
  //   const diffTime = selected.getTime() - current.getTime();
  //   const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  //
  //   if (diffDays === 0) return '오늘';
  //   if (diffDays === 1) return '내일';
  //   if (diffDays === -1) return '어제';
  //   if (diffDays > 0) return `D+${diffDays}`;
  //   return `D-${Math.abs(diffDays)}`;
  // }, [selectedDate]);

  const handlePressToday = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayYearMonth = today.slice(0, 7);
    setSelectedDate(today);
    setCurrentYearMonth(todayYearMonth);
  }

  return (
    <BookingCalendarView
      selectedDate={selectedDate}
      isToday={selectedDate !== '' && selectedDate === new Date().toISOString().split('T')[0]}
      onSelectToday={handlePressToday}
      scheduleData={enhancedScheduleData}
      currentYearMonth={currentYearMonth}
      weekCount={currentWeekCount}
      dayDetailData={dayDetailData || null}
      onPressBookingItem={handlePressBookingItem}
      onPressPersonalSchedule={handlePressPersonalSchedule}
      onPressHoliday={handlePressHoliday}
      onSelectDate={handleSelectDate}
      onPressAddSchedule={handleAddSchedule}
      onMonthChange={handleMonthChange}
    />
  );
}
