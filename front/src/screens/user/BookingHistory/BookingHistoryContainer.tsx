import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import BookingHistoryView from '@/screens/user/BookingHistory/BookingHistoryView.tsx';
import { useUserBookingsInfiniteQuery } from '@/queries/bookings.ts'
import { MainNavigationProp } from '@/types/navigation.ts';
import { useBookingReviewMeQuery } from '@/queries/reviews.ts';

const PAGE_SIZE = 10;

export default function BookingHistoryContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | undefined>(undefined);

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

  useEffect(() => {
    if (bookingReview && selectedBookingId) {
      navigation.navigate('ReviewDetails', { review: bookingReview });
      setSelectedBookingId(undefined);
    }
  }, [bookingReview, selectedBookingId, navigation]);

  const handlePressBack = () => navigation.goBack();

  const handlePressBookingDetail = (bookingId: number) => {
    navigation.navigate('BookingDetails', { bookingId });
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handlePressViewPhotos = (bookingId: number) => navigation.navigate('ViewPhotos', { bookingId })

  const handlePressWriteReview = (bookingId: number) => navigation.navigate('WriteReview', { bookingId })

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
      onPressViewPhotos={handlePressViewPhotos}
      onPressWriteReview={handlePressWriteReview}
      onPressShowMyReivew={handlePressShowMyReview}
      navigation={navigation}
    />
  );
}