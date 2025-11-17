import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { MainNavigationProp } from '@/types/navigation.ts';
import BookingHistoryView from '@/screens/user/BookingHistory/BookingHistoryView.tsx';
import { getUserBookingHistory } from '@/api/photographer';
import { userQueryKeys } from '@/api/queryKeys';

const PAGE_SIZE = 10;
const DUMMY_USER_ID = 'user-1'; // TODO: Replace with actual user ID from auth context

export default function BookingHistoryContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: userQueryKeys.bookingHistory(DUMMY_USER_ID),
    queryFn: ({ pageParam = 1 }) =>
      getUserBookingHistory({
        userId: DUMMY_USER_ID,
        page: pageParam,
        pageSize: PAGE_SIZE,
      }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  const handlePressBack = () => navigation.goBack();

  const handlePressBookingDetail = (bookingId: string) => {
    navigation.navigate('BookingDetails', { id: bookingId });
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handlePressViewPhotos = (bookingId: string) => {
    // TODO: Navigate to photo gallery screen
    console.log('View photos for booking:', bookingId);
  };

  const handlePressWriteReview = (bookingId: string) => {
    // TODO: Navigate to review writing screen
    console.log('Write review for booking:', bookingId);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const bookings = data?.pages.flatMap((page) => page.bookings) ?? [];

  return (
    <BookingHistoryView
      onPressBack={handlePressBack}
      bookings={bookings}
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
    />
  );
}