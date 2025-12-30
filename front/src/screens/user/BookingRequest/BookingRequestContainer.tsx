import BookingRequestView from '@/screens/user/BookingRequest/BookingRequestView.tsx';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';
import { useForm, Controller } from 'react-hook-form';
import { Alert } from '@/components/theme';
import { useCreateReservationMutation } from '@/mutations/bookings.ts';

type BookingRequestRouteProp = RouteProp<MainStackParamList, 'BookingRequest'>;

interface BookingRequestFormInputs {
  additionalRequest: string;
}

export default function BookingRequestContainer() {
  const route = useRoute<BookingRequestRouteProp>();
  const navigation = useNavigation<MainNavigationProp>();
  const bookingData = route.params;

  const { control, handleSubmit, watch, formState: { isValid } } = useForm<BookingRequestFormInputs>({
    mode: 'onChange',
    defaultValues: {
      additionalRequest: '',
    },
  });

  const watchedRequest = watch('additionalRequest');

  const createReservationMutation = useCreateReservationMutation();

  const onSubmit = (data: BookingRequestFormInputs) => {
    // Combine date and time to create ISO shootingDate
    const shootingDate = new Date(`${bookingData.date}T${bookingData.time}:00`).toISOString();

    // Only include required option in API transmission
    // optionalOptions are used for display and price calculation only
    const options: number[] = [];

    // Add required option if checked
    if (bookingData.requiredOptionChecked && bookingData.requiredOptionId) {
      options.push(bookingData.requiredOptionId);
    }

    createReservationMutation.mutate({
      photographerId: bookingData.photographerId,
      shootingDate,
      options,
      requirement: data.additionalRequest,
      totalAmount: bookingData.totalPrice,
    }, {
      onSuccess: () => {
        Alert.show({
          title: '📸 스냅 사진 예약이 완료되었습니다.',
          message: '작가님과의 스냅사진 촬영 예약이 완료되었습니다. 자세한 예약 내역은 마이페이지 내 촬영내역에서도 확인할 수 있어요!',
          buttons: [
            { text: '확인', onPress: () => navigation.navigate('BookingHistory') },
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
      name="additionalRequest"
      rules={{
        required: true,
        minLength: 15,
      }}
      render={({ field: { onChange, value } }) => (
        <BookingRequestView
          onPressBack={handlePressBack}
          nickname={bookingData.photographerNickname}
          onSubmit={handleSubmit(onSubmit)}
          isSubmitDisabled={!isFormValid || createReservationMutation.isPending}
          additionalRequest={value}
          onChangeAdditionalRequest={onChange}
        />
      )}
    />
  );
}
