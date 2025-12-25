import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';
import ReviewPhotosView from '@/screens/common/ReviewPhotos/ReviewPhotosView.tsx';
import { usePhotographerReviewSummaryQuery } from '@/queries/photographers.ts';

type ReviewPhotosRouteProp = RouteProp<MainStackParamList, 'ReviewPhotos'>;

export default function ReviewPhotosContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<ReviewPhotosRouteProp>();

  const { photographerId } = route.params;

  // Fetch review summary (includes topPhotoKeys - 최신 사진 10개)
  const { data: reviewSummary } = usePhotographerReviewSummaryQuery(photographerId);

  const photos = reviewSummary?.topPhotoKeys.map((photoKey, index) => ({
    id: String(index),
    url: photoKey,
  })) || [];

  const handlePressBack = () => navigation.goBack();

  const handlePressPhoto = (photoId: string) => {
    // TODO: Open fullscreen image viewer
    console.log('Open photo:', photoId);
  };

  return (
    <ReviewPhotosView
      photos={photos}
      onPressBack={handlePressBack}
      onPressPhoto={handlePressPhoto}
    />
  );
}
