import BookingRequestView from '@/screens/user/BookingRequest/BookingRequestView.tsx';
import analytics from '@react-native-firebase/analytics';
import { useAuthStore } from '@/store/authStore.ts';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';
import { useForm, Controller } from 'react-hook-form';
import { Alert } from '@/components/theme';
import { useCreateBookingMutation } from '@/mutations/bookings.ts';

type BookingRequestRouteProp = RouteProp<MainStackParamList, 'BookingRequest'>;

interface BookingRequestFormInputs {
  requestDetails: string;
}

export default function BookingRequestContainer() {
  const { userId, userType } = useAuthStore();
  const route = useRoute<BookingRequestRouteProp>();
  const navigation = useNavigation<MainNavigationProp>();
  const { photographerId, productId, options, shootingDate, startTime, region } = route.params;

  const { control, handleSubmit, watch, formState: { isValid } } = useForm<BookingRequestFormInputs>({
    mode: 'onChange',
    defaultValues: {
      requestDetails: '',
    },
  });

  const watchedRequest = watch('requestDetails');

  const createBookingMutation = useCreateBookingMutation();

  const onSubmit = (data: BookingRequestFormInputs) => {
    // Log booking_request_submitted
    analytics().logEvent('booking_request_submitted', {
      user_id: userId,
      user_type: userType,
      photographer_id: photographerId,
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
        // Log booking_confirmed
        analytics().logEvent('booking_confirmed', {
          user_id: userId,
          user_type: userType,
          photographer_id: photographerId,
          product_id: productId,
          shooting_date: shootingDate,
          start_time: startTime,
          options: JSON.stringify(options),
        });
        Alert.show({
          title: '📸 스냅 사진 예약이 완료되었습니다.',
          message: '작가님과의 스냅사진 촬영 예약이 완료되었습니다. 자세한 예약 내역은 마이페이지 내 촬영내역에서도 확인할 수 있어요!',
          buttons: [
            { text: '확인', onPress: () => {
              navigation.reset({ index: 1, routes: [{ name: "Home" }, { name: "BookingHistory" }] });
              } },
          ]
        });
      },
      onError: (error: Error) => {
        Alert.show({
          title: '예약 실패',
          message: error.message,
        })
      },
    });
  };

  const handlePressBack = () => {
    navigation.goBack();
  };

  // Check if form is valid: additionalRequest must be at least 15 characters
  const isFormValid = isValid && watchedRequest.length >= 15;

  return (
    <Controller
      control={control}
      name="requestDetails"
      rules={{
        required: true,
        minLength: 15,
      }}
      render={({ field: { onChange, value } }) => (
        <BookingRequestView
          onPressBack={handlePressBack}
          onSubmit={handleSubmit(onSubmit)}
          isSubmitDisabled={!isFormValid || createBookingMutation.isPending}
          additionalRequest={value}
          onChangeAdditionalRequest={onChange}
      navigation={navigation}
    />
      )}
    />
  );
}
