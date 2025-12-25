import UserBookingDetailsView from '@/screens/user/BookingDetails/UserBookingDetailsView.tsx';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { UserMainNavigationProp, UserMainStackParamList } from '@/types/userNavigation.ts';
import { useReservationDetailQuery } from '@/queries/reservations.ts';

type BookingDetailsRouteProp = RouteProp<UserMainStackParamList, 'BookingDetails'>;

export default function UserBookingDetailsContainer() {
  const navigation = useNavigation<UserMainNavigationProp>();
  const route = useRoute<BookingDetailsRouteProp>();
  const { reservationId } = route.params;

  const { data: bookingDetails, isLoading } = useReservationDetailQuery(reservationId);

  const handlePressBack = () => navigation.goBack();

  const handlePressViewPhotos = () => navigation.navigate('ViewPhotos', { reservationId });

  const handlePressWriteReview = () => navigation.navigate('WriteReview', { reservationId });

  if (!bookingDetails) {
    return (
      <UserBookingDetailsView
        onPressBack={handlePressBack}
        nickname=""
        name=""
        bookingOption=""
        date=""
        time=""
        additionalRequest=""
        status="REQUESTED"
        isLoading={isLoading}
      />
    );
  }

  const canViewPhotos = bookingDetails.status === 'DELIVERED' || bookingDetails.status === 'REVIEWED';
  const canWriteReview = bookingDetails.status === 'DELIVERED';

  // Format time from LocalTime
  const formatTime = (time: { hour: number; minute: number }) => {
    const hour = String(time.hour).padStart(2, '0');
    const minute = String(time.minute).padStart(2, '0');
    return `${hour}:${minute}`;
  };

  return (
    <UserBookingDetailsView
      onPressBack={handlePressBack}
      nickname={bookingDetails.counterpartNickname}
      name={bookingDetails.counterpartName || ''}
      bookingOption={bookingDetails.service}
      date={bookingDetails.reservationDate}
      time={formatTime(bookingDetails.startTime)}
      additionalRequest={bookingDetails.details || ''}
      status={bookingDetails.status}
      onPressViewPhotos={canViewPhotos ? handlePressViewPhotos : undefined}
      onPressWriteReview={canWriteReview ? handlePressWriteReview : undefined}
      isLoading={isLoading}
    />
  );
}
