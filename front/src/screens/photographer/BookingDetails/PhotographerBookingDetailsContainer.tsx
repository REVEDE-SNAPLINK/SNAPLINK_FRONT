import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useBookingDetailQuery } from '@/queries/bookings.ts';
import PhotographerBookingDetailsView from '@/screens/photographer/BookingDetails/PhotographerBookingDetailsView.tsx';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';

type BookingDetailsRouteProp = RouteProp<MainStackParamList, 'BookingDetails'>;

export default function PhotographerBookingDetailsContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<BookingDetailsRouteProp>();
  const { bookingId } = route.params;

  const { data: bookingDetails, isLoading } = useBookingDetailQuery(bookingId);

  const handlePressBack = () => navigation.goBack();

  const handlePressViewPhotos = () => navigation.navigate('ViewPhotos', { bookingId });

  if (!bookingDetails) {
    return (
      <PhotographerBookingDetailsView
        onPressBack={handlePressBack}
        customerName=""
        bookingOption=""
        datetime=""
        additionalRequest=""
        status="WAITING_FOR_APPROVAL"
        isLoading={isLoading}
      />
    );
  }

  const canViewPhotos = bookingDetails.status === 'COMPLETED' || bookingDetails.status === 'PHOTOS_DELIVERED' || bookingDetails.status === 'USER_PHOTO_CHECK';

  return (
    <PhotographerBookingDetailsView
      onPressBack={handlePressBack}
      customerName={bookingDetails.customerName}
      bookingOption={bookingDetails.shootingItems}
      datetime={bookingDetails.shootingDate}
      additionalRequest={bookingDetails.requestDetails}
      status={bookingDetails.status}
      onPressViewPhotos={canViewPhotos ? handlePressViewPhotos : undefined}
      isLoading={isLoading}
    />
  );
}
