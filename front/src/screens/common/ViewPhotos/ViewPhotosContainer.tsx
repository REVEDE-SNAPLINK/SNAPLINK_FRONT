import { useAuthStore } from '@/store/authStore';
import { useRoute, RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '@/types/navigation';
import { useBookingDetailQuery } from '@/queries/bookings';
import UserViewPhotosContainer from '@/screens/user/ViewPhotos/UserViewPhotosContainer';
import PhotographerViewPhotosContainer from '@/screens/photographer/ViewPhotos/PhotographerViewPhotosContainer';
import { ActivityIndicator, View } from 'react-native';

/**
 * Wrapper component that renders the appropriate ViewPhotos screen
 * based on the user's role in the specific booking (not just user type)
 */
export default function ViewPhotosContainer() {
  const route = useRoute<RouteProp<MainStackParamList, 'ViewPhotos'>>();
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
    return <PhotographerViewPhotosContainer />;
  }

  return <UserViewPhotosContainer />;
}
