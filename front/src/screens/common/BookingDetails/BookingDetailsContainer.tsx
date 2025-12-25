import { useAuthStore } from '@/store/authStore';
import UserBookingDetailsContainer from '@/screens/user/BookingDetails/UserBookingDetailsContainer';
import PhotographerBookingDetailsContainer from '@/screens/photographer/BookingDetails/PhotographerBookingDetailsContainer';

/**
 * Wrapper component that renders the appropriate BookingDetails screen
 * based on user type (user vs photographer)
 */
export default function BookingDetailsContainer() {
  const userType = useAuthStore((state) => state.userType);

  if (userType === 'photographer') {
    return <PhotographerBookingDetailsContainer />;
  }

  return <UserBookingDetailsContainer />;
}
