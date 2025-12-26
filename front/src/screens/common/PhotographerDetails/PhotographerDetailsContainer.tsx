import React, { useState, useCallback, useMemo } from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { MainStackParamList, MainNavigationProp } from '@/types/navigation.ts';
import PhotographerDetailsView from './PhotographerDetailsView.tsx';
import { usePhotographerProfileInfiniteQuery, usePhotographerReviewSummaryQuery } from '@/queries/photographers.ts';
import { useTogglePhotographerScrapMutation } from '@/mutations/photographer.ts';
import { LatestReviewSummaryItem } from '@/api/photographers.ts';

type PhotographerDetailsRouteProp = RouteProp<MainStackParamList, 'PhotographerDetails'>;

export default function PhotographerDetailsContainer() {
  const route = useRoute<PhotographerDetailsRouteProp>();
  const navigation = useNavigation<MainNavigationProp>();
  const { photographerId } = route.params;

  const [activeTab, setActiveTab] = useState<'portfolio' | 'reviews'>('portfolio');

  // Fetch photographer profile (includes portfolio thumbnails)
  const {
    data: profilePages,
    isLoading: isLoadingPhotographer,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePhotographerProfileInfiniteQuery(photographerId, { size: 18 });

  // Fetch review summary
  const { data: reviewSummary } = usePhotographerReviewSummaryQuery(photographerId);

  // Scrap mutation
  const scrapMutation = useTogglePhotographerScrapMutation();

  // Get photographer data from first page (profile info is same across all pages)
  const profileData = useMemo(() => {
    if (!profilePages?.pages?.[0]) return null;
    return profilePages.pages[0];
  }, [profilePages]);

  // Flatten all portfolios from all pages
  const allPortfolios = useMemo(() => {
    if (!profilePages?.pages) return [];
    return profilePages.pages.flatMap((page) => page.portfolios || []);
  }, [profilePages]);

  // Handlers
  const handlePressBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handlePressUpload = useCallback(() => {
    // TODO: Navigate to portfolio upload screen
    navigation.navigate('PortfolioOnboarding');
  }, [navigation]);

  const handlePressFavorite = useCallback(() => {
    scrapMutation.mutate(photographerId);
  }, [scrapMutation, photographerId]);

  const handlePressInquiry = useCallback(() => {
    // TODO: Open chat with photographer
    // Use createOrGetChatRoom mutation
    console.log('Navigate to inquiry');
  }, []);

  const handlePressReservation = useCallback(() => {
    navigation.navigate('Booking', { photographerId });
  }, [navigation, photographerId]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleTabChange = useCallback((tab: 'portfolio' | 'reviews') => {
    setActiveTab(tab);
  }, []);

  const handlePressPortfolioImage = useCallback((imageId: number) => {
    navigation.navigate('PostDetail', { postId: imageId });
  }, [navigation]);

  const handlePressShowAllReviews = useCallback(() => {
    navigation.navigate('Reviews', { photographerId });
  }, [navigation, photographerId]);

  const handlePressShowAllReviewPhotos = useCallback(() => {
    navigation.navigate('ReviewPhotos', { photographerId });
  }, [navigation, photographerId]);

  // Transform review summary to view model
  const reviews =
    Array.isArray(reviewSummary?.latestReviews)
      ? reviewSummary.latestReviews.map((r: LatestReviewSummaryItem) => ({
        id: r.createdAt,
        content: r.content,
        date: r.createdAt,
        imageUrl: r.photoKey,
      }))
      : [];

  return (
    <PhotographerDetailsView
      photographer={profileData}
      portfolioImages={allPortfolios}
      isLoadingPhotographer={isLoadingPhotographer}
      isFetchingNextPage={isFetchingNextPage}
      activeTab={activeTab}
      portfolioCount={profileData?.portfolioCount || 0}
      reviewCount={reviewSummary?.totalReviewCount || profileData?.reviewCount || 0}
      avgRating={reviewSummary?.averageRating || 0}
      reviewPreviewImages={reviewSummary?.topPhotoKeys || []}
      reviews={reviews}
      isScrapped={profileData?.scrapped || false}
      onPressBack={handlePressBack}
      onPressUpload={handlePressUpload}
      onPressFavorite={handlePressFavorite}
      onPressInquiry={handlePressInquiry}
      onPressReservation={handlePressReservation}
      onEndReached={handleEndReached}
      onTabChange={handleTabChange}
      onPressPortfolioImage={handlePressPortfolioImage}
      onPressShowAllReviews={handlePressShowAllReviews}
      onPressShowAllReviewPhotos={handlePressShowAllReviewPhotos}
    />
  );
}
