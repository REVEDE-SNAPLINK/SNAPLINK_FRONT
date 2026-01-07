import UserBookingDetailsView from '@/screens/user/BookingDetails/UserBookingDetailsView.tsx';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useBookingDetailQuery } from '@/queries/bookings.ts';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';
import { useState, useEffect } from 'react';
import { useBookingReviewMeQuery } from '@/queries/reviews.ts';
import analytics from '@react-native-firebase/analytics';
import { useAuthStore } from '@/store/authStore.ts';

type BookingDetailsRouteProp = RouteProp<MainStackParamList, 'BookingDetails'>;

export default function UserBookingDetailsContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<BookingDetailsRouteProp>();
  const { bookingId } = route.params;
  const [shouldFetchReview, setShouldFetchReview] = useState(false);
  const { userId, userType } = useAuthStore()

  const { data: bookingDetails, isLoading } = useBookingDetailQuery(bookingId);
  const { data: bookingReview } = useBookingReviewMeQuery(shouldFetchReview ? bookingId : undefined);

  useEffect(() => {
    if (bookingReview && shouldFetchReview) {
      navigation.navigate('ReviewDetails', { review: bookingReview });
      setShouldFetchReview(false);
    }
  }, [bookingReview, shouldFetchReview, navigation]);

  useEffect(() => {
    analytics().logEvent('screen_view', {
      screen_name: 'BookingDetails',
      user_id: userId || 'anonymous',
      user_type: userType || 'guest',
    });
  }, [userId, userType]);

  const handlePressBack = () => navigation.goBack();

  const handlePressViewPhotos = () => navigation.navigate('ViewPhotos', { bookingId });

  const handlePressWriteReview = () => {
    analytics().logEvent('review_start', { booking_id: bookingId, user_id: userId });
    navigation.navigate('WriteReview', { bookingId });
  };

  const handlePressShowMyReview = () => {
    analytics().logEvent('review_view', { booking_id: bookingId, user_id: userId });
    setShouldFetchReview(true);
  };

  if (!bookingDetails) {
    return (
      <UserBookingDetailsView
        onPressBack={handlePressBack}
        name=""
        bookingOption=""
        datetime=""
        additionalRequest=""
        isLoading={isLoading}
      navigation={navigation}
    />
    );
  }

  const canViewPhotos = bookingDetails.status === 'PHOTOS_DELIVERED' || bookingDetails.status === 'USER_PHOTO_CHECK';
  const canWriteReview = !bookingDetails.isreview && bookingDetails.status === 'USER_PHOTO_CHECK';
  const canShowMyReview = bookingDetails.isreview;

  return (
    <UserBookingDetailsView
      onPressBack={handlePressBack}
      name={bookingDetails.photographerName}
      bookingOption={bookingDetails.shootingItems}
      datetime={bookingDetails.shootingDate}
      additionalRequest={bookingDetails.requestDetails}
      onPressViewPhotos={canViewPhotos ? handlePressViewPhotos : undefined}
      onPressWriteReview={canWriteReview ? handlePressWriteReview : undefined}
      onPressShowMyReview={canShowMyReview ? handlePressShowMyReview : undefined}
      isLoading={isLoading}
      navigation={navigation}
    />
  );
}
