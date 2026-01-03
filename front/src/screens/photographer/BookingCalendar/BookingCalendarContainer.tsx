import { useState, useMemo } from 'react';
import BookingCalendarView from '@/screens/photographer/BookingCalendar/BookingCalendarView.tsx';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation.ts';
import { useAuthStore } from '@/store/authStore.ts';
import { useModalStore, PersonalSchedule } from '@/store/modalStore.ts';
import { usePhotographerMonthSchedulesQuery, usePhotographerDayDetailQuery } from '@/queries/schedules.ts';

export default function BookingCalendarContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const userId = useAuthStore((state) => state.userId);
  const {
    openAddScheduleModal,
    closeAddScheduleModal,
    openScheduleDetailModal,
    closeScheduleDetailModal,
  } = useModalStore();

  const today = useMemo(() => new Date(), []);

  // Current date and selected date state
  const [selectedDate, setSelectedDate] = useState<string>(
    today.toISOString().split('T')[0]
  );

  // Personal schedules state (local)
  const [personalSchedules, setPersonalSchedules] = useState<PersonalSchedule[]>([]);

  // Current year-month state for data fetching
  const [currentYearMonth, setCurrentYearMonth] = useState<string>(() => {
    const parts = selectedDate.split('-');
    return `${parts[0]}-${parts[1]}`;
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

  // Fetch day detail
  const { data: dayDetailData } = usePhotographerDayDetailQuery(
    { photographerId: userId || '', date: selectedDate },
    !!userId
  );

  // Helper: Get all dates between start and end (inclusive)
  const getDatesBetween = (startDate: Date, endDate: Date): string[] => {
    const dates: string[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  // Enhanced schedule data with personal schedules (prev, current, next month)
  const enhancedScheduleData = useMemo(() => {
    const schedulesByDate = new Map<string, {
      hasBooking: boolean;
      publicHoliday: boolean;
      photographerHoliday: boolean;
      hasPersonalSchedule: boolean;
    }>();

    // Helper to add month data to map
    const addMonthData = (data: typeof monthScheduleData, year: number, month: number) => {
      if (!data || !Array.isArray(data)) return;
      data.forEach(item => {
        const dateString = `${year}-${String(month).padStart(2, '0')}-${String(item.day).padStart(2, '0')}`;
        schedulesByDate.set(dateString, {
          hasBooking: item.hasBooking,
          publicHoliday: item.publicHoliday,
          photographerHoliday: item.photographerHoliday,
          hasPersonalSchedule: false,
        });
      });
    };

    // Add prev, current, and next month data
    addMonthData(prevMonthScheduleData, prevYear, prevMonth);
    addMonthData(monthScheduleData, year, month);
    addMonthData(nextMonthScheduleData, nextYear, nextMonth);

    // Add personal schedules
    personalSchedules.forEach(schedule => {
      const affectedDates = getDatesBetween(schedule.startDate, schedule.endDate);
      affectedDates.forEach(dateString => {
        const existing = schedulesByDate.get(dateString);
        if (existing) {
          existing.hasPersonalSchedule = true;
        } else {
          // Date might not be in API data, create entry for personal schedule only
          schedulesByDate.set(dateString, {
            hasBooking: false,
            publicHoliday: false,
            photographerHoliday: false,
            hasPersonalSchedule: true,
          });
        }
      });
    });

    // Convert map to array
    return Array.from(schedulesByDate.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));
  }, [prevMonthScheduleData, monthScheduleData, nextMonthScheduleData, personalSchedules, prevYear, prevMonth, year, month, nextYear, nextMonth]);


  const handlePressBookingItem = (bookingId: number) =>
    navigation.navigate('BookingDetails', { bookingId });

  const handlePressPersonalSchedule = (scheduleId: string) => {
    const schedule = personalSchedules.find((s) => s.id === scheduleId);
    if (schedule) {
      openScheduleDetailModal(
        schedule,
        handleEditSchedule,
        handleDeleteSchedule,
        handleDuplicateSchedule
      );
    }
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
  };

  const handleMonthChange = (yearMonth: string) => {
    setCurrentYearMonth(yearMonth);
  };

  const handleAddSchedule = () => {
    openAddScheduleModal(handleSubmitSchedule);
  };

  const handleSubmitSchedule = (schedule: Omit<PersonalSchedule, 'id'>) => {
    const newSchedule: PersonalSchedule = {
      ...schedule,
      id: `schedule_${Date.now()}`,
    };
    setPersonalSchedules((prev) => [...prev, newSchedule]);
    closeAddScheduleModal();
  };

  const handleEditSchedule = (schedule: PersonalSchedule) => {
    closeScheduleDetailModal();
    // 수정 모드로 AddScheduleModal 열기
    openAddScheduleModal((updatedSchedule) => {
      setPersonalSchedules((prev) =>
        prev.map((s) => (s.id === schedule.id ? { ...updatedSchedule, id: schedule.id } : s))
      );
      closeAddScheduleModal();
    }, schedule, false); // isDuplicate = false (수정 모드)
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    setPersonalSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
    closeScheduleDetailModal();
  };

  const handleDuplicateSchedule = (schedule: PersonalSchedule) => {
    closeScheduleDetailModal();
    // 복사 모드로 AddScheduleModal 열기
    openAddScheduleModal((duplicatedSchedule) => {
      const newSchedule: PersonalSchedule = {
        ...duplicatedSchedule,
        id: `schedule_${Date.now()}`,
      };
      setPersonalSchedules((prev) => [...prev, newSchedule]);
      closeAddScheduleModal();
    }, schedule, true); // isDuplicate = true
  };

  // Calculate D-day from today to selected date
  const dDayText = useMemo(() => {
    const selected = new Date(selectedDate);
    const current = new Date(today.toISOString().split('T')[0]);
    const diffTime = selected.getTime() - current.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '내일';
    if (diffDays === -1) return '어제';
    if (diffDays > 0) return `D+${diffDays}`;
    return `D-${Math.abs(diffDays)}`;
  }, [selectedDate, today]);

  // Get schedules for selected date (including multi-day schedules)
  const selectedDateSchedules = useMemo(() => {
    return personalSchedules.filter((schedule) => {
      const affectedDates = getDatesBetween(schedule.startDate, schedule.endDate);
      return affectedDates.includes(selectedDate);
    });
  }, [personalSchedules, selectedDate]);

  return (
    <BookingCalendarView
      selectedDate={selectedDate}
      scheduleData={enhancedScheduleData}
      dayDetailData={dayDetailData || null}
      personalSchedules={selectedDateSchedules}
      dDayText={dDayText}
      onPressBookingItem={handlePressBookingItem}
      onPressPersonalSchedule={handlePressPersonalSchedule}
      onSelectDate={handleSelectDate}
      onPressAddSchedule={handleAddSchedule}
      onMonthChange={handleMonthChange}
    />
  );
}
