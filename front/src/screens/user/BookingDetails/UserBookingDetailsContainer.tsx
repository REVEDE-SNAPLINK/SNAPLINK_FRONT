import UserBookingDetailsView from '@/screens/user/BookingDetails/UserBookingDetailsView.tsx';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useBookingDetailQuery } from '@/queries/bookings.ts';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';
import { useState, useEffect } from 'react';
import { useBookingReviewMeQuery } from '@/queries/reviews.ts';
import analytics from '@react-native-firebase/analytics';
import { useAuthStore } from '@/store/authStore.ts';
import { useCreateOrGetChatRoomMutation } from '@/queries/chat.ts';
import { chatQueryKeys } from '@/queries/keys.ts';
import { queryClient } from '@/config/queryClient.ts';
import { formatReservationDateTime } from '@/utils/format.ts';
import { showErrorAlert } from '@/utils/error';
import { Alert } from '@/components/ui';

type BookingDetailsRouteProp = RouteProp<MainStackParamList, 'BookingDetails'>;

export default function UserBookingDetailsContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<BookingDetailsRouteProp>();
  const { bookingId } = route.params;
  const [shouldFetchReview, setShouldFetchReview] = useState(false);
  const { userId, userType } = useAuthStore()

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
        onOpenChatRoom={() => {}}
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
