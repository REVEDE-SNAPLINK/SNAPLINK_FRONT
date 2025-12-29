import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import BookingManageView from '@/screens/photographer/BookingManage/BookingManageView.tsx';
import { Alert } from '@/components/theme';
import { usePhotographerBookingsInfiniteQuery } from '@/queries/reservations.ts';
import { useApproveBookingMutation, useCompleteBookingMutation } from '@/mutations/reservations.ts';
import { MainNavigationProp } from '@/types/navigation.ts';
import { useMeQuery } from '@/queries/user.ts';

const PAGE_SIZE = 10;

export default function BookingManageContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { mutate: approveMutation } = useApproveBookingMutation();
  const { mutate: completeMutaion } = useCompleteBookingMutation();

  const { data: photographerProfile } = useMeQuery();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = usePhotographerBookingsInfiniteQuery({
    size: PAGE_SIZE,
    sort: ['reservedDate,desc'],
  });

  const handlePressBookingDetail = (bookingId: number) => {
    navigation.navigate('BookingDetails', { bookingId });
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handlePressViewPhotos = (bookingId: number) => navigation.navigate('ViewPhotos', { reservationId: bookingId })

  const handlePressConfirmBooking = async (bookingId: number) => {
    Alert.show({
      title: '예약 수락',
      message: '예약을 수락하시겠습니까?',
      buttons: [
        { text: '취소', onPress: () => {}, type: 'cancel' },
        {
          text: '확인',
          onPress: async () => {
            approveMutation({ bookingId })
            Alert.show({
              title: '예약 수락 완료',
              message: '예약이 수락되었습니다.',
              buttons: [{ text: '확인', onPress: () => refetch() }],
            });
          },
        },
      ],
    });
  };

  const handlePressRejectBooking = (bookingId: number) => {
    navigation.navigate('BookingReject', { bookingId });
  };

  const handlePressCancelBooking = (bookingId: number) => {
    navigation.navigate('BookingCancel', { bookingId });
  };

  const handlePressCompleteBooking = async (bookingId: number) => {
    Alert.show({
      title: '촬영 완료',
      message: '촬영을 완료하시겠습니까?',
      buttons: [
        { text: '취소', onPress: () => {}, type: 'cancel' },
        {
          text: '확인',
          onPress: async () => {
            completeMutaion({ bookingId })
            Alert.show({
              title: '촬영 완료',
              message: '촬영이 완료되었습니다.',
              buttons: [{ text: '확인', onPress: () => refetch() }],
            });
          },
        },
      ],
    });
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const bookings = data?.pages.flatMap((page) => page.content) ?? [];

  return (
    <BookingManageView
      bookings={bookings}
      photographerProfile={photographerProfile ?? { nickname: '', name: '', email: '', profileImageURI: '' }}
      isLoading={isLoading}
      isError={isError}
      onLoadMore={handleLoadMore}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      onPressBookingDetail={handlePressBookingDetail}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      onPressViewPhotos={handlePressViewPhotos}
      onPressConfirmBooking={handlePressConfirmBooking}
      onPressRejectBooking={handlePressRejectBooking}
      onPressCancelBooking={handlePressCancelBooking}
      onPressCompleteBooking={handlePressCompleteBooking}
    />
  );
}