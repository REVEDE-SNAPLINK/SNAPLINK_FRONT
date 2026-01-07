import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import BookingHistoryView from '@/screens/user/BookingHistory/BookingHistoryView.tsx';
import { useUserBookingsInfiniteQuery } from '@/queries/bookings.ts'
import { MainNavigationProp } from '@/types/navigation.ts';
import { useBookingReviewMeQuery } from '@/queries/reviews.ts';
import analytics from '@react-native-firebase/analytics';
import { useAuthStore } from '@/store/authStore.ts';
import { useCancelBookingFromCustomerMutation } from '@/mutations/bookings.ts';
import { Alert } from '@/components/theme';

const PAGE_SIZE = 10;

export default function BookingHistoryContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | undefined>(undefined);
  const { userId, userType } = useAuthStore();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useUserBookingsInfiniteQuery({
    size: PAGE_SIZE,
    sort: ['shootingDate,desc'],
  })

  const { data: bookingReview } = useBookingReviewMeQuery(selectedBookingId);
  const cancelBookingMutation = useCancelBookingFromCustomerMutation();

  useEffect(() => {
    analytics().logEvent('screen_view', {
      screen_name: 'BookingHistory',
      user_id: userId || 'anonymous',
      user_type: userType || 'guest',
    });
  }, [userId, userType]);

  useEffect(() => {
    if (bookingReview && selectedBookingId) {
      navigation.navigate('ReviewDetails', { review: bookingReview });
      setSelectedBookingId(undefined);
    }
  }, [bookingReview, selectedBookingId, navigation]);

  const handlePressBack = () => navigation.goBack();

  const handlePressBookingDetail = (bookingId: number) => {
    analytics().logEvent('booking_detail_view', { booking_id: bookingId, user_id: userId });
    navigation.navigate('BookingDetails', { bookingId });
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handlePressCancelBooking = (bookingId: number) => {
    Alert.show({
      title: '예약을 취소하시겠습니까?',
      message: '취소 후에는 되돌릴 수 없습니다. 고의적인 취소는 제제의 대상이 될 수 있습니다.',
      buttons: [
        { text: '뒤로', type: 'cancel', onPress: () => {} },
        { text: '확인', onPress: () => {
            cancelBookingMutation.mutate(bookingId, {
              onSuccess: () => {
                Alert.show({
                  title: '취소 완료',
                  message: '취소가 완료되었습니다.'
                })
              }
            });
        }},
      ]
    })
  }

  const handlePressViewPhotos = (bookingId: number) => navigation.navigate('ViewPhotos', { bookingId })

  const handlePressWriteReview = (bookingId: number) => {
    analytics().logEvent('review_start', { booking_id: bookingId, user_id: userId });
    navigation.navigate('WriteReview', { bookingId });
  };

  const handlePressShowMyReview = (bookingId: number) => {
    setSelectedBookingId(bookingId);
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const reservations = data?.pages.flatMap((page) => page.content) ?? [];

  return (
    <BookingHistoryView
      onPressBack={handlePressBack}
      reservations={reservations}
      isLoading={isLoading}
      isError={isError}
      onLoadMore={handleLoadMore}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      onPressBookingDetail={handlePressBookingDetail}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      onPressCancelBooking={handlePressCancelBooking}
      onPressViewPhotos={handlePressViewPhotos}
      onPressWriteReview={handlePressWriteReview}
      onPressShowMyReivew={handlePressShowMyReview}
      navigation={navigation}
    />
  );
}