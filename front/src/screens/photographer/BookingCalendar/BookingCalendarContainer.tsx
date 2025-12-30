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

  // Extract year and month from selected date
  const [year, month] = useMemo(() => {
    const parts = selectedDate.split('-');
    return [parseInt(parts[0]), parseInt(parts[1])];
  }, [selectedDate]);

  // Fetch monthly schedule
  const { data: monthScheduleData } = usePhotographerMonthSchedulesQuery(
    { photographerId: userId || '', year, month },
    !!userId
  );

  // Fetch day detail
  const { data: dayDetailData } = usePhotographerDayDetailQuery(
    { photographerId: userId || '', date: selectedDate },
    !!userId
  );

  const handlePressBack = () => navigation.goBack();

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
    openAddScheduleModal((updatedSchedule) => {
      setPersonalSchedules((prev) =>
        prev.map((s) => (s.id === schedule.id ? { ...updatedSchedule, id: schedule.id } : s))
      );
      closeAddScheduleModal();
    }, schedule);
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    setPersonalSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
    closeScheduleDetailModal();
  };

  const handleDuplicateSchedule = (schedule: PersonalSchedule) => {
    const newSchedule: PersonalSchedule = {
      ...schedule,
      id: `schedule_${Date.now()}`,
      title: `${schedule.title} (복사)`,
    };
    setPersonalSchedules((prev) => [...prev, newSchedule]);
    closeScheduleDetailModal();
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

  // Get schedules for selected date
  const selectedDateSchedules = useMemo(() => {
    return personalSchedules.filter((schedule) => {
      const scheduleDate = schedule.startDate.toISOString().split('T')[0];
      return scheduleDate === selectedDate;
    });
  }, [personalSchedules, selectedDate]);

  return (
    <BookingCalendarView
      selectedDate={selectedDate}
      monthScheduleData={monthScheduleData || []}
      dayDetailData={dayDetailData || []}
      personalSchedules={selectedDateSchedules}
      dDayText={dDayText}
      onPressBack={handlePressBack}
      onPressBookingItem={handlePressBookingItem}
      onPressPersonalSchedule={handlePressPersonalSchedule}
      onSelectDate={handleSelectDate}
      onPressAddSchedule={handleAddSchedule}
    />
  );
}
