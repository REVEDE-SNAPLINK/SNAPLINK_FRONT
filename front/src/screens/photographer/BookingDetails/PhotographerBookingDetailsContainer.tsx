import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { PhotographerMainNavigationProp, PhotographerMainStackParamList } from '@/types/photographerNavigation.ts';
import { useReservationDetailQuery } from '@/queries/reservations.ts';
import PhotographerBookingDetailsView from '@/screens/photographer/BookingDetails/PhotographerBookingDetailsView.tsx';

type BookingDetailsRouteProp = RouteProp<PhotographerMainStackParamList, 'BookingDetails'>;

export default function PhotographerBookingDetailsContainer() {
  const navigation = useNavigation<PhotographerMainNavigationProp>();
  const route = useRoute<BookingDetailsRouteProp>();
  const { reservationId } = route.params;

  const { data: bookingDetails, isLoading } = useReservationDetailQuery(reservationId);

  const handlePressBack = () => navigation.goBack();

  const handlePressViewPhotos = () => navigation.navigate('ViewPhotos', { reservationId });

  if (!bookingDetails) {
    return (
      <PhotographerBookingDetailsView
        onPressBack={handlePressBack}
        customerNickname=""
        customerName=""
        bookingOption=""
        date=""
        time=""
        additionalRequest=""
        status="REQUESTED"
        isLoading={isLoading}
      />
    );
  }

  const canViewPhotos = bookingDetails.status === 'COMPLETED' || bookingDetails.status === 'DELIVERED' || bookingDetails.status === 'REVIEWED';

  // Format time from LocalTime
  const formatTime = (time: { hour: number; minute: number }) => {
    const hour = String(time.hour).padStart(2, '0');
    const minute = String(time.minute).padStart(2, '0');
    return `${hour}:${minute}`;
  };

  return (
    <PhotographerBookingDetailsView
      onPressBack={handlePressBack}
      customerNickname={bookingDetails.counterpartNickname}
      customerName={bookingDetails.counterpartName || ''}
      bookingOption={bookingDetails.service}
      date={bookingDetails.reservationDate}
      time={formatTime(bookingDetails.startTime)}
      additionalRequest={bookingDetails.details || ''}
      status={bookingDetails.status}
      onPressViewPhotos={canViewPhotos ? handlePressViewPhotos : undefined}
      isLoading={isLoading}
    />
  );
}
