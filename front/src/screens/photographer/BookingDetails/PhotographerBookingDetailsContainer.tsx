import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useReservationDetailQuery } from '@/queries/reservations.ts';
import PhotographerBookingDetailsView from '@/screens/photographer/BookingDetails/PhotographerBookingDetailsView.tsx';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';

type BookingDetailsRouteProp = RouteProp<MainStackParamList, 'BookingDetails'>;

export default function PhotographerBookingDetailsContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<BookingDetailsRouteProp>();
  const { reservationId } = route.params;

  const { data: reservationDetails, isLoading } = useReservationDetailQuery(reservationId);

  const handlePressBack = () => navigation.goBack();

  const handlePressViewPhotos = () => navigation.navigate('ViewPhotos', { reservationId });

  if (!reservationDetails) {
    return (
      <PhotographerBookingDetailsView
        onPressBack={handlePressBack}
        customerName=""
        bookingOption=""
        datetime=""
        additionalRequest=""
        status="REQUESTED"
        isLoading={isLoading}
      />
    );
  }

  const canViewPhotos = reservationDetails.status === 'COMPLETED' || reservationDetails.status === 'DELIVERED' || reservationDetails.status === 'REVIEWED';
  const bookingOption =
    Array.isArray(reservationDetails.shootingOptions)
      ? reservationDetails.shootingOptions.join(', ')
      : '';

  return (
    <PhotographerBookingDetailsView
      onPressBack={handlePressBack}
      customerName={reservationDetails.customerName}
      bookingOption={bookingOption}
      datetime={reservationDetails.shootingDateTime}
      additionalRequest={reservationDetails.requirement}
      status={reservationDetails.status}
      onPressViewPhotos={canViewPhotos ? handlePressViewPhotos : undefined}
      isLoading={isLoading}
    />
  );
}
