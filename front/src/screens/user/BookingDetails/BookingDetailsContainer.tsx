import BookingDetailsView from '@/screens/user/BookingDetails/BookingDetailsView.tsx';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';
import { useQuery } from '@tanstack/react-query';
import { getBookingDetails } from '@/api/photographer.ts';
import { userQueryKeys } from '@/api/queryKeys.ts';

type BookingDetailsRouteProp = RouteProp<MainStackParamList, 'BookingDetails'>;

export default function BookingDetailsContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<BookingDetailsRouteProp>();
  const { id: bookingId } = route.params;

  const { data: bookingDetails, isLoading } = useQuery({
    queryKey: userQueryKeys.bookingDetails(bookingId),
    queryFn: () => getBookingDetails(bookingId),
  });

  const handlePressBack = () => navigation.goBack();

  const handlePressViewPhotos = () => navigation.navigate('ViewPhotos', { id: bookingId })

  const handlePressWriteReview = () => navigation.navigate('WriteReview', { id: bookingId })

  if (!bookingDetails) {
    return (
      <BookingDetailsView
        onPressBack={handlePressBack}
        nickname=""
        name=""
        bookingOption=""
        date=""
        time=""
        additionalRequest=""
        isLoading={isLoading}
      />
    );
  }

  const isCompleted = bookingDetails.status === 'completed';

  return (
    <BookingDetailsView
      onPressBack={handlePressBack}
      nickname={bookingDetails.photographerNickname}
      name={bookingDetails.photographerName}
      bookingOption={bookingDetails.requiredOption}
      date={bookingDetails.bookingDate}
      time={bookingDetails.bookingTime}
      additionalRequest={bookingDetails.additionalRequest}
      isCompleted={isCompleted}
      onPressViewPhotos={isCompleted ? handlePressViewPhotos : undefined}
      onPressWriteReview={isCompleted ? handlePressWriteReview : undefined}
      isLoading={isLoading}
    />
  )
}