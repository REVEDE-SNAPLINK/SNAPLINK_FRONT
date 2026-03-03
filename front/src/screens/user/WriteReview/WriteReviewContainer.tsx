import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import WriteReviewView from '@/screens/user/WriteReview/WriteReviewView.tsx';
import { useState, useCallback } from 'react';
import { Alert } from '@/components/ui/Alert';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';
import { UploadImageFile } from '@/api/photographers.ts';
import { useCreateReservationReviewMutation, useUpdateReviewMutation } from '@/mutations/reviews.ts';
import analytics from '@react-native-firebase/analytics';
import { useAuthStore } from '@/store/authStore.ts';
import { showErrorAlert } from '@/utils/error';

// Form validation constants
const MAX_IMAGES = 3;
const SHOOTING_TYPE_MIN_LENGTH = 2;
const CONTENT_MIN_LENGTH = 15;
const CONTENT_MAX_LENGTH = 1000;

export default function WriteReviewContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<RouteProp<MainStackParamList, 'WriteReview'>>();
  const { bookingId, review } = route.params;
  const { userId } = useAuthStore();

  // Determine if we're in edit mode
  const isEditMode = !!review;

  // Form state - initialize with existing review data if editing
  const [rating, setRating] = useState(review?.rating || 0);
  const [images, setImages] = useState<UploadImageFile[]>(
    review?.photos?.map((photo, index) => ({
      uri: photo.url, // 서버 URL (file://로 시작하지 않음)
      name: `review_image_${index}.${photo.url.split('.').pop() || 'jpg'}`,
      type: 'image/jpeg'
    })) || []
  );
  const [shootingType, setShootingType] = useState(review?.shootingTag || '');
  const [content, setContent] = useState(review?.content || '');

  // Track photo IDs to delete (only for edit mode)
  const [deletePhotoIds, setDeletePhotoIds] = useState<number[]>([]);

  // Check if form has any changes
  const isDirty = rating > 0 || images.length > 0 || shootingType.length > 0 || content.length > 0;

  // Mutations
  const createMutation = useCreateReservationReviewMutation();
  const updateMutation = useUpdateReviewMutation(undefined, bookingId);

  const handlePressBack = () => {
    // If user has made changes, show alert
    if (isDirty) {
      Alert.show({
        title: '후기 작성을 그만둘까요?',
        message: '작성중이던 내용은 저장되지 않아요.',
        buttons: [
          {
            text: '그만두기',
            type: 'cancel',
            onPress: () => {
              navigation.goBack();
            },
          },
          {
            text: '계속 작성',
            onPress: () => {
              // Alert가 자동으로 닫힘
            },
          },
        ],
      });
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = () => {
    // 새 이미지만 필터링 (file://로 시작하는 로컬 파일만)
    const newImages = images.filter(
      (img) => img.uri.startsWith('file://') || img.uri.startsWith('content://')
    );

    if (isEditMode && review) {
      analytics().logEvent('review_edit_complete', { review_id: review?.reviewId, user_id: userId });
      // Update existing review
      // 음수 photoId는 GetBookingReviewMeResponse에서 변환된 임시 ID이므로 제외
      const validDeletePhotoIds = deletePhotoIds.filter((id) => id > 0);
      updateMutation.mutate(
        {
          reviewId: review.reviewId,
          request: {
            rating,
            shootingTag: shootingType,
            content,
            deletePhotoIds: validDeletePhotoIds,
          },
          newImages,
        },
        {
          onSuccess: () => {
            Alert.show({
              title: '수정 완료',
              message: '리뷰가 수정되었습니다.',
            });
            navigation.goBack();
          },
          onError: (error) => {
            showErrorAlert({
              title: '수정 실패',
              action: '리뷰 수정',
              error,
            });
            console.error('Failed to update review:', error);
          },
        }
      );
    } else if (bookingId) {
      analytics().logEvent('review_create_complete', { booking_id: bookingId, user_id: userId });
      // Create new review
      createMutation.mutate(
        {
          bookingId,
          request: {
            rating,
            shootingTag: shootingType,
            content,
          },
          images: newImages,
        },
        {
          onSuccess: () => {
            Alert.show({
              title: '작성 완료',
              message: '리뷰가 작성되었습니다.',
            });
            navigation.reset({ index: 1, routes: [{ name: "Home" }, { name: "BookingHistory" }] });
          },
          onError: (error) => {
            showErrorAlert({
              title: '작성 실패',
              action: '리뷰 작성',
              error,
            });
            console.error('Failed to create review:', error);
          },
        }
      );
    }
  };

  const handleRemoveImage = useCallback(
    (index: number) => {
      const imageToRemove = images[index];

      // 기존 서버 이미지인 경우 (file://로 시작하지 않는 경우) photoId 추적
      const isExistingPhoto = !imageToRemove.uri.startsWith('file://') && !imageToRemove.uri.startsWith('content://');
      if (isExistingPhoto && review?.photos) {
        const photoToDelete = review.photos.find((photo) => photo.url === imageToRemove.uri);
        if (photoToDelete) {
          setDeletePhotoIds((prev) => [...prev, photoToDelete.photoId]);
        }
      }

      // Remove from images array
      setImages((prev) => prev.filter((_, i) => i !== index));
    },
    [images, review]
  );

  const handleAddImages = useCallback((newImages: UploadImageFile[]) => {
    setImages((prev) => [...prev, ...newImages].slice(0, MAX_IMAGES));
  }, []);

  return (
    <WriteReviewView
      headerTitle={isEditMode ? '후기 수정' : '후기 작성'}
      onPressBack={handlePressBack}
      onSubmit={handleSubmit}
      isSubmitting={createMutation.isPending || updateMutation.isPending}
      submitButtonText={isEditMode ? '수정 완료' : '작성 완료'}
      rating={rating}
      onRatingChange={setRating}
      images={images}
      maxImages={MAX_IMAGES}
      onRemoveImage={handleRemoveImage}
      onAddImages={handleAddImages}
      shootingType={shootingType}
      shootingTypeMinLength={SHOOTING_TYPE_MIN_LENGTH}
      onShootingTypeChange={setShootingType}
      content={content}
      contentMinLength={CONTENT_MIN_LENGTH}
      contentMaxLength={CONTENT_MAX_LENGTH}
      onContentChange={setContent}
      navigation={navigation}
    />
  );
}