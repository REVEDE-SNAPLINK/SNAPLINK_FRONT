import { useState, useMemo, useEffect, useCallback } from 'react';
import { safeLogEvent } from '@/utils/analytics.ts';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import AIRecommdationResultView from '@/screens/common/AIRecommdationResult/AIRecommdationResultView.tsx';
import { MainStackParamList, MainNavigationProp } from '@/types/navigation.ts';
import { useMeQuery } from '@/queries/user.ts';
import { FilterCategory, FilterValue, FilterChip } from '@/types/filter.ts';
import { PhotographerSearchItem, SearchPhotographersMultiParams } from '@/api/photographers.ts';
import { useRegionsQuery, useConceptsQuery } from '@/queries/meta.ts';
import { useSearchPhotographersMultiMutation } from '@/queries/photographers.ts';

import CameraIcon from '@/assets/icons/camera.svg';
import SendIcon from '@/assets/icons/send.svg';
import DiscountIcon from '@/assets/icons/discount.svg';
import ProfileIcon from '@/assets/icons/profile.svg';
import ActiveCameraIcon from '@/assets/icons/camera-white.svg';
import ActiveSendIcon from '@/assets/icons/send-white.svg';
import ActiveDiscountIcon from '@/assets/icons/discount-white.svg';
import ActiveProfileIcon from '@/assets/icons/profile-white.svg';

type AIRecommendationResultRouteProp = RouteProp<MainStackParamList, 'AIRecommdationResult'>;

export default function AIRecommdationResultContainer() {
  useEffect(() => {
    // Log ai_recommendation_result_view when the result screen opens
    safeLogEvent('ai_recommendation_result_view', {
      prompt: prompt,
      result_count: resultCount,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const route = useRoute<AIRecommendationResultRouteProp>();
  const navigation = useNavigation<MainNavigationProp>();

  const { prompt, resultCount = 3, imageUri, imageName, imageType } = route.params;

  const { data: profileData } = useMeQuery();
  const { data: regions = [] } = useRegionsQuery();
  const { data: concepts = [] } = useConceptsQuery();

  const FILTER_CATEGORIES = useMemo<FilterCategory[]>(() => [
    {
      id: 'shooting-type',
      name: '촬영 유형',
      type: 'ENUM',
      icon: CameraIcon,
      activeIcon: ActiveCameraIcon,
      items: concepts.map((concept: { id: number; conceptName: string }) => concept.conceptName),
    },
    {
      id: 'region',
      name: '지역',
      type: 'ENUM',
      icon: SendIcon,
      activeIcon: ActiveSendIcon,
      items: regions.map((region: { id: number; city: string }) => region.city),
    },
    {
      id: 'price',
      name: '가격',
      type: 'NUMBER',
      icon: DiscountIcon,
      activeIcon: ActiveDiscountIcon,
      min: 5000,
      max: 1000000,
      unit: '원',
    },
    {
      id: 'gender',
      name: '성별',
      type: 'ENUM',
      icon: ProfileIcon,
      activeIcon: ActiveProfileIcon,
      items: ['여성작가', '남성작가'],
    },
  ], [regions, concepts]);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<FilterValue[]>([]);
  const [initialFilterIndex, setInitialFilterIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [allPhotographers, setAllPhotographers] = useState<PhotographerSearchItem[]>([]);
  const [photographersWithScores, setPhotographersWithScores] = useState<(PhotographerSearchItem & { aiScore: number })[]>([]);

  const { mutate: searchMulti } = useSearchPhotographersMultiMutation();

  const fetchResults = useCallback(() => {
    setIsLoading(true);

    const params: SearchPhotographersMultiParams = {
      queryText: prompt,
    };

    if (imageUri && imageName && imageType) {
      params.queryImages = [{ uri: imageUri, name: imageName, type: imageType }];
    }

    searchMulti(params, {
      onSuccess: (res) => {
        // MultiSearchPhotographerResult -> PhotographerSearchItem 변환
        const mapped: PhotographerSearchItem[] = res.map((item) => ({
          id: item.userId,
          nickname: item.nickname || 'Photographer', // fallback
          profileImageUrl: item.profileImageUrl || '', // fallback since api doesn't provide
          averageRating: item.averageRating,
          reviewCount: item.reviewCount,
          basePrice: item.basePrice,
          baseTime: item.baseTime,
          gender: item.gender === 'MALE' ? 'MALE' : 'FEMALE',
          concepts: [],
          portfolioImages: item.matchedImageUrl ? [item.matchedImageUrl] : [],
        }));

        setAllPhotographers(mapped);

        // Calculate AI recommendation scores (descending from top)
        const withScores = mapped.map((photographer, index) => {
          // Similarity Score from server: e.g., 0.825 -> 83
          const rawScore = res[index]?.similarityScore || 0;
          const score = Math.round(rawScore * 100);

          return {
            ...photographer,
            aiScore: score,
          };
        });

        // 결과물을 적합도(aiScore) 내림차순으로 정렬
        withScores.sort((a, b) => b.aiScore - a.aiScore);

        setPhotographersWithScores(withScores);
        setIsLoading(false);
      },
      onError: (err) => {
        console.error(err);
        setIsLoading(false);
      }
    });
  }, [prompt, imageUri, imageName, imageType, searchMulti, resultCount]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Client-side filtering
  const filteredPhotographers = useMemo(() => {
    let filtered = photographersWithScores;

    selectedFilters.forEach((filter) => {
      if (filter.categoryId === 'gender' && filter.type === 'ENUM') {
        const genderValue = filter.values[0];
        if (genderValue === '여성작가') {
          filtered = filtered.filter((p) => p.gender === 'FEMALE');
        } else if (genderValue === '남성작가') {
          filtered = filtered.filter((p) => p.gender === 'MALE');
        }
      } else if (filter.categoryId === 'region' && filter.type === 'ENUM') {
        // Region filtering would require regionIds in PhotographerSearchItem
        // Skipping for now as the API response doesn't include it
      } else if (filter.categoryId === 'shooting-type' && filter.type === 'ENUM') {
        filtered = filtered.filter((p) =>
          filter.values.some((concept) => p.concepts.includes(concept))
        );
      } else if (filter.categoryId === 'price' && filter.type === 'NUMBER') {
        filtered = filtered.filter(
          (p) => p.basePrice >= filter.min && p.basePrice <= filter.max
        );
      }
    });

    return filtered;
  }, [photographersWithScores, selectedFilters, resultCount]);

  const filterChips = useMemo<FilterChip[]>(() => {
    const chips: FilterChip[] = [];

    selectedFilters.forEach((filter) => {
      const category = FILTER_CATEGORIES.find((cat) => cat.id === filter.categoryId);
      if (!category) return;

      if (filter.type === 'ENUM') {
        filter.values.forEach((value) => {
          chips.push({
            id: `${filter.categoryId}-${value}`,
            categoryId: filter.categoryId,
            label: value,
          });
        });
      } else if (filter.type === 'NUMBER') {
        if (category.type === 'NUMBER') {
          const isFullRange = filter.min === category.min && filter.max === category.max;

          if (!isFullRange) {
            const formatValue = (val: number) => {
              if (val >= 10000) {
                return `${Math.floor(val / 10000)}만${category.unit || ''}`;
              }
              return `${val.toLocaleString()}${category.unit || ''}`;
            };

            const label = `${formatValue(filter.min)} ~ ${formatValue(filter.max)}`;

            chips.push({
              id: `${filter.categoryId}-range`,
              categoryId: filter.categoryId,
              label,
            });
          }
        }
      }
    });

    return chips;
  }, [selectedFilters, FILTER_CATEGORIES]);

  const activeCategoryIds = useMemo<string[]>(() => {
    return selectedFilters.map((filter) => filter.categoryId);
  }, [selectedFilters]);

  const handlePressBack = () => navigation.goBack();

  const handlePressFilter = () => {
    setIsFilterModalOpen(true);
  };

  const handleCloseFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  const handleApplyFilters = (filters: FilterValue[]) => {
    setSelectedFilters(filters);
  };

  const handleLoadMore = () => {
    // No-op for AI multi search (all results fetched at once)
  };

  const handleRefresh = () => {
    fetchResults();
  };

  const handlePressPhotographer = (photographerId: string) => {
    safeLogEvent('photographer_profile_view', {
      photographer_id: photographerId,
      source: 'AIRecommdationResult',
    });
    navigation.navigate('PhotographerDetails', { photographerId, source: 'ai_recommendation' });
  };

  const handlePressCategoryChip = (categoryId: string, index: number) => {
    if (selectedFilters.find((f) => f.categoryId === categoryId)) {
      setSelectedFilters((prev) => prev.filter((f) => f.categoryId !== categoryId));
    } else {
      setInitialFilterIndex(index);
      setIsFilterModalOpen(true);
    }
  };

  const handlePressFilterChip = (chipId: string) => {
    const dashIndex = chipId.lastIndexOf('-');
    if (dashIndex === -1) return;

    const categoryId = chipId.substring(0, dashIndex);
    const value = chipId.substring(dashIndex + 1);

    setSelectedFilters((prev) => {
      const newFilters: FilterValue[] = [];

      prev.forEach((filter) => {
        if (filter.categoryId !== categoryId) {
          newFilters.push(filter);
        } else if (filter.type === 'ENUM') {
          const newValues = filter.values.filter((v) => v !== value);
          if (newValues.length > 0) {
            newFilters.push({ ...filter, values: newValues });
          }
        }
      });

      return newFilters;
    });
  };

  return (
    <AIRecommdationResultView
      onPressBack={handlePressBack}
      nickname={profileData?.nickname || '고객'}
      resultCounts={filteredPhotographers.length}
      filterCategories={FILTER_CATEGORIES}
      activeCategoryIds={activeCategoryIds}
      filterChips={filterChips}
      initialFilterIndex={initialFilterIndex}
      onPressFilter={handlePressFilter}
      onPressCategoryChip={handlePressCategoryChip}
      onPressFilterChip={handlePressFilterChip}
      isFilterModalOpen={isFilterModalOpen}
      onCloseFilterModal={handleCloseFilterModal}
      selectedFilters={selectedFilters}
      onApplyFilters={handleApplyFilters}
      photographers={filteredPhotographers}
      onLoadMore={handleLoadMore}
      onRefresh={handleRefresh}
      isRefreshing={isLoading}
      isFetchingNextPage={false}
      onPressPhotographer={handlePressPhotographer}
      isLoading={isLoading}
      navigation={navigation}
    />
  );
}