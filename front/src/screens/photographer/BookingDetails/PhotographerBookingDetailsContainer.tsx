import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useBookingDetailQuery } from '@/queries/bookings.ts';
import PhotographerBookingDetailsView from '@/screens/photographer/BookingDetails/PhotographerBookingDetailsView.tsx';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';
import analytics from '@react-native-firebase/analytics';
import { useAuthStore } from '@/store/authStore.ts';
import { useCreateOrGetChatRoomMutation } from '@/queries/chat.ts';
import { queryClient } from '@/config/queryClient.ts';
import { chatQueryKeys } from '@/queries/keys.ts';
import { formatReservationDateTime } from '@/utils/format.ts';

type BookingDetailsRouteProp = RouteProp<MainStackParamList, 'BookingDetails'>;

export default function PhotographerBookingDetailsContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<BookingDetailsRouteProp>();
  const { bookingId } = route.params;
  const { userId } = useAuthStore();

  const { data: bookingDetails, isLoading } = useBookingDetailQuery(bookingId);
  const { mutate: chatMutate } = useCreateOrGetChatRoomMutation();

  const handlePressBack = () => navigation.goBack();

  const handlePressViewPhotos = () => {
    analytics().logEvent('photographer_booking_photos_view', {
      user_id: userId,
      user_type: 'photographer',
      bookingId,
    });
    navigation.navigate('ViewPhotos', { bookingId });
  };

  const handleOpenChatRoom = () => {
    chatMutate(
      { receiverId: bookingDetails?.customerId ?? '' },
      {
        onSuccess: (roomId) => {
          queryClient.invalidateQueries({ queryKey: chatQueryKeys.rooms() });

          navigation.navigate('ChatDetails', {
            roomId
          });
        },
      },
    );
  }

  if (!bookingDetails) {
    return (
      <PhotographerBookingDetailsView
        onPressBack={handlePressBack}
        customerName=""
        bookingOption=""
        datetime=""
        region=""
        additionalRequest=""
        isLoading={isLoading}
        onOpenChatRoom={() => {}}
      navigation={navigation}
    />
    );
  }

  const canViewPhotos = bookingDetails.status === 'COMPLETED' || bookingDetails.status === 'PHOTOS_DELIVERED' || bookingDetails.status === 'USER_PHOTO_CHECK';

  return (
    <PhotographerBookingDetailsView
      onPressBack={handlePressBack}
      customerName={bookingDetails.customerName}
      bookingOption={bookingDetails.shootingItems}
      datetime={formatReservationDateTime(bookingDetails.shootingDate, bookingDetails.startTime, bookingDetails.endTime)}
      region={bookingDetails.region}
      additionalRequest={bookingDetails.requestDetails}
      onPressViewPhotos={canViewPhotos ? handlePressViewPhotos : undefined}
      onOpenChatRoom={handleOpenChatRoom}
      isLoading={isLoading}
      navigation={navigation}
    />
  );
}
