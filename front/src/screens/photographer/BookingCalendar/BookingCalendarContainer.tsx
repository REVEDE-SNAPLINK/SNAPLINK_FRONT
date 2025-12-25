import { useState, useMemo } from 'react';
import BookingCalendarView from '@/screens/photographer/BookingCalendar/BookingCalendarView.tsx';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation.ts';
import { useAuthStore } from '@/store/authStore.ts';
import { useMonthlyScheduleQuery } from '@/queries/reservations.ts';

export default function BookingCalendarContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const userId = useAuthStore((state) => state.userId);

  // Current date and selected date state
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<string>(
    today.toISOString().split('T')[0]
  );
  const [currentMonth, setCurrentMonth] = useState<string>(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  );

  // Fetch monthly schedule
  const { data: monthlySchedule } = useMonthlyScheduleQuery(userId, currentMonth);

  // TODO: 백엔드 API 추가 필요
  // GET /api/photographers/{photographerId}/calendar/{date}
  // 특정 날짜의 예약 목록 조회
  //
  // const { data: bookingsData } = useQuery({
  //   queryKey: photographersQueryKeys.calendarBookings(userId || '', selectedDate),
  //   queryFn: () => getPhotographerDailyBookings(userId || '', selectedDate),
  //   enabled: !!userId && !!selectedDate,
  // });

  // 임시 데이터
  const bookingsData = { bookings: [] };

  // Extract event dates from monthly schedule
  const eventDates = useMemo(() => {
    if (!monthlySchedule) return [];
    return monthlySchedule
      .filter((schedule) => schedule.available)
      .map((schedule) => schedule.date);
  }, [monthlySchedule]);

  const handlePressBack = () => navigation.goBack();

  const handlePressBookingItem = (reservationId: number) =>
    navigation.navigate('BookingDetails', { reservationId });

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
  };

  const handleAddSchedule = () => {
    // TODO: Navigate to Add Schedule screen or open modal
    console.log('Add schedule clicked');
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
    if (diffDays > 0) return `D-${diffDays}`;
    return `D+${Math.abs(diffDays)}`;
  }, [selectedDate, today]);

  return (
    <BookingCalendarView
      selectedDate={selectedDate}
      bookings={bookingsData.bookings || []}
      eventDates={eventDates}
      dDayText={dDayText}
      onPressBack={handlePressBack}
      onPressBookingItem={handlePressBookingItem}
      onSelectDate={handleSelectDate}
      onPressAddSchedule={handleAddSchedule}
    />
  );
}
