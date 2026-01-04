import { useMemo, useState } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';
import ReviewPhotosView from '@/screens/common/ReviewPhotos/ReviewPhotosView.tsx';
import { usePhotographerReviewsInfiniteQuery } from '@/queries/photographers.ts';

type ReviewPhotosRouteProp = RouteProp<MainStackParamList, 'ReviewPhotos'>;

export default function ReviewPhotosContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<ReviewPhotosRouteProp>();

  const { photographerId } = route.params;

  // Fetch all reviews with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = usePhotographerReviewsInfiniteQuery(photographerId, { size: 20 });

  // Extract all photoKeys from all reviews
  const photos = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) => page.content.flatMap((review) => review.photoKeys));
  }, [data]);

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const handlePressBack = () => navigation.goBack();

  const handlePressPhoto = (photoUrl: string) => {
    const index = photos.findIndex((url) => url === photoUrl);
    if (index !== -1) {
      setSelectedPhotoIndex(index);
    }
  };

  const handleCloseModal = () => {
    setSelectedPhotoIndex(null);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <ReviewPhotosView
      photos={photos}
      onPressBack={handlePressBack}
      onPressPhoto={handlePressPhoto}
      selectedPhotoIndex={selectedPhotoIndex}
      onCloseModal={handleCloseModal}
      onLoadMore={handleLoadMore}
      isFetchingNextPage={isFetchingNextPage}
      isLoading={isLoading}
      navigation={navigation}
    />
  );
}
