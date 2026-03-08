import BookingRequestView from '@/screens/user/BookingRequest/BookingRequestView.tsx';
import { trackBookingEvent, safeLogEvent } from '@/utils/analytics.ts';
import { useAuthStore } from '@/store/authStore.ts';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';
import { useForm, Controller } from 'react-hook-form';
import { Alert } from '@/components/ui';
import { useCreateBookingMutation } from '@/mutations/bookings.ts';
import { useEffect, useRef } from 'react';
import { showErrorAlert } from '@/utils/error';

type BookingRequestRouteProp = RouteProp<MainStackParamList, 'BookingRequest'>;

interface BookingRequestFormInputs {
  requestDetails: string;
}

export default function BookingRequestContainer() {
  const { userId, userType } = useAuthStore();
  const route = useRoute<BookingRequestRouteProp>();
  const navigation = useNavigation<MainNavigationProp>();
  const { photographerId, productId, options, shootingDate, startTime, region } = route.params;

  const { control, handleSubmit } = useForm<BookingRequestFormInputs>({
    mode: 'onChange',
    defaultValues: {
      requestDetails: '',
    },
  });

  const createBookingMutation = useCreateBookingMutation();

  // Track booking form abandonment
  const formStartTimeRef = useRef<number | null>(null);
  const formCompletedRef = useRef(false);

  useEffect(() => {
    // Record form start time
    formStartTimeRef.current = Date.now();

    // Cleanup: Log abandonment if form not completed
    return () => {
      if (!formCompletedRef.current && formStartTimeRef.current) {
        const timeSpentSeconds = (Date.now() - formStartTimeRef.current) / 1000;

        safeLogEvent('booking_form_abandoned', {
          photographer_id: photographerId,
          step: 'request_details',
          time_spent_seconds: Math.round(timeSpentSeconds),
          product_id: productId,
          shooting_date: shootingDate,
        });
      }
    };
  }, [photographerId, productId, shootingDate]);

  const onSubmit = (data: BookingRequestFormInputs) => {
    // Mark form as completed to prevent abandonment event
    formCompletedRef.current = true;

    // Log booking_request_submitted
    trackBookingEvent('booking_request_submitted', undefined, photographerId, {
      product_id: productId,
      shooting_date: shootingDate,
      start_time: startTime,
      options: JSON.stringify(options),
      request_details_length: data.requestDetails?.length ?? 0,
    });

    createBookingMutation.mutate({
      photographerId,
      region,
      productId,
      options,
      shootingDate, // Already ISO string from Booking screen
      startTime, // HH:mm format
      requestDetails: data.requestDetails,
    }, {
      onSuccess: () => {
        // 예약 생성 완료 (DB 기록 성공) -> booking_request_delivery_succeeded
        trackBookingEvent('booking_request_delivery_succeeded', undefined, photographerId, {
          product_id: productId,
          shooting_date: shootingDate,
          start_time: startTime,
          options: JSON.stringify(options),
        });

        Alert.show({
          title: '📸 스냅 사진 예약이 완료되었습니다.',
          message: '작가님과의 스냅사진 촬영 예약이 완료되었습니다. 자세한 예약 내역은 마이페이지 내 촬영내역에서도 확인할 수 있어요!',
          buttons: [
            {
              text: '확인', onPress: () => {
                navigation.reset({ index: 1, routes: [{ name: "Home" }, { name: "BookingHistory" }] });
              }
            },
          ]
        });
      },
      onError: (error: Error) => {
        showErrorAlert({
          title: '예약 실패',
          action: '예약',
          error,
        });
      },
    });
  };

  const handlePressBack = () => {
    navigation.goBack();
  };

  return (
    <Controller
      control={control}
      name="requestDetails"
      render={({ field: { onChange, value } }) => (
        <BookingRequestView
          onPressBack={handlePressBack}
          onSubmit={handleSubmit(onSubmit)}
          isSubmitDisabled={createBookingMutation.isPending}
          additionalRequest={value}
          onChangeAdditionalRequest={onChange}
          navigation={navigation}
        />
      )}
    />
  );
}
