import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import WriteReviewView from '@/screens/user/WriteReview/WriteReviewView.tsx';
import { useState, useCallback } from 'react';
import { Alert } from '@/components/theme/Alert';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';
import { UploadImageFile } from '@/api/photographers.ts';
import { useCreateReservationReviewMutation, useUpdateReviewMutation } from '@/mutations/reviews.ts';

// Form validation constants
const MAX_IMAGES = 3;
const SHOOTING_TYPE_MIN_LENGTH = 2;
const CONTENT_MIN_LENGTH = 15;
const CONTENT_MAX_LENGTH = 1000;

export default function WriteReviewContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<RouteProp<MainStackParamList, 'WriteReview'>>();
  const { bookingId, review } = route.params;

  // Determine if we're in edit mode
  const isEditMode = !!review;

  // Form state - initialize with existing review data if editing
  const [rating, setRating] = useState(review?.rating || 0);
  const [images, setImages] = useState<UploadImageFile[]>(
    review?.photos?.map((photo, index) => ({
      uri: photo.url,
      name: `review_image_${index}.${photo.url.split(',')[0]}`,
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
  const updateMutation = useUpdateReviewMutation();

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
    // Separate new images from existing URLs
    const newImages = images.filter(
      (img): img is UploadImageFile => typeof img === 'object' && 'uri' in img
    );

    if (isEditMode && review) {
      // Update existing review
      updateMutation.mutate(
        {
          reviewId: review.reviewId,
          request: {
            rating,
            shootingTag: shootingType,
            content,
            deletePhotoIds,
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
            Alert.show({
              title: '수정 실패',
              message: '리뷰 수정에 실패했습니다.',
            });
            console.error('Failed to update review:', error);
          },
        }
      );
    }

    if (bookingId) {
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
            navigation.navigate('BookingHistory');
          },
          onError: (error) => {
            Alert.show({
              title: '작성 실패',
              message: '리뷰 작성에 실패했습니다.',
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

      // If it's an existing photo (string URL), track its photoId for deletion
      if (typeof imageToRemove === 'string' && review?.photos) {
        const photoToDelete = review.photos.find((photo) => photo.url === imageToRemove);
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