import { useAuthStore } from '@/store/authStore';
import UserViewPhotosContainer from '@/screens/user/ViewPhotos/UserViewPhotosContainer';
import PhotographerViewPhotosContainer from '@/screens/photographer/ViewPhotos/PhotographerViewPhotosContainer';

/**
 * Wrapper component that renders the appropriate ViewPhotos screen
 * based on user type (user vs photographer)
 */
export default function ViewPhotosContainer() {
  const { userType, isExpertMode } = useAuthStore();

  if (userType === 'photographer' && isExpertMode) {
    return <PhotographerViewPhotosContainer />;
  }

  return <UserViewPhotosContainer />;
}
