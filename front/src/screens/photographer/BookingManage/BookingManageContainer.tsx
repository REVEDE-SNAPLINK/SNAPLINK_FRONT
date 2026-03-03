import { useState } from 'react';
import analytics from '@react-native-firebase/analytics';
import { useNavigation } from '@react-navigation/native';
import BookingManageView from '@/screens/photographer/BookingManage/BookingManageView.tsx';
import { Alert } from '@/components/ui';
import { usePhotographerBookingsInfiniteQuery } from '@/queries/bookings.ts';
import { useApproveBookingMutation, useCompleteBookingMutation } from '@/mutations/bookings.ts';
import { MainNavigationProp } from '@/types/navigation.ts';
import { useMeQuery } from '@/queries/user.ts';
import { useAuthStore } from '@/store/authStore.ts';
import { showErrorAlert } from '@/utils/error';

const PAGE_SIZE = 10;

export default function BookingManageContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { userId } = useAuthStore();

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
    sort: ['shootingDate,desc'],
  });

  const handlePressBack = () => navigation.goBack();

  const handlePressBookingDetail = (bookingId: number) => {
    analytics().logEvent('photographer_booking_detail_view', {
      user_id: userId,
      user_type: 'photographer',
      bookingId,
    });
    navigation.navigate('BookingDetails', { bookingId });
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handlePressViewPhotos = (bookingId: number) => {
    analytics().logEvent('photographer_booking_photos_view', {
      user_id: userId,
      user_type: 'photographer',
      bookingId,
    });
    navigation.navigate('ViewPhotos', { bookingId });
  }

  const handlePressConfirmBooking = async (bookingId: number) => {
    Alert.show({
      title: '현재 예약을 수락하겠습니까?',
      message: '동일한 시간 접수된 다른 예약 촬영 건은 자동으로 거절됩니다.',
      buttons: [
        { text: '취소', onPress: () => {}, type: 'cancel' },
        {
          text: '확인',
          onPress: async () => {
            approveMutation(
              { bookingId },
              {
                onSuccess: () => {
                  analytics().logEvent('photographer_booking_approved', {
                    user_id: userId,
                    user_type: 'photographer',
                    bookingId,
                  });
                  Alert.show({
                    title: '예약 수락 완료',
                    message: '수락이 완료되었습니다.',
                    buttons: [{ text: '확인', onPress: () => refetch() }],
                  });
                },
                onError: (error) => {
                  showErrorAlert({
                    title: '예약 수락 실패',
                    action: '예약 수락',
                    error,
                  });
                },
              }
            );
          },
        },
      ],
    });
  };

  const handlePressRejectBooking = (bookingId: number) => {
    analytics().logEvent('photographer_booking_rejected', {
      user_id: userId,
      user_type: 'photographer',
      bookingId,
    });
    navigation.navigate('BookingReject', { bookingId });
  };

  const handlePressCancelBooking = (bookingId: number) => {
    navigation.navigate('BookingCancel', { bookingId });
  };

  const handlePressCompleteBooking = async (bookingId: number) => {
    Alert.show({
      title: '촬영을 완료하시겠습니까?',
      message: '완료로 전환 후 사진 결과물을 업로드할 수 있습니다.',
      buttons: [
        { text: '취소', onPress: () => {}, type: 'cancel' },
        {
          text: '확인',
          onPress: async () => {
            completeMutaion(
              { bookingId },
              {
                onSuccess: () => {
                  analytics().logEvent('photographer_booking_completed', {
                    user_id: userId,
                    user_type: 'photographer',
                    bookingId,
                  });
                  Alert.show({
                    title: '촬영 완료',
                    message: '촬영이 완료되었습니다.',
                    buttons: [{ text: '확인', onPress: () => refetch() }],
                  });
                },
                onError: (error) => {
                  showErrorAlert({
                    title: '촬영 완료 실패',
                    action: '촬영 완료 처리',
                    error,
                  });
                },
              }
            );
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
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      onLoadMore={handleLoadMore}
      onPressBack={handlePressBack}
      onPressBookingDetail={handlePressBookingDetail}
      onPressViewPhotos={handlePressViewPhotos}
      onPressConfirmBooking={handlePressConfirmBooking}
      onPressRejectBooking={handlePressRejectBooking}
      onPressCancelBooking={handlePressCancelBooking}
      onPressCompleteBooking={handlePressCompleteBooking}
      navigation={navigation}
    />
  );
}