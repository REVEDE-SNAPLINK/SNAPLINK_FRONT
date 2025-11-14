import BookingView from '@/screens/user/Booking/BookingView.tsx';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPhotographerDetails, getReservationData } from '@/api/photographer.ts';
import { ActivityIndicator, View } from 'react-native';
import { theme } from '@/theme';

type BookingRouteProp = RouteProp<MainStackParamList, 'Booking'>;

export default function BookingContainer () {
  const route = useRoute<BookingRouteProp>();
  const navigation = useNavigation<MainNavigationProp>();
  const { id: photographerId } = route.params;

  const initialDate = (new Date()).toDateString();
  const [currentDate, setCurrentDate] = useState<string>(initialDate);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [requiredOptionChecked, setRequiredOptionChecked] = useState<boolean>(true);
  const [optionalQuantities, setOptionalQuantities] = useState<Record<string, number>>({});

  // Fetch photographer details
  const { data: photographerDetails, isLoading: isLoadingPhotographer } = useQuery({
    queryKey: ['photographerDetails', photographerId],
    queryFn: () => getPhotographerDetails(photographerId),
  });

  // Fetch reservation data
  const { data: reservationData, isLoading: isLoadingReservation } = useQuery({
    queryKey: ['reservationData', photographerId],
    queryFn: () => getReservationData(photographerId),
  });

  const handleBackButtonPress = () => {
    navigation.goBack();
  };

  const handleChangeDate = (date: string) => {
    setCurrentDate(date);
    setSelectedTime(null); // Reset selected time when date changes
  };

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
  };

  const handleOptionalQuantityChange = (optionId: string, quantity: number) => {
    setOptionalQuantities((prev) => ({
      ...prev,
      [optionId]: quantity,
    }));
  };

  // Calculate total price
  const totalPrice = useMemo(() => {
    let total = 0;

    // Add required option price if checked
    if (requiredOptionChecked && reservationData?.requiredOptions[0]) {
      total += reservationData.requiredOptions[0].price;
    }

    // Add optional options prices
    reservationData?.optionalOptions.forEach((option) => {
      const quantity = optionalQuantities[option.id] || 0;
      total += option.price * quantity;
    });

    return total;
  }, [requiredOptionChecked, optionalQuantities, reservationData]);

  const handleSubmit = () => {
    // TODO: Implement reservation submission
    console.log({
      photographerId,
      date: currentDate,
      time: selectedTime,
      requiredOption: requiredOptionChecked ? reservationData?.requiredOptions[0] : null,
      optionalOptions: optionalQuantities,
      totalPrice,
    });
  };

  // Set initial date to first available date if current date is not available
  useEffect(() => {
    if (reservationData?.availableDates && reservationData.availableDates.length > 0) {
      const formattedInitialDate = new Date().toISOString().split('T')[0];
      if (!reservationData.availableDates.includes(formattedInitialDate)) {
        setCurrentDate(reservationData.availableDates[0]);
      } else {
        setCurrentDate(formattedInitialDate);
      }
    }
  }, [reservationData?.availableDates]);

  // Initialize optional quantities
  useEffect(() => {
    if (reservationData?.optionalOptions) {
      const initialQuantities: Record<string, number> = {};
      reservationData.optionalOptions.forEach((option) => {
        initialQuantities[option.id] = 0;
      });
      setOptionalQuantities(initialQuantities);
    }
  }, [reservationData?.optionalOptions]);

  if (isLoadingPhotographer || isLoadingReservation) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!photographerDetails || !reservationData) {
    return null;
  }

  return (
    <BookingView
      onPressBack={handleBackButtonPress}
      onChangeDate={handleChangeDate}
      nickname={photographerDetails.nickname}
      initialDate={initialDate}
      currentDate={currentDate}
      availableDates={reservationData.availableDates}
      timeSlots={reservationData.timeSlotsByDate[currentDate] || []}
      selectedTime={selectedTime}
      onSelectTime={handleSelectTime}
      requiredOptions={reservationData.requiredOptions}
      requiredOptionChecked={requiredOptionChecked}
      onRequiredOptionPress={() => setRequiredOptionChecked(!requiredOptionChecked)}
      optionalOptions={reservationData.optionalOptions}
      optionalQuantities={optionalQuantities}
      onOptionalQuantityChange={handleOptionalQuantityChange}
      totalPrice={totalPrice}
      onSubmit={handleSubmit}
    />
  );
}