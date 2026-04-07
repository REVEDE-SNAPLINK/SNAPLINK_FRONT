import UserBookingDetailsView from '@/screens/user/BookingDetails/UserBookingDetailsView.tsx';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useBookingDetailQuery } from '@/queries/bookings.ts';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';
import { useState, useEffect } from 'react';
import { useBookingReviewMeQuery } from '@/queries/reviews.ts';
import { safeLogEvent, trackBookingEvent } from '@/utils/analytics.ts';
import { useCreateOrGetChatRoomMutation } from '@/queries/chat.ts';
import { chatQueryKeys } from '@/queries/keys.ts';
import { queryClient } from '@/config/queryClient.ts';
import { formatReservationDateTime } from '@/utils/format.ts';
import { showErrorAlert } from '@/utils/error';
import { Alert } from '@/components/ui';
import AsyncStorage from '@react-native-async-storage/async-storage';

type BookingDetailsRouteProp = RouteProp<MainStackParamList, 'BookingDetails'>;

export default function UserBookingDetailsContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<BookingDetailsRouteProp>();
  const { bookingId } = route.params;
  const [shouldFetchReview, setShouldFetchReview] = useState(false);


  const { data: bookingDetails, isLoading } = useBookingDetailQuery(bookingId);

  // isreview가 true면 미리 리뷰 데이터 확인
  const shouldPreFetchReview = bookingDetails?.isreview === true;
  const {
    data: bookingReview,
    isError: isReviewError,
    isFetched: isReviewFetched,
  } = useBookingReviewMeQuery(shouldPreFetchReview || shouldFetchReview ? bookingId : undefined);

  const { mutate: chatMutate } = useCreateOrGetChatRoomMutation();

  // 리뷰가 실제로 존재하는지 확인 (삭제된 경우 false)
  const reviewActuallyExists = shouldPreFetchReview && isReviewFetched && !isReviewError && !!bookingReview;

  useEffect(() => {
    if (bookingReview && shouldFetchReview) {
      navigation.navigate('ReviewDetails', { bookingId });
      setShouldFetchReview(false);
    }
  }, [bookingReview, shouldFetchReview, navigation, bookingId]);

  // 리뷰가 삭제된 경우 리뷰 작성 화면으로 이동
  useEffect(() => {
    if (isReviewError && shouldFetchReview) {
      Alert.show({
        title: '리뷰가 삭제되었습니다',
        message: '새로운 리뷰를 작성해주세요.',
      });
      navigation.navigate('WriteReview', { bookingId });
      setShouldFetchReview(false);
    }
  }, [isReviewError, shouldFetchReview, bookingId, navigation]);

  // 예약 상태 변화 추적 (세션 간 중복 방지: AsyncStorage)
  // 유저가 BookingDetails를 열었을 때 상태를 보고 최초 1회만 이벤트 발송
  useEffect(() => {
    if (!bookingDetails) return;

    const { status, bookingId: id, photographerId: pgId } = bookingDetails;
    if (status !== 'APPROVED' && status !== 'REJECTED') return;

    const reportOnce = async () => {
      const storageKey = `analytics:booking_status_reported:${id}`;
      try {
        const reported = await AsyncStorage.getItem(storageKey);
        const reportedStatuses: string[] = reported ? JSON.parse(reported) : [];

        if (reportedStatuses.includes(status)) return;

        if (status === 'APPROVED') {
          trackBookingEvent('booking_accepted_by_photographer', String(id), pgId);
        } else if (status === 'REJECTED') {
          trackBookingEvent('booking_rejected_by_photographer', String(id), pgId);
        }

        await AsyncStorage.setItem(storageKey, JSON.stringify([...reportedStatuses, status]));
      } catch {
        // AsyncStorage 실패해도 앱 동작에 영향 없음
      }
    };

    reportOnce();
  }, [bookingDetails]);

  const handlePressBack = () => navigation.goBack();

  const handlePressViewPhotos = () => navigation.navigate('ViewPhotos', { bookingId });

  const handlePressWriteReview = () => {
    safeLogEvent('review_start', { booking_id: bookingId });
    navigation.navigate('WriteReview', { bookingId });
  };

  const handlePressShowMyReview = () => {
    safeLogEvent('review_view', { booking_id: bookingId });
    // 이미 pre-fetch된 데이터가 있으면 바로 네비게이션
    if (bookingReview) {
      navigation.navigate('ReviewDetails', { bookingId });
    } else {
      setShouldFetchReview(true);
    }
  };

  const handleOpenChatRoom = () => {
    chatMutate(
      { receiverId: bookingDetails?.photographerId ?? '' },
      {
        onSuccess: (roomId) => {
          queryClient.invalidateQueries({ queryKey: chatQueryKeys.rooms() });

          navigation.navigate('ChatDetails', {
            roomId
          });
        },
        onError: (error) => {
          showErrorAlert({
            title: '채팅방 열기 실패',
            action: '채팅방 열기',
            error,
          });
        },
      },
    );
  }

  if (!bookingDetails) {
    return (
      <UserBookingDetailsView
        onPressBack={handlePressBack}
        name=""
        bookingOption=""
        datetime=""
        region=""
        additionalRequest=""
        isLoading={isLoading}
        onOpenChatRoom={() => { }}
        navigation={navigation}
      />
    );
  }

  const canViewPhotos = bookingDetails.status === 'PHOTOS_DELIVERED' || bookingDetails.status === 'USER_PHOTO_CHECK';
  // 리뷰가 실제로 존재하는지 확인 (서버에서 isreview=true여도 삭제된 경우 리뷰 작성 버튼 표시)
  const canWriteReview = bookingDetails.status === 'USER_PHOTO_CHECK' && !reviewActuallyExists;
  const canShowMyReview = reviewActuallyExists;

  return (
    <UserBookingDetailsView
      onPressBack={handlePressBack}
      name={bookingDetails.photographerName}
      bookingOption={bookingDetails.shootingItems}
      datetime={formatReservationDateTime(bookingDetails.shootingDate, bookingDetails.startTime, bookingDetails.endTime)}
      region={bookingDetails.region}
      additionalRequest={bookingDetails.requestDetails}
      onPressViewPhotos={canViewPhotos ? handlePressViewPhotos : undefined}
      onPressWriteReview={canWriteReview ? handlePressWriteReview : undefined}
      onPressShowMyReview={canShowMyReview ? handlePressShowMyReview : undefined}
      onOpenChatRoom={handleOpenChatRoom}
      isLoading={isLoading}
      navigation={navigation}
    />
  );
}
