import UserBookingDetailsView from '@/screens/user/BookingDetails/UserBookingDetailsView.tsx';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useReservationDetailQuery } from '@/queries/reservations.ts';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';

type BookingDetailsRouteProp = RouteProp<MainStackParamList, 'BookingDetails'>;

export default function UserBookingDetailsContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<BookingDetailsRouteProp>();
  const { reservationId } = route.params;

  const { data: reservationDetails, isLoading } = useReservationDetailQuery(reservationId);

  const handlePressBack = () => navigation.goBack();

  const handlePressViewPhotos = () => navigation.navigate('ViewPhotos', { reservationId });

  const handlePressWriteReview = () => navigation.navigate('WriteReview', { reservationId });

  if (!reservationDetails) {
    return (
      <UserBookingDetailsView
        onPressBack={handlePressBack}
        name=""
        bookingOption=""
        datetime=""
        additionalRequest=""
        status="REQUESTED"
        isLoading={isLoading}
      />
    );
  }

  const canViewPhotos = reservationDetails.status === 'DELIVERED' || reservationDetails.status === 'REVIEWED';
  const canWriteReview = reservationDetails.status === 'DELIVERED';
  const shootingOptions =
    Array.isArray(reservationDetails.shootingOptions)
      ? reservationDetails.shootingOptions.join(', ')
      : '';

  return (
    <UserBookingDetailsView
      onPressBack={handlePressBack}
      name={reservationDetails.photographerName}
      bookingOption={shootingOptions}
      datetime={reservationDetails.shootingDateTime}
      additionalRequest={reservationDetails.requirement}
      status={reservationDetails.status}
      onPressViewPhotos={canViewPhotos ? handlePressViewPhotos : undefined}
      onPressWriteReview={canWriteReview ? handlePressWriteReview : undefined}
      isLoading={isLoading}
    />
  );
}
