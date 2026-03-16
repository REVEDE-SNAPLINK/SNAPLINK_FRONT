import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import crashlytics from '@react-native-firebase/crashlytics';
import { safeLogEvent, trackBookingEvent, trackChatEvent } from '@/utils/analytics.ts';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { MainStackParamList, MainNavigationProp } from '@/types/navigation.ts';
import PhotographerDetailsView from './PhotographerDetailsView.tsx';
import {
  usePhotographerProfileInfiniteQuery,
  usePhotographerReviewSummaryQuery,
  usePhotographerRegionsConceptsTagsQuery,
} from '@/queries/photographers.ts';
import { useTogglePhotographerScrapMutation } from '@/mutations/photographer.ts';
import { LatestReviewSummaryItem } from '@/api/photographers.ts';
import { useCreateOrGetChatRoomMutation } from '@/queries/chat.ts';
import { useQueryClient } from '@tanstack/react-query';
import { chatQueryKeys } from '@/queries/keys.ts';
import { useAuthStore } from '@/store/authStore.ts';
import { useModalStore } from '@/store/modalStore.ts';
import { useShootingOptionsQuery, useShootingsQuery } from '@/queries/shootings.ts';
import { Alert } from '@/components/ui';
import { useUpdatePhotographerProfileMutation } from '@/mutations/photographers';
import { REASON, reportUser } from '@/api/reports.ts';
import { showErrorAlert } from '@/utils/error';
import { shareWithShortLink } from '@/utils/share';

type PhotographerDetailsRouteProp = RouteProp<MainStackParamList, 'PhotographerDetails'>;

export default function PhotographerDetailsContainer() {
  const route = useRoute<PhotographerDetailsRouteProp>();
  const navigation = useNavigation<MainNavigationProp>();
  const { photographerId, source } = route.params;
  const queryClient = useQueryClient();
  const { userId, userType, isExpertMode } = useAuthStore();
  const { openReportModal, setReportModalLoading } = useModalStore();

  const [activeTab, setActiveTab] = useState<'portfolio' | 'reviews'>('portfolio');
  const [isMoreModalVisible, setIsMoreModalVisible] = useState(false);
  const [isProfileInfoModalVisible, setIsProfileInfoModalVisible] = useState(false);

  // Scroll depth tracking
  const scrollDepthTracked = useRef({ 25: false, 50: false, 75: false, 100: false });

  // 프로필 진입 이벤트 - 모든 경로(홈/검색/커뮤니티/북마크 등)를 여기서 일관되게 추적
  useEffect(() => {
    safeLogEvent('photographer_profile_view', {
      photographer_id: photographerId,
      source: source || 'direct',
    });
  }, [photographerId, source]);

  // 더미 데이터 (API가 없으므로 임시로 사용)

  // Fetch photographer profile (includes portfolio thumbnails)
  const {
    data: profilePages,
    isLoading: isLoadingPhotographer,
    isError: isErrorPhotographer,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePhotographerProfileInfiniteQuery(photographerId, { size: 18 });

  const {
    data: shootingData,
    isLoading: isLoadingShooting,
  } = useShootingsQuery(photographerId);

  // Find the first default shooting product, or the first product if no default
  const defaultShootingId = useMemo(() => {
    if (!shootingData || shootingData.length === 0) return undefined;
    const defaultShooting = shootingData.find((s) => s.isDefault);
    return defaultShooting?.id || shootingData[0]?.id;
  }, [shootingData]);

  // Fetch shooting options for the default product
  const { data: shootingOptionsData } = useShootingOptionsQuery(defaultShootingId);

  // Extract option names as string array
  const shootingOptionNames = useMemo(() => {
    if (!shootingOptionsData || shootingOptionsData.length === 0) return [];
    return shootingOptionsData.map((option) => option.name);
  }, [shootingOptionsData]);

  // Get the default shooting product for display, or the first product if no default
  const defaultShootingProduct = useMemo(() => {
    if (!shootingData || shootingData.length === 0) return undefined;
    const defaultShooting = shootingData.find((s) => s.isDefault);
    return defaultShooting || shootingData[0];
  }, [shootingData]);

  // Fetch review summary
  const { data: reviewSummary } = usePhotographerReviewSummaryQuery(photographerId);

  // Fetch regions, concepts, tags
  const { data: regionsConceptsTagsData } = usePhotographerRegionsConceptsTagsQuery(photographerId);

  // Scrap mutation
  const scrapMutation = useTogglePhotographerScrapMutation();
  const chatMutation = useCreateOrGetChatRoomMutation();
  const updateProfileMutation = useUpdatePhotographerProfileMutation(photographerId);

  // Get photographer data from first page (profile info is same across all pages)
  const profileData = useMemo(() => {
    if (!profilePages?.pages?.[0]) return null;
    return profilePages.pages[0];
  }, [profilePages]);

  // Transform API data to profileInfoData
  const profileInfoData = useMemo(() => {
    if (!regionsConceptsTagsData) {
      return {
        description: profileData?.description || '',
        profileImageURI: profileData?.profileImageUrl || '',
        regionIds: [],
        regions: [],
        tagIds: [],
        tags: [],
        conceptIds: [],
        concepts: [],
      };
    }

    return {
      description: profileData?.description || '',
      profileImageURI: profileData?.profileImageUrl || '',
      regionIds: regionsConceptsTagsData.regions.map((r) => r.id),
      regions: regionsConceptsTagsData.regions.map((r) => r.city),
      tagIds: regionsConceptsTagsData.tags.map((t) => t.id),
      tags: regionsConceptsTagsData.tags.map((t) => t.name),
      conceptIds: regionsConceptsTagsData.concepts.map((c) => c.id),
      concepts: regionsConceptsTagsData.concepts.map((c) => c.name),
    };
  }, [regionsConceptsTagsData, profileData]);

  // Flatten all portfolios from all pages
  const allPortfolios = useMemo(() => {
    if (!profilePages?.pages) return [];
    return profilePages.pages.flatMap((page) => page.portfolios || []);
  }, [profilePages]);

  const handlePressShare = useCallback(async () => {
    if (profileData?.nickname) {
      try {
        await shareWithShortLink({
          targetType: 'photographer_profile',
          targetId: photographerId,
          title: profileData.nickname,
          userId,
          userType,
        });
      } catch (error) {
        console.error('Failed to share photographer profile:', error);
      }
    }
  }, [profileData?.nickname, photographerId, userId, userType]);

  const handlePressFavorite = useCallback(() => {
    scrapMutation.mutate(photographerId);
  }, [scrapMutation, photographerId]);

  const handlePressInquiry = useCallback(() => {
    chatMutation.mutate({ receiverId: photographerId }, {
      onSuccess: (response) => {
        // Log chat_initiated event when chat room is created
        trackChatEvent('chat_initiated', response.toString(), photographerId, {
          source: source || 'direct', // 프로필 내에서의 행위
          entry_source: source || 'direct', // 프로필에 어느 경로로 진입했는지 (전환율 핵심)
        });
        // Invalidate chat rooms to refresh the list
        queryClient.invalidateQueries({ queryKey: chatQueryKeys.rooms() });

        // Navigate to ChatDetails
        navigation.navigate('ChatDetails', {
          roomId: response,
        });
      }
    });
  }, [chatMutation, photographerId, navigation, queryClient, source]);

  const handlePressReservation = useCallback(() => {
    // Log booking_intent event when reservation button is pressed
    trackBookingEvent('booking_intent', undefined, photographerId, {
      source: source || 'direct',
      entry_source: source || 'direct', // 프로필에 어느 경로로 진입했는지 (전환율 핵심)
    });
    navigation.navigate('Booking', { photographerId });
  }, [navigation, photographerId, source]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleTabChange = useCallback((tab: 'portfolio' | 'reviews') => {
    setActiveTab(tab);

    // ✅ Track review tab click
    if (tab === 'reviews') {
      safeLogEvent('profile_review_tab_clicked', {
        photographer_id: photographerId,
      });

      crashlytics().log(`⭐ Review tab clicked on profile ${photographerId}`);
    }
  }, [photographerId]);

  const handlePressPortfolioImage = useCallback((id: number) => {
    // ✅ Track portfolio click
    safeLogEvent('profile_portfolio_clicked', {
      photographer_id: photographerId,
      portfolio_id: id,
      source: 'profile_page',
    });

    crashlytics().log(`🖼️ Portfolio clicked: ${id} on profile ${photographerId}`);

    navigation.navigate('PostDetail', {
      postId: id,
      profileImageURI: profileData?.profileImageUrl || ''
    });
  }, [navigation, profileData, photographerId]);

  const handlePressShowAllReviews = useCallback(() => {
    navigation.navigate('Reviews', { photographerId });
  }, [navigation, photographerId]);

  const handlePressShowAllReviewPhotos = useCallback(() => {
    navigation.navigate('ReviewPhotos', { photographerId });
  }, [navigation, photographerId]);

  // ✅ Scroll depth tracking
  const handleScroll = useCallback((event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollPercentage = ((contentOffset.y + layoutMeasurement.height) / contentSize.height) * 100;

    [25, 50, 90].forEach(depth => {
      if (scrollPercentage >= depth && !scrollDepthTracked.current[depth as keyof typeof scrollDepthTracked.current]) {
        safeLogEvent('profile_scroll_depth', {
          photographer_id: photographerId,
          depth_percentage: depth,
        });

        scrollDepthTracked.current[depth as keyof typeof scrollDepthTracked.current] = true;
      }
    });
  }, [photographerId]);

  // Transform review summary to view model
  const reviews =
    Array.isArray(reviewSummary?.latestReviews)
      ? reviewSummary.latestReviews.map((r: LatestReviewSummaryItem, index: number) => ({
        id: `${r.createdAt}-${index}`,
        content: r.content,
        date: r.createdAt,
        imageUrl: r.photoKey,
      }))
      : [];

  const handlePressAddPortfolio = useCallback(() => {
    navigation.navigate('PortfolioForm', {});
  }, [navigation]);

  const handlePressMore = () => {
    setIsMoreModalVisible(true);
  }

  const handleCloseMoreModal = () => {
    setIsMoreModalVisible(false);
  }

  const handlePressReportStart = () => {
    openReportModal(
      photographerId,
      'PROFILE',
      async ({ reason, description }) => {
        setReportModalLoading(true);
        try {
          await reportUser({
            targetId: photographerId,
            targetType: 'PROFILE',
            reason: reason as REASON,
            customReason: reason === 'OTHER' ? description : '',
            description: reason === 'OTHER' ? '' : description,
          });
          setReportModalLoading(false);
          Alert.show({
            title: '소중한 의견 감사합니다',
            message: '신고는 익명으로 처리됩니다. \n앞으로 더 나은 경험을 할 수 있도록 개선하겠습니다.'
          });
        } catch (error) {
          setReportModalLoading(false);
          showErrorAlert({
            title: '신고 실패',
            action: '신고 처리',
            error,
          });
        }
      },
      'photographer',
    );
  }

  const handlePressEditProfile = () => {
    navigation.navigate('EditProfile', {
      description: profileData?.description || '',
      profileImageURI: profileData?.profileImageUrl || '',
      onSubmit: (description: string) => {
        // description만 수정, 나머지는 캐시된 데이터 사용
        updateProfileMutation.mutate(
          {
            description,
            regionIds: profileInfoData.regionIds,
            conceptIds: profileInfoData.conceptIds,
            tagIds: profileInfoData.tagIds,
          },
          {
            onSuccess: () => {
              Alert.show({
                title: '수정 완료',
                message: '프로필이 성공적으로 수정되었습니다.',
                buttons: [{ text: '확인', onPress: () => { } }],
              });
            },
            onError: (error) => {
              showErrorAlert({
                title: '수정 실패',
                action: '프로필 수정',
                error,
              });
            },
          }
        );
      },
    });
  }

  const handlePressEditConceptTag = () => {
    navigation.navigate('EditConceptTag', {
      tagIds: profileInfoData.tagIds,
      conceptIds: profileInfoData.conceptIds,
      onSubmit: (tagIds: number[], conceptIds: number[]) => {
        // tagIds, conceptIds만 수정, 나머지는 캐시된 데이터 사용
        updateProfileMutation.mutate(
          {
            description: profileInfoData.description,
            regionIds: profileInfoData.regionIds,
            conceptIds,
            tagIds,
          },
          {
            onSuccess: () => {
              Alert.show({
                title: '수정 완료',
                message: '컨셉/태그가 성공적으로 수정되었습니다.',
                buttons: [{ text: '확인', onPress: () => { } }],
              });
            },
            onError: (error) => {
              showErrorAlert({
                title: '수정 실패',
                action: '컨셉/태그 수정',
                error,
              });
            },
          }
        );
      },
    });
  }

  const handlePressEditRegion = () => {
    navigation.navigate('EditRegion', {
      regionIds: profileInfoData.regionIds,
      onSubmit: (regionIds: number[]) => {
        // regionIds만 수정, 나머지는 캐시된 데이터 사용
        updateProfileMutation.mutate(
          {
            description: profileInfoData.description,
            regionIds,
            conceptIds: profileInfoData.conceptIds,
            tagIds: profileInfoData.tagIds,
          },
          {
            onSuccess: () => {
              Alert.show({
                title: '수정 완료',
                message: '지역이 성공적으로 수정되었습니다.',
                buttons: [{ text: '확인', onPress: () => { } }],
              });
            },
            onError: (error) => {
              showErrorAlert({
                title: '수정 실패',
                action: '지역 수정',
                error,
              });
            },
          }
        );
      },
    });
  }

  const handlePressProfileInfo = () => {
    setIsProfileInfoModalVisible(true);
  }

  const handleCloseProfileInfoModal = () => {
    setIsProfileInfoModalVisible(false);
  }

  return (
    <PhotographerDetailsView
      photographerId={photographerId}
      photographer={profileData}
      isPhotographer={userType === 'photographer' && isExpertMode}
      isMyProfile={userId === photographerId}
      shootingData={defaultShootingProduct}
      shootingOptions={shootingOptionNames}
      onPressAddPortfolio={handlePressAddPortfolio}
      portfolioImages={allPortfolios}
      isLoadingPhotographer={isLoadingPhotographer || isLoadingShooting}
      isError={isErrorPhotographer}
      isFetchingNextPage={isFetchingNextPage}
      activeTab={activeTab}
      portfolioCount={profileData?.portfolioCount || 0}
      reviewCount={reviewSummary?.totalReviewCount || profileData?.reviewCount || 0}
      avgRating={reviewSummary?.averageRating || 0}
      reviewPreviewImages={reviewSummary?.topPhotoKeys || []}
      reviews={reviews}
      isScrapped={profileData?.scrapped || false}
      isMoreModalVisible={isMoreModalVisible}
      onPressReportStart={handlePressReportStart}
      onPressEditProfile={handlePressEditProfile}
      onPressEditConceptTag={handlePressEditConceptTag}
      onPressEditRegion={handlePressEditRegion}
      onPressProfileInfo={handlePressProfileInfo}
      isProfileInfoModalVisible={isProfileInfoModalVisible}
      onCloseProfileInfoModal={handleCloseProfileInfoModal}
      profileInfoData={profileInfoData}
      onCloseMoreModal={handleCloseMoreModal}
      onPressMore={handlePressMore}
      onPressShare={handlePressShare}
      onPressFavorite={handlePressFavorite}
      onPressInquiry={handlePressInquiry}
      onPressReservation={handlePressReservation}
      onEndReached={handleEndReached}
      onTabChange={handleTabChange}
      onPressPortfolioImage={handlePressPortfolioImage}
      onPressShowAllReviews={handlePressShowAllReviews}
      onPressShowAllReviewPhotos={handlePressShowAllReviewPhotos}
      onScroll={handleScroll}
      navigation={navigation}
    />
  );
}
