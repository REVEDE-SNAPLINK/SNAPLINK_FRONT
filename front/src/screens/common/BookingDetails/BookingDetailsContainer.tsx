import { useAuthStore } from '@/store/authStore';
import { useRoute, RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '@/types/navigation';
import { useBookingDetailQuery } from '@/queries/bookings';
import UserBookingDetailsContainer from '@/screens/user/BookingDetails/UserBookingDetailsContainer';
import PhotographerBookingDetailsContainer from '@/screens/photographer/BookingDetails/PhotographerBookingDetailsContainer';
import { ActivityIndicator, View } from 'react-native';

/**
 * Wrapper component that renders the appropriate BookingDetails screen
 * based on the user's role in the specific booking (not just user type)
 */
export default function BookingDetailsContainer() {
  const route = useRoute<RouteProp<MainStackParamList, 'BookingDetails'>>();
  const { bookingId } = route.params;
  const { userId } = useAuthStore();

  const { data: booking, isLoading } = useBookingDetailQuery(bookingId);

  if (isLoading || !booking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 이 예약에서 현재 사용자가 작가인지 확인
  const isPhotographerInThisBooking = booking.photographerId === userId;

  if (isPhotographerInThisBooking) {
    return <PhotographerBookingDetailsContainer />;
  }

  return <UserBookingDetailsContainer />;
}
