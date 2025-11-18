import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';
import WriteReviewView from '@/screens/user/WriteReview/WriteReviewView.tsx';
import { useState } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
// import { useMutation } from '@tanstack/react-query';

/**
 * Request payload for writing a review
 */
// interface WriteReviewRequest {
//   bookingId: string;
//   rating: number;
//   images: string[]; // array of image URIs
//   shootingType: string;
//   content: string;
// }

/**
 * Response type for writing a review
 */
// interface WriteReviewResponse {
//   reviewId: string;
//   createdAt: string;
// }

/**
 * Submit review to API
 * TODO: Replace with actual API call when backend is ready
 *
 * API endpoint will be: POST /api/reviews
 * Body: WriteReviewRequest
 */
// async function submitReview(request: WriteReviewRequest): Promise<WriteReviewResponse> {
//   // Simulate API delay
//   await new Promise((resolve) => setTimeout(resolve, 1000));
//
//   // TODO: Replace with actual API call
//   // const response = await fetch('/api/reviews', {
//   //   method: 'POST',
//   //   headers: { 'Content-Type': 'application/json' },
//   //   body: JSON.stringify(request),
//   // });
//   // const data = await response.json();
//   // return data;
//
//   return {
//     reviewId: 'review-' + Date.now(),
//     createdAt: new Date().toISOString(),
//   };
// }

// Form validation constants
const MAX_IMAGES = 10;
const SHOOTING_TYPE_MIN_LENGTH = 2;
const CONTENT_MIN_LENGTH = 15;
const CONTENT_MAX_LENGTH = 1000;

export default function WriteReviewContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<RouteProp<MainStackParamList, 'WriteReview'>>();
  const { id: bookingId } = route.params;

  // Form state
  const [rating, setRating] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [shootingType, setShootingType] = useState('');
  const [content, setContent] = useState('');

  // Alert state
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // Check if form has any changes
  const isDirty = rating > 0 || images.length > 0 || shootingType.length > 0 || content.length > 0;

  // TODO: Uncomment when API is ready
  // const mutation = useMutation({
  //   mutationFn: submitReview,
  //   onSuccess: (data) => {
  //     // Navigate back to booking history or booking details
  //     navigation.navigate('BookingHistory');
  //     // Optionally show success toast
  //   },
  //   onError: (error) => {
  //     // Handle error - show error toast or alert
  //     console.error('Failed to submit review:', error);
  //   },
  // });

  const handlePressBack = () => {
    // If user has made changes, show alert
    if (isDirty) {
      setIsAlertOpen(true);
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = () => {
    // TODO: Uncomment when API is ready
    // mutation.mutate({
    //   bookingId,
    //   rating,
    //   images,
    //   shootingType,
    //   content,
    // });

    // Temporary: Just navigate back
    console.log('Review submitted:', { bookingId, rating, images, shootingType, content });
    navigation.navigate('BookingHistory');
  };

  const handleAlertClose = () => {
    setIsAlertOpen(false);
  };

  const handleAlertCancel = () => {
    // User chose to quit writing review
    setIsAlertOpen(false);
    navigation.goBack();
  };

  const handleAlertConfirm = () => {
    // User chose to continue writing review
    setIsAlertOpen(false);
  };

  const handleImageSelect = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: MAX_IMAGES - images.length, // 최대 MAX_IMAGES개까지만 선택 가능
      quality: 0.8,
    });

    if (result.assets && !result.didCancel) {
      const newImages = result.assets
        .filter((asset) => asset.uri)
        .map((asset) => asset.uri as string);

      setImages([...images, ...newImages].slice(0, MAX_IMAGES)); // 최대 MAX_IMAGES개 제한
    }
  };

  return (
    <WriteReviewView
      onPressBack={handlePressBack}
      onSubmit={handleSubmit}
      isAlertOpen={isAlertOpen}
      onAlertClose={handleAlertClose}
      onAlertCancel={handleAlertCancel}
      onAlertConfirm={handleAlertConfirm}
      rating={rating}
      onRatingChange={setRating}
      images={images}
      maxImages={MAX_IMAGES}
      onImageSelect={handleImageSelect}
      shootingType={shootingType}
      shootingTypeMinLength={SHOOTING_TYPE_MIN_LENGTH}
      onShootingTypeChange={setShootingType}
      content={content}
      contentMinLength={CONTENT_MIN_LENGTH}
      contentMaxLength={CONTENT_MAX_LENGTH}
      onContentChange={setContent}
      // isSubmitting={mutation.isPending} // TODO: Uncomment when API is ready
    />
  );
}