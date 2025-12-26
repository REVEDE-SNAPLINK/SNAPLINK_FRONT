import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import BookingHistoryView from '@/screens/user/BookingHistory/BookingHistoryView.tsx';
import { useUserReservationsInfiniteQuery } from '@/queries/reservations'
import { MainNavigationProp } from '@/types/navigation.ts';

const PAGE_SIZE = 10;

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
  } = useUserReservationsInfiniteQuery({
    size: PAGE_SIZE,
    sort: ['reservedDate,desc'],
  })

  const handlePressBack = () => navigation.goBack();

  const handlePressBookingDetail = (reservationId: number) => {
    navigation.navigate('BookingDetails', { reservationId });
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handlePressViewPhotos = (reservationId: number) => navigation.navigate('ViewPhotos', { reservationId })

  const handlePressWriteReview = (reservationId: number) => navigation.navigate('WriteReview', { reservationId })

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
    />
  );
}