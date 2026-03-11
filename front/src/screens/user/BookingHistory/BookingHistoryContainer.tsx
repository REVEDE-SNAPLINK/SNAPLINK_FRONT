import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import BookingHistoryView from '@/screens/user/BookingHistory/BookingHistoryView.tsx';
import { useUserBookingsInfiniteQuery } from '@/queries/bookings.ts'
import { MainNavigationProp } from '@/types/navigation.ts';
import { useBookingReviewMeQuery } from '@/queries/reviews.ts';
import { reviewsQueryKeys } from '@/queries/keys.ts';
import { trackScreenView, safeLogEvent } from '@/utils/analytics.ts';
import { useCancelBookingFromCustomerMutation } from '@/mutations/bookings.ts';
import { Alert } from '@/components/ui';
import { useQueryClient } from '@tanstack/react-query';
import { GetBookingReviewMeResponse } from '@/api/reviews.ts';

const PAGE_SIZE = 10;

export default function BookingHistoryContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | undefined>(undefined);
  const [deletedReviewBookingIds, setDeletedReviewBookingIds] = useState<Set<number>>(new Set());

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

  const { data: bookingReview, isError: isReviewError } = useBookingReviewMeQuery(selectedBookingId);
  const cancelBookingMutation = useCancelBookingFromCustomerMutation();

  useFocusEffect(
    useCallback(() => {
      trackScreenView('BookingHistory');
    }, [])
  );

  useEffect(() => {
    if (bookingReview && selectedBookingId) {
      navigation.navigate('ReviewDetails', { bookingId: selectedBookingId });
      setSelectedBookingId(undefined);
    }
  }, [bookingReview, selectedBookingId, navigation]);

  // 리뷰가 삭제된 경우 리뷰 작성 화면으로 이동하고 삭제된 리뷰 목록에 추가
  useEffect(() => {
    if (isReviewError && selectedBookingId) {
      setDeletedReviewBookingIds(prev => new Set([...prev, selectedBookingId]));
      Alert.show({
        title: '리뷰가 삭제되었습니다',
        message: '새로운 리뷰를 작성해주세요.',
      });
      navigation.navigate('WriteReview', { bookingId: selectedBookingId });
      setSelectedBookingId(undefined);
    }
  }, [isReviewError, selectedBookingId, navigation]);

  const handlePressBack = () => navigation.goBack();

  const handlePressBookingDetail = (bookingId: number) => {
    safeLogEvent('booking_detail_view', { booking_id: bookingId });
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
      message: '취소 후에는 다시 되돌릴 수 없습니다. 무분별하거나 고의적인 반복 취소는 운영 정책에 따라 서비스 이용에 제한을 받을 수 있습니다.',
      buttons: [
        { text: '뒤로', type: 'cancel', onPress: () => { } },
        {
          text: '확인', onPress: () => {
            cancelBookingMutation.mutate(bookingId, {
              onSuccess: () => {
                // 고객 측 예약 취소 이벤트
                safeLogEvent('booking_cancelled_by_user', {
                  booking_id: bookingId,
                  cancel_stage: 'requested', // WAITING_FOR_APPROVAL 상태에서만 취소 가능
                });

                Alert.show({
                  title: '취소 완료',
                  message: '취소가 완료되었습니다.'
                })
              }
            });
          }
        },
      ]
    })
  }

  const handlePressViewPhotos = (bookingId: number) => navigation.navigate('ViewPhotos', { bookingId })

  const handlePressWriteReview = (bookingId: number) => {
    safeLogEvent('review_start', { booking_id: bookingId });
    navigation.navigate('WriteReview', { bookingId });
  };

  const handlePressShowMyReview = useCallback((bookingId: number) => {
    // 캐시에 데이터가 있으면 바로 네비게이션
    const cachedReview = queryClient.getQueryData<GetBookingReviewMeResponse>(
      reviewsQueryKeys.bookingReviewMe(bookingId)
    );

    if (cachedReview) {
      navigation.navigate('ReviewDetails', { bookingId });
    } else {
      // 캐시에 없으면 쿼리 트리거
      setSelectedBookingId(bookingId);
    }
  }, [queryClient, navigation]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // 삭제된 리뷰가 있는 예약은 isReview를 false로 변경
  const reservations = useMemo(() => {
    const rawReservations = data?.pages.flatMap((page) => page.content) ?? [];
    return rawReservations.map((reservation) => {
      if (deletedReviewBookingIds.has(reservation.bookingId)) {
        return { ...reservation, isReview: false };
      }
      return reservation;
    });
  }, [data?.pages, deletedReviewBookingIds]);

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