import { useAuthStore } from '@/store/authStore';
import UserBookingDetailsContainer from '@/screens/user/BookingDetails/UserBookingDetailsContainer';
import PhotographerBookingDetailsContainer from '@/screens/photographer/BookingDetails/PhotographerBookingDetailsContainer';

/**
 * Wrapper component that renders the appropriate BookingDetails screen
 * based on user type (user vs photographer)
 */
export default function BookingDetailsContainer() {
  const { userType, isExpertMode } = useAuthStore();

  if (userType === 'photographer' && isExpertMode) {
    return <PhotographerBookingDetailsContainer />;
  }

  return <UserBookingDetailsContainer />;
}
