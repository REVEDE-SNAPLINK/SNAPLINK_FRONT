import BookingRequestView from '@/screens/user/BookingRequest/BookingRequestView.tsx';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { UserMainNavigationProp, UserMainStackParamList } from '@/types/userNavigation.ts';
import { useForm, Controller } from 'react-hook-form';
import { Alert } from '@/components/theme';
import { useCreateReservationMutation } from '@/mutations/reservations.ts';

type BookingRequestRouteProp = RouteProp<UserMainStackParamList, 'BookingRequest'>;

interface BookingRequestFormInputs {
  additionalRequest: string;
}

export default function BookingRequestContainer() {
  const route = useRoute<BookingRequestRouteProp>();
  const navigation = useNavigation<UserMainNavigationProp>();
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
    // Parse time string "HH:mm" to hour and minute
    const [hour, minute] = bookingData.time.split(':').map(Number);

    createReservationMutation.mutate({
      photographerId: bookingData.photographerId,
      reservationDate: bookingData.date,
      startTime: { hour, minute, second: 0, nano: 0 },
      service: bookingData.requiredOptionId, // TODO: 서비스 이름이 맞는지 확인
      details: data.additionalRequest,
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
