import React, { useState, useCallback, useMemo } from 'react';
import analytics from '@react-native-firebase/analytics';
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
import { useShootingOptionsQuery, useShootingsQuery } from '@/queries/shootings.ts';
import { Alert } from '@/components/theme';
import { Share } from 'react-native';
import { useUpdatePhotographerProfileMutation } from '@/mutations/photographers';

type PhotographerDetailsRouteProp = RouteProp<MainStackParamList, 'PhotographerDetails'>;

const ReportType = [
  '저작권 침해가 우려돼요',
  '정보가 부정확해요',
  '명예를 훼손하는 내용이에요',
  '욕설, 비방 및 폭언이 심해요.'
]

export default function PhotographerDetailsContainer() {
  const route = useRoute<PhotographerDetailsRouteProp>();
  const navigation = useNavigation<MainNavigationProp>();
  const { photographerId } = route.params;
  const queryClient = useQueryClient();
  const { userId, userType, isExpertMode } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'portfolio' | 'reviews'>('portfolio');
  const [isMoreModalVisible, setIsMoreModalVisible] = useState(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [isProfileInfoModalVisible, setIsProfileInfoModalVisible] = useState(false);

  // 더미 데이터 (API가 없으므로 임시로 사용)

  // Fetch photographer profile (includes portfolio thumbnails)
  const {
    data: profilePages,
    isLoading: isLoadingPhotographer,
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

  // Handlers
  const handlePressBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handlePressShare = useCallback(() => {
    if (profileData?.nickname) {
      Share.share({
        message: `${profileData?.nickname}\nhttps://link.snaplink.run/photographer/${photographerId}`,
      });
    }
  }, [profileData?.nickname, photographerId]);

  const handlePressFavorite = useCallback(() => {
    scrapMutation.mutate(photographerId);
  }, [scrapMutation, photographerId]);

  const handlePressInquiry = useCallback(() => {
    chatMutation.mutate({ receiverId: photographerId }, {
      onSuccess: (response) => {
        // Log chat_initiated event when chat room is created
        analytics().logEvent('chat_initiated', {
          user_id: userId,
          user_type: userType,
          photographer_id: photographerId,
          room_id: response.roomId,
          source: 'PhotographerDetails',
        });
        // Invalidate chat rooms to refresh the list
        queryClient.invalidateQueries({ queryKey: chatQueryKeys.rooms() });

        // Navigate to ChatDetails with photographer info
        navigation.navigate('ChatDetails', {
          roomId: response.roomId,
          opponentNickname: profileData?.nickname,
          opponentProfileImageURI: profileData?.profileImageUrl,
        });
      }
    });
  }, [chatMutation, photographerId, navigation, queryClient, profileData, userId, userType]);

  const handlePressReservation = useCallback(() => {
    // Log booking_intent event when reservation button is pressed
    analytics().logEvent('booking_intent', {
      user_id: userId,
      user_type: userType,
      photographer_id: photographerId,
      source: 'PhotographerDetails',
    });
    navigation.navigate('Booking', { photographerId });
  }, [navigation, photographerId, userId, userType]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleTabChange = useCallback((tab: 'portfolio' | 'reviews') => {
    setActiveTab(tab);
  }, []);

  const handlePressPortfolioImage = useCallback((id: number) => {
    navigation.navigate('PostDetail', { postId: id, profileImageURI: profileData?.profileImageUrl || '' });
  }, [navigation, profileData]);

  const handlePressShowAllReviews = useCallback(() => {
    navigation.navigate('Reviews', { photographerId });
  }, [navigation, photographerId]);

  const handlePressShowAllReviewPhotos = useCallback(() => {
    navigation.navigate('ReviewPhotos', { photographerId });
  }, [navigation, photographerId]);

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
    setIsReportModalVisible(true);
  }

  const handleCloseReportModal = () => {
    setIsReportModalVisible(false);
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
                buttons: [{ text: '확인', onPress: () => {} }],
              });
            },
            onError: () => {
              Alert.show({
                title: '수정 실패',
                message: '프로필 수정에 실패했습니다. 다시 시도해주세요.',
                buttons: [{ text: '확인', onPress: () => {} }],
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
                buttons: [{ text: '확인', onPress: () => {} }],
              });
            },
            onError: () => {
              Alert.show({
                title: '수정 실패',
                message: '컨셉/태그 수정에 실패했습니다. 다시 시도해주세요.',
                buttons: [{ text: '확인', onPress: () => {} }],
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
                buttons: [{ text: '확인', onPress: () => {} }],
              });
            },
            onError: () => {
              Alert.show({
                title: '수정 실패',
                message: '지역 수정에 실패했습니다. 다시 시도해주세요.',
                buttons: [{ text: '확인', onPress: () => {} }],
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

  const handlePressReport = (type: string) => {
    console.log(type);
    Alert.show({
      title: '작가 신고',
      message: '해당 작가를 신고하시겠습니까? 모든 과정은 익명으로 처리됩니다.',
      buttons: [
        { text: '취소', type: 'cancel', onPress: () => {} },
        { text: '신고', onPress: () => {
          Alert.show({
            title: '소중한 의견 감사합니다',
            message: '신고는 익명으로 처리됩니다. \n앞으로 더 나은 경험을 할 수 있도록 개선하겠습니다.',
            buttons: [
              { text: '확인', onPress: () => {
                navigation.goBack();
                } },
            ]
          })
        }},
      ]
    })
  }

  return (
    <PhotographerDetailsView
      photographer={profileData}
      isPhotographer={userType === 'photographer' && isExpertMode}
      isMyProfile={userId === photographerId}
      shootingData={defaultShootingProduct}
      shootingOptions={shootingOptionNames}
      onPressAddPortfolio={handlePressAddPortfolio}
      portfolioImages={allPortfolios}
      isLoadingPhotographer={isLoadingPhotographer || isLoadingShooting}
      isFetchingNextPage={isFetchingNextPage}
      activeTab={activeTab}
      portfolioCount={profileData?.portfolioCount || 0}
      reviewCount={reviewSummary?.totalReviewCount || profileData?.reviewCount || 0}
      avgRating={reviewSummary?.averageRating || 0}
      reviewPreviewImages={reviewSummary?.topPhotoKeys || []}
      reviews={reviews}
      isScrapped={profileData?.scrapped || false}
      isMoreModalVisible={isMoreModalVisible}
      reportType={ReportType}
      onPressReport={handlePressReport}
      isReportModalVisible={isReportModalVisible}
      onCloseReportModal={handleCloseReportModal}
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
      onPressBack={handlePressBack}
      onPressShare={handlePressShare}
      onPressFavorite={handlePressFavorite}
      onPressInquiry={handlePressInquiry}
      onPressReservation={handlePressReservation}
      onEndReached={handleEndReached}
      onTabChange={handleTabChange}
      onPressPortfolioImage={handlePressPortfolioImage}
      onPressShowAllReviews={handlePressShowAllReviews}
      onPressShowAllReviewPhotos={handlePressShowAllReviewPhotos}
      navigation={navigation}
    />
  );
}
