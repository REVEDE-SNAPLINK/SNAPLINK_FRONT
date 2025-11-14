import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation';
import PhotographerDetailsView from './PhotographerDetailsView';
import {
  getPhotographerDetails,
  getPortfolioImages,
} from '@/api/photographer';

type PhotographerDetailsRouteProp = RouteProp<MainStackParamList, 'PhotographerDetails'>;

export default function PhotographerDetailsContainer() {
  const route = useRoute<PhotographerDetailsRouteProp>();
  const navigation = useNavigation<MainNavigationProp>();
  const { id: photographerId } = route.params;

  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch photographer details
  const {
    data: photographer,
    isLoading: isLoadingPhotographer,
    error: photographerError,
  } = useQuery({
    queryKey: ['photographer', photographerId],
    queryFn: () => getPhotographerDetails(photographerId),
  });

  // Fetch portfolio images with infinite scroll
  const {
    data: portfolioData,
    isLoading: isLoadingPortfolio,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['portfolio', photographerId],
    queryFn: ({ pageParam = 1 }) =>
      getPortfolioImages({
        photographerId,
        page: pageParam,
        pageSize: 18, // 6 rows of 3 images
      }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  // Flatten portfolio images from all pages
  const portfolioImages = useMemo(() => {
    if (!portfolioData) return [];
    return portfolioData.pages.flatMap((page) => page.images);
  }, [portfolioData]);

  // Handlers
  const handlePressBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handlePressUpload = useCallback(() => {
  }, []);

  const handlePressFavorite = useCallback(() => {
    setIsFavorite((prev) => !prev);
    // TODO: API call to toggle favorite
  }, []);

  const handlePressInquiry = useCallback(() => {
    // TODO: Navigate to inquiry screen or open chat
    console.log('Navigate to inquiry');
  }, []);

  const handlePressReservation = useCallback(() => {
    // TODO: Navigate to reservation screen
    console.log('Navigate to reservation');
    navigation.navigate('Booking', { id: photographerId });
  }, [navigation, photographerId]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <PhotographerDetailsView
      photographer={photographer || null}
      portfolioImages={portfolioImages}
      isLoadingPhotographer={isLoadingPhotographer}
      isFetchingNextPage={isFetchingNextPage}
      onPressBack={handlePressBack}
      onPressUpload={handlePressUpload}
      onPressFavorite={handlePressFavorite}
      onPressInquiry={handlePressInquiry}
      onPressReservation={handlePressReservation}
      onEndReached={handleEndReached}
    />
  );
}