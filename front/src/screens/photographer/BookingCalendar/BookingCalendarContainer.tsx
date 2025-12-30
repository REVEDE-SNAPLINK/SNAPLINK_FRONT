import { useState, useMemo } from 'react';
import BookingCalendarView from '@/screens/photographer/BookingCalendar/BookingCalendarView.tsx';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation.ts';
import { useAuthStore } from '@/store/authStore.ts';
import { useMonthlyScheduleQuery } from '@/queries/bookings.ts';
import AddScheduleModal, { PersonalSchedule } from './AddScheduleModal';
import ScheduleDetailModal from './ScheduleDetailModal';

export default function BookingCalendarContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const userId = useAuthStore((state) => state.userId);

  const today = useMemo(() => new Date(), []);

  // Current date and selected date state
  const [selectedDate, setSelectedDate] = useState<string>(
    today.toISOString().split('T')[0]
  );

  // Personal schedules state
  const [personalSchedules, setPersonalSchedules] = useState<PersonalSchedule[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<PersonalSchedule | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<PersonalSchedule | undefined>(undefined);

  // Fetch monthly schedule
  const { data: monthlySchedule } = useMonthlyScheduleQuery(userId, selectedDate.substring(0, 7));

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

  // Get schedules for selected date
  const selectedDateSchedules = useMemo(() => {
    return personalSchedules.filter((schedule) => {
      const scheduleDate = schedule.startDate.toISOString().split('T')[0];
      return scheduleDate === selectedDate;
    });
  }, [personalSchedules, selectedDate]);

  const handlePressBack = () => navigation.goBack();

  const handlePressBookingItem = (bookingId: number) =>
    navigation.navigate('BookingDetails', { bookingId });

  const handlePressPersonalSchedule = (scheduleId: string) => {
    const schedule = personalSchedules.find((s) => s.id === scheduleId);
    if (schedule) {
      setSelectedSchedule(schedule);
      setIsDetailModalVisible(true);
    }
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
  };

  const handleAddSchedule = () => {
    setEditingSchedule(undefined);
    setIsAddModalVisible(true);
  };

  const handleSubmitSchedule = (schedule: Omit<PersonalSchedule, 'id'>) => {
    if (editingSchedule) {
      // Update existing schedule
      setPersonalSchedules((prev) =>
        prev.map((s) =>
          s.id === editingSchedule.id ? { ...schedule, id: editingSchedule.id } : s
        )
      );
    } else {
      // Add new schedule
      const newSchedule: PersonalSchedule = {
        ...schedule,
        id: `schedule_${Date.now()}`,
      };
      setPersonalSchedules((prev) => [...prev, newSchedule]);
    }
    setIsAddModalVisible(false);
  };

  const handleEditSchedule = (schedule: PersonalSchedule) => {
    setEditingSchedule(schedule);
    setIsDetailModalVisible(false);
    setIsAddModalVisible(true);
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    setPersonalSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
  };

  const handleDuplicateSchedule = (schedule: PersonalSchedule) => {
    const newSchedule: PersonalSchedule = {
      ...schedule,
      id: `schedule_${Date.now()}`,
      title: `${schedule.title} (복사)`,
    };
    setPersonalSchedules((prev) => [...prev, newSchedule]);
    setIsDetailModalVisible(false);
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

  return (
    <>
      <BookingCalendarView
        selectedDate={selectedDate}
        bookings={bookingsData.bookings || []}
        personalSchedules={selectedDateSchedules}
        eventDates={eventDates}
        dDayText={dDayText}
        onPressBack={handlePressBack}
        onPressBookingItem={handlePressBookingItem}
        onPressPersonalSchedule={handlePressPersonalSchedule}
        onSelectDate={handleSelectDate}
        onPressAddSchedule={handleAddSchedule}
      />
      <AddScheduleModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSubmit={handleSubmitSchedule}
        initialSchedule={editingSchedule}
      />
      <ScheduleDetailModal
        visible={isDetailModalVisible}
        onClose={() => setIsDetailModalVisible(false)}
        schedule={selectedSchedule}
        onEdit={handleEditSchedule}
        onDelete={handleDeleteSchedule}
        onDuplicate={handleDuplicateSchedule}
      />
    </>
  );
}
