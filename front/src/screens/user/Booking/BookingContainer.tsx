import BookingView from '@/screens/user/Booking/BookingView.tsx';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMonthlyScheduleQuery, useAvailableSlotsQuery } from '@/queries/reservations.ts';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';

type BookingRouteProp = RouteProp<MainStackParamList, 'Booking'>;

export interface ShootingOption {
  id: number;
  name: string;
  price: number;
}

export interface BookingFormData {
  photographerId: string;
  shootingDate: string;
  concept: number;
  options: number[];
  totalAmount: number;
}

interface BookingFormInputs {
  date: string;
  time: string;
  concept: number;
}

function toUtcIsoString(date: string, time: string) {
  // date: '2025-12-25'
  // time: '10:24'

  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);

  // ⚠️ month는 0-based
  const utcDate = new Date(Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute,
    0,
    0,
  ));

  return utcDate.toISOString();
}

export default function BookingContainer() {
  const route = useRoute<BookingRouteProp>();
  const navigation = useNavigation<MainNavigationProp>();
  const { photographerId } = route.params;

  const { watch, setValue, handleSubmit, formState: { isValid } } = useForm<BookingFormInputs>({
    mode: 'onChange',
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      time: '',
      concept: 0,
    },
  });

  const watchedFields = watch();

  const [currentMonth, setCurrentMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  );

  // Fetch monthly schedule
  const { data: monthlySchedule } = useMonthlyScheduleQuery(photographerId, currentMonth);

  // Fetch available slots for selected date
  const { data: availableSlots } = useAvailableSlotsQuery(
    photographerId,
    watchedFields.date,
  );

  const requiredOptions = { id: 1, name: '기본 촬영', price: 50000 };

  // 임시 데이터 (API 구현 전까지)
  const reservationOptions = useMemo(() => {
    return {
      requiredOptions: [
        { id: 1, name: '기본 촬영', price: 50000 }
      ],
      optionalOptions: [
        { id: 2, name: '추가 인원 (1명당)', price: 10000 },
        { id: 3, name: '추가 시간 (30분)', price: 15000 },
      ],
    }
  }, []);

  const handlePressBack = () => {
    navigation.goBack();
  };

  const handleChangeDate = (date: string) => {
    setValue('date', date);
    setValue('time', '');
    setCurrentMonth(date.slice(0, 7));
  };

  const handleSelectTime = (time: string) => {
    setValue('time', time);
  };

  const handlePressRequiredOption = (optionId: number) => {
    setValue('concept', optionId);
  };

  // Calculate total price
  const totalPrice = useMemo(() => {
    let total = 0;

    total += requiredOptions.price;

    return total;
  }, [requiredOptions.price]);

  const onSubmit = (data: BookingFormInputs) => {
    // Navigate to BookingRequest with form data
    navigation.navigate('BookingRequest', {
      photographerId,
      shootingDate: toUtcIsoString(data.date, data.time),
      concept: data.concept,
      options: [], // TODO: 나중에 구현,
      totalAmount: totalPrice,
    });
  };

  // Transform monthly schedule to available dates
  const availableDates = useMemo(() => {
    if (!monthlySchedule) return [];
    return monthlySchedule
      .filter((schedule) => schedule.available)
      .map((schedule) => schedule.date);
  }, [monthlySchedule]);

  // Transform available slots to time slots
  const timeSlots = useMemo(() => {
    if (!availableSlots) return [];
    return availableSlots
      .filter((slot) => slot.available)
      .map((slot) => slot.time);
  }, [availableSlots]);

  // Set initial date to first available date if current date is not available
  useEffect(() => {
    if (availableDates && availableDates.length > 0) {
      const formattedInitialDate = new Date().toISOString().split('T')[0];
      if (!availableDates.includes(formattedInitialDate)) {
        setValue('date', availableDates[0]);
      } else {
        setValue('date', formattedInitialDate);
      }
    }
  }, [availableDates, setValue]);

  // Check if form is valid: date and time must be selected
  const isFormValid = isValid && !!watchedFields.date && !!watchedFields.time;

  return (
    <BookingView
      onPressBack={handlePressBack}
      onChangeDate={handleChangeDate}
      initialDate={watchedFields.date}
      currentDate={watchedFields.date}
      availableDates={availableDates}
      timeSlots={timeSlots}
      selectedTime={watchedFields.time}
      onSelectTime={handleSelectTime}
      requiredOptions={requiredOptions}
      concept={watchedFields.concept}
      onPressRequiredOption={handlePressRequiredOption}
      totalPrice={totalPrice}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitDisabled={!isFormValid}
    />
  );
}
