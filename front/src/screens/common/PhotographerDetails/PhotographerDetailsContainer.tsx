import React, { useState, useCallback, useMemo } from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { MainStackParamList, MainNavigationProp } from '@/types/navigation.ts';
import PhotographerDetailsView from './PhotographerDetailsView.tsx';
import { usePhotographerProfileQuery, usePhotographerReviewSummaryQuery } from '@/queries/photographers.ts';

type PhotographerDetailsRouteProp = RouteProp<MainStackParamList, 'PhotographerDetails'>;

export default function PhotographerDetailsContainer() {
  const route = useRoute<PhotographerDetailsRouteProp>();
  const navigation = useNavigation<MainNavigationProp>();
  const { id: photographerId } = route.params;

  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'reviews'>('portfolio');

  // Fetch photographer profile (includes portfolio thumbnails)
  const {
    data: profileData,
    isLoading: isLoadingPhotographer,
  } = usePhotographerProfileQuery(photographerId, { page: 0, size: 18 });

  // Fetch review summary
  const { data: reviewSummary } = usePhotographerReviewSummaryQuery(photographerId);

  // Portfolio images from profile response
  const portfolioImages = useMemo(() => {
    if (!profileData?.portfolios) return [];
    return profileData.portfolios.map((p) => ({
      id: String(p.id),
      url: p.thumbnailUrl,
    }));
  }, [profileData]);

  // Transform profile data to photographer object
  const photographer = profileData
    ? {
        id: photographerId,
        name: profileData.nickname,
        profileImageUrl: profileData.profileImageUrl,
        description: profileData.description,
        // TODO: basePrice, baseTime 등 추가 정보는 별도 API에서 가져와야 할 수 있음
      }
    : null;

  // Handlers
  const handlePressBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handlePressUpload = useCallback(() => {
    // TODO: Navigate to portfolio upload screen
    navigation.navigate('PortfolioOnboarding');
  }, [navigation]);

  const handlePressFavorite = useCallback(() => {
    setIsFavorite((prev) => !prev);
    // TODO: API call to toggle favorite
    // POST /api/user/favorites/{photographerId}
    console.log('Toggle favorite:', isFavorite ? 'remove' : 'add');
  }, [isFavorite]);

  const handlePressInquiry = useCallback(() => {
    // TODO: Open chat with photographer
    // Use createOrGetChatRoom mutation
    console.log('Navigate to inquiry');
  }, []);

  const handlePressReservation = useCallback(() => {
    navigation.navigate('Booking', { id: photographerId });
  }, [navigation, photographerId]);

  // TODO: Portfolio infinite scroll - need separate API endpoint
  // const handleEndReached = useCallback(() => {
  //   if (hasNextPage && !isFetchingNextPage) {
  //     fetchNextPage();
  //   }
  // }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleTabChange = useCallback((tab: 'portfolio' | 'reviews') => {
    setActiveTab(tab);
  }, []);

  const handlePressPortfolioImage = useCallback((imageId: string) => {
    navigation.navigate('PostDetail', { postId: imageId });
  }, [navigation]);

  const handlePressShowAllReviews = useCallback(() => {
    navigation.navigate('Reviews', { photographerId });
  }, [navigation, photographerId]);

  const handlePressShowAllReviewPhotos = useCallback(() => {
    navigation.navigate('ReviewPhotos', { photographerId });
  }, [navigation, photographerId]);

  // Transform review summary to view model
  const reviews = reviewSummary?.latestReviews.map((r) => ({
    id: String(r.createdAt), // Temporary ID (review summary doesn't have reviewId)
    content: r.content,
    date: r.createdAt,
    imageUrl: r.photoKey,
  })) || [];

  return (
    <PhotographerDetailsView
      photographer={photographer}
      portfolioImages={portfolioImages}
      isLoadingPhotographer={isLoadingPhotographer}
      isFetchingNextPage={false}
      activeTab={activeTab}
      responseRate={profileData?.responseRate || 0}
      avgResponseTime={profileData?.responseTime || '-'}
      portfolioCount={profileData?.portfolioCount || 0}
      reviewCount={reviewSummary?.totalReviewCount || profileData?.reviewCount || 0}
      avgRating={reviewSummary?.averageRating || 0}
      reviewPreviewImages={reviewSummary?.topPhotoKeys || []}
      reviews={reviews}
      onPressBack={handlePressBack}
      onPressUpload={handlePressUpload}
      onPressFavorite={handlePressFavorite}
      onPressInquiry={handlePressInquiry}
      onPressReservation={handlePressReservation}
      // onEndReached={handleEndReached}
      onTabChange={handleTabChange}
      onPressPortfolioImage={handlePressPortfolioImage}
      onPressShowAllReviews={handlePressShowAllReviews}
      onPressShowAllReviewPhotos={handlePressShowAllReviewPhotos}
    />
  );
}
