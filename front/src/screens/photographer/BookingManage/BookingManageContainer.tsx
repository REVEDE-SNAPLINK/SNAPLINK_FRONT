import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import BookingManageView from '@/screens/photographer/BookingManage/BookingManageView.tsx';
import { Alert } from '@/components/theme';
import { usePhotographerReservationsInfiniteQuery } from '@/queries/reservations.ts';
import { usePatchReservationStatusMutation } from '@/mutations/reservations.ts';
import { MainNavigationProp } from '@/types/navigation.ts';
import { useMeQuery } from '@/queries/user.ts';

const PAGE_SIZE = 10;

export default function BookingManageContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { mutate: patchStatusMutate } = usePatchReservationStatusMutation();

  const { data: photographerProfile } = useMeQuery();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = usePhotographerReservationsInfiniteQuery({
    size: PAGE_SIZE,
    sort: ['reservedDate,desc'],
  });

  const handlePressBookingDetail = (reservationId: number) => {
    navigation.navigate('BookingDetails', { reservationId });
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handlePressViewPhotos = (reservationId: number) => navigation.navigate('ViewPhotos', { reservationId })

  const handlePressConfirmBooking = async (reservationId: number) => {
    Alert.show({
      title: '예약 수락',
      message: '예약을 수락하시겠습니까?',
      buttons: [
        { text: '취소', onPress: () => {}, type: 'cancel' },
        {
          text: '확인',
          onPress: async () => {
            patchStatusMutate({ reservationId, status: 'CONFIRMED' })
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

  const handlePressRejectBooking = async (reservationId: number) => {
    Alert.show({
      title: '예약 거절',
      message: '예약을 거절하시겠습니까?',
      buttons: [
        { text: '취소', onPress: () => {}, type: 'cancel' },
        {
          text: '확인',
          onPress: async () => {
            patchStatusMutate({ reservationId, status: 'REJECTED' })
            Alert.show({
              title: '예약 거절 완료',
              message: '예약이 거절되었습니다.',
              buttons: [{ text: '확인', onPress: () => refetch() }],
            });
          },
        },
      ],
    });
  };

  const handlePressCompleteBooking = async (reservationId: number) => {
    Alert.show({
      title: '촬영 완료',
      message: '촬영을 완료하시겠습니까?',
      buttons: [
        { text: '취소', onPress: () => {}, type: 'cancel' },
        {
          text: '확인',
          onPress: async () => {
            patchStatusMutate({ reservationId, status: 'COMPLETED' })
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

  const reservations = data?.pages.flatMap((page) => page.content) ?? [];

  return (
    <BookingManageView
      reservations={reservations}
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
      onPressCompleteBooking={handlePressCompleteBooking}
    />
  );
}