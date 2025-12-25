import BookingView from '@/screens/user/Booking/BookingView.tsx';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { UserMainNavigationProp, UserMainStackParamList } from '@/types/userNavigation.ts';
import { useEffect, useMemo, useState } from 'react';
import Loading from '@/components/Loading.tsx';
import ScreenContainer from '@/components/ScreenContainer.tsx';
import { useForm } from 'react-hook-form';
import { useMonthlyScheduleQuery, useAvailableSlotsQuery } from '@/queries/reservations.ts';
import { usePhotographerProfileQuery } from '@/queries/photographers.ts';

type BookingRouteProp = RouteProp<UserMainStackParamList, 'Booking'>;

interface BookingFormInputs {
  date: string;
  time: string;
  requiredOptionChecked: boolean;
  optionalQuantities: Record<string, number>;
}

export default function BookingContainer() {
  const route = useRoute<BookingRouteProp>();
  const navigation = useNavigation<UserMainNavigationProp>();
  const { photographerId } = route.params;

  const { control, watch, setValue, handleSubmit, formState: { isValid } } = useForm<BookingFormInputs>({
    mode: 'onChange',
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      time: '',
      requiredOptionChecked: true,
      optionalQuantities: {},
    },
  });

  const watchedFields = watch();

  const [currentMonth, setCurrentMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  );

  // Fetch photographer profile
  const { data: photographerProfile, isLoading: isLoadingPhotographer } = usePhotographerProfileQuery(photographerId);

  // Fetch monthly schedule
  const { data: monthlySchedule } = useMonthlyScheduleQuery(photographerId, currentMonth);

  // Fetch available slots for selected date
  const { data: availableSlots } = useAvailableSlotsQuery(
    photographerId,
    watchedFields.date,
  );

  // TODO: 백엔드 API 추가 필요
  // GET /api/photographers/{photographerId}/options
  // - requiredOptions: 필수 옵션 목록
  // - optionalOptions: 선택 옵션 목록
  //
  // const { data: reservationOptions, isLoading: isLoadingOptions } = useQuery({
  //   queryKey: ['photographerOptions', photographerId],
  //   queryFn: () => getPhotographerOptions(photographerId),
  // });

  // 임시 데이터 (API 구현 전까지)
  const reservationOptions = {
    requiredOptions: [
      { id: '1', name: '기본 촬영', price: 50000 }
    ],
    optionalOptions: [
      { id: '2', name: '추가 인원 (1명당)', price: 10000 },
      { id: '3', name: '추가 시간 (30분)', price: 15000 },
    ],
  };

  const handlePressBack = () => {
    navigation.goBack();
  };

  const handleChangeDate = (date: string) => {
    setValue('date', date);
    setValue('time', ''); // Reset selected time when date changes
  };

  const handleSelectTime = (time: string) => {
    setValue('time', time);
  };

  const handlePressRequiredOption = () => {
    setValue('requiredOptionChecked', !watchedFields.requiredOptionChecked);
  };

  const handleOptionalQuantityChange = (optionId: string, quantity: number) => {
    setValue(`optionalQuantities.${optionId}`, quantity);
  };

  // Calculate total price
  const totalPrice = useMemo(() => {
    let total = 0;

    // Add required option price if checked
    if (watchedFields.requiredOptionChecked && reservationOptions.requiredOptions[0]) {
      total += reservationOptions.requiredOptions[0].price;
    }

    // Add optional options prices
    reservationOptions.optionalOptions.forEach((option) => {
      const quantity = watchedFields.optionalQuantities[option.id] || 0;
      total += option.price * quantity;
    });

    return total;
  }, [watchedFields.requiredOptionChecked, watchedFields.optionalQuantities, reservationOptions]);

  const onSubmit = (data: BookingFormInputs) => {
    // Navigate to BookingRequest with form data
    navigation.navigate('BookingRequest', {
      photographerId,
      photographerNickname: photographerProfile?.nickname || '',
      date: data.date,
      time: data.time,
      requiredOptionId: reservationOptions.requiredOptions[0]?.id || '',
      requiredOptionChecked: data.requiredOptionChecked,
      optionalOptions: data.optionalQuantities,
      totalPrice,
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
      .map((slot) => {
        const hour = String(slot.time.hour).padStart(2, '0');
        const minute = String(slot.time.minute).padStart(2, '0');
        return `${hour}:${minute}`;
      });
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

  // Initialize optional quantities
  useEffect(() => {
    if (reservationOptions.optionalOptions) {
      const initialQuantities: Record<string, number> = {};
      reservationOptions.optionalOptions.forEach((option) => {
        initialQuantities[option.id] = 0;
      });
      setValue('optionalQuantities', initialQuantities);
    }
  }, [reservationOptions.optionalOptions, setValue]);

  if (isLoadingPhotographer) {
    return (
      <ScreenContainer
        headerShown={true}
        headerTitle="예약하기"
        onPressBack={handlePressBack}
      >
        <Loading size="large" variant="fullscreen" />
      </ScreenContainer>
    );
  }

  if (!photographerProfile) {
    return null;
  }

  // Check if form is valid: date and time must be selected
  const isFormValid = isValid && !!watchedFields.date && !!watchedFields.time;

  return (
    <BookingView
      onPressBack={handlePressBack}
      onChangeDate={handleChangeDate}
      nickname={photographerProfile.nickname}
      initialDate={watchedFields.date}
      currentDate={watchedFields.date}
      availableDates={availableDates}
      timeSlots={timeSlots}
      selectedTime={watchedFields.time}
      onSelectTime={handleSelectTime}
      requiredOptions={reservationOptions.requiredOptions}
      requiredOptionChecked={watchedFields.requiredOptionChecked}
      onPressRequiredOption={handlePressRequiredOption}
      optionalOptions={reservationOptions.optionalOptions}
      optionalQuantities={watchedFields.optionalQuantities}
      onOptionalQuantityChange={handleOptionalQuantityChange}
      totalPrice={totalPrice}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitDisabled={!isFormValid}
    />
  );
}
