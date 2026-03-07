import { useState, useMemo, useEffect } from 'react';
import analytics from '@react-native-firebase/analytics';
import { useAuthStore } from '@/store/authStore.ts';
import { safeLogEvent } from '@/utils/analytics.ts';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import SearchPhotographerView, { SortByKey } from '@/screens/common/SearchPhotographer/SearchPhotographerView.tsx';
import { MainStackParamList, MainNavigationProp } from '@/types/navigation.ts';
import { FilterCategory, FilterValue, FilterChip } from '@/types/filter.ts';
import { useSearchPhotographersInfiniteQuery } from '@/queries/photographers.ts';
import { SearchPhotographersBody } from '@/api/photographers.ts';
import { useRegionsQuery, useConceptsQuery } from '@/queries/meta.ts';

import CameraIcon from '@/assets/icons/camera.svg';
import SendIcon from '@/assets/icons/send.svg';
import DiscountIcon from '@/assets/icons/discount.svg';
import ProfileIcon from '@/assets/icons/profile.svg';
import ActiveCameraIcon from '@/assets/icons/camera-white.svg';
import ActiveSendIcon from '@/assets/icons/send-white.svg';
import ActiveDiscountIcon from '@/assets/icons/discount-white.svg';
import ActiveProfileIcon from '@/assets/icons/profile-white.svg';

type SearchPhotographerRouteProp = RouteProp<MainStackParamList, 'SearchPhotographer'>;

const PAGE_SIZE = 10;

export default function SearchPhotographerContainer() {
  const { userId, userType } = useAuthStore();
  const route = useRoute<SearchPhotographerRouteProp>();
  const navigation = useNavigation<MainNavigationProp>();

  // Fetch meta data for filters
  const { data: regions = [] } = useRegionsQuery();
  const { data: concepts = [] } = useConceptsQuery();

  /**
   * Filter categories configuration
   * Dynamically populated from meta APIs
   */
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

  const [searchKey, setSearchKey] = useState(route.params.searchKey);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<FilterValue[]>([]);
  const [initialFilterIndex, setInitialFilterIndex] = useState(0);
  const [sortBy, setSortBy] = useState<SortByKey>('DEFAULT');
  const [totalCount, setTotalCount] = useState(0);

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
        // For NUMBER type filters, show formatted range
        if (category.type === 'NUMBER') {
          const isFullRange = filter.min === category.min && filter.max === category.max;

          if (!isFullRange) {
            const formatValue = (val: number) => {
              if (val >= 10000) {
                return `${Math.floor(val / 10000)}만${category.unit || ''}`;
              }
              return `${val.toLocaleString()}${category.unit || ''}`;
            };

            // Show range like "5,000원 ~ 20만원"
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

  /**
   * Get list of category IDs that have active filters
   */
  const activeCategoryIds = useMemo<string[]>(() => {
    return selectedFilters.map((filter) => filter.categoryId);
  }, [selectedFilters]);

  /**
   * Convert filters to API body format
   */
  const searchBody = useMemo<SearchPhotographersBody>(() => {
    const body: SearchPhotographersBody = {
      gender: null,
      regionIds: null,
      conceptIds: null,
      maxPrice: null,
      minPrice: null,
      query: searchKey === '' ? null : searchKey,
      sort: sortBy === "DEFAULT" ? "RECOMMENDED" : sortBy === "LATEST" ? "LATEST" : sortBy === "HIGH_PRICE" ? "MAXPRICE" : sortBy === "LOW_PRICE" ? "MINPRICE" : "REVIEW"
    };

    selectedFilters.forEach((filter) => {
      if (filter.categoryId === 'gender' && filter.type === 'ENUM') {
        // '여성작가' -> 'WOMAN', '남성작가' -> 'MAN'
        const genderValue = filter.values[0];
        if (genderValue === '여성작가') body.gender = 'FEMALE';
        else if (genderValue === '남성작가') body.gender = 'MALE';
      } else if (filter.categoryId === 'region' && filter.type === 'ENUM') {
        // Map region names to regionIds
        const regionIds = filter.values
          .map((regionName) => {
            const region = regions.find((r) => r.city === regionName);
            return region ? region.id : null;
          })
          .filter((id): id is number => id !== null);

        if (regionIds.length > 0) {
          body.regionIds = regionIds;
        }
      } else if (filter.categoryId === 'shooting-type' && filter.type === 'ENUM') {
        // Map concept names to conceptIds
        const conceptIds = filter.values
          .map((conceptName) => {
            const concept = concepts.find((c: { id: number; conceptName: string }) => c.conceptName === conceptName);
            return concept ? concept.id : null;
          })
          .filter((id): id is number => id !== null);

        if (conceptIds.length > 0) {
          body.conceptIds = conceptIds;
        }
      } else if (filter.categoryId === 'price' && filter.type === 'NUMBER') {
        body.minPrice = filter.min;
        body.maxPrice = filter.max;
      }
    });

    return body;
  }, [searchKey, selectedFilters, regions, concepts, sortBy]);

  /**
   * Infinite query for photographer search
   */
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isLoading,
    isError
  } = useSearchPhotographersInfiniteQuery(
    { size: PAGE_SIZE },
    searchBody,
  );

  /**
   * Flatten paginated data into single array
   */
  const photographers = data?.pages.flatMap((page) => page.content);

  useEffect(() => {
    if (data?.pages[0].totalElements) {
      setTotalCount(data.pages[0].totalElements);
    }

    // 검색 결과 로드 시 search_result_view 이벤트
    if (data?.pages[0] && searchKey) {
      safeLogEvent('search_result_view', {
        search_key: searchKey,
        result_count: data.pages[0].totalElements ?? 0,
        user_id: userId,
        user_type: userType,
        source: 'SearchPhotographer',
      });
    }
  }, [data]);

  const handlePressBack = () => {
    navigation.goBack();
  };

  const handleSubmitSearchKey = () => {
    // Log search_photographer event when search is submitted
    analytics().logEvent('search_photographer', {
      user_id: userId,
      user_type: userType,
      search_key: searchKey,
      source: 'SearchPhotographer',
    });
    // Query will automatically refetch when searchKey changes
    refetch();
  };

  const handleChangeSortBy = (key: SortByKey) => {
    setSortBy(key);
  };

  const handlePressFilter = () => {
    setIsFilterModalOpen(true);
  };

  const handleCloseFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  const handleApplyFilters = (filters: FilterValue[]) => {
    setSelectedFilters(filters);
    // Query will automatically refetch when selectedFilters changes
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const handlePressPhotographer = (photographerId: string) => {
    // Log photographer_profile_view event when photographer is pressed
    analytics().logEvent('photographer_profile_view', {
      user_id: userId,
      user_type: userType,
      photographer_id: photographerId,
      source: 'SearchPhotographer',
    });
    // 검색 결과에서 작가 카드 클릭 이벤트
    safeLogEvent('creator_card_click', {
      photographer_id: photographerId,
      source: 'search',
      feed_type: 'search_result',
      user_id: userId,
      user_type: userType,
    });
    navigation.navigate('PhotographerDetails', { photographerId, source: 'search' });
  };

  /**
   * Remove all filters for a category when category chip is clicked
   */
  const handlePressCategoryChip = (categoryId: string, index: number) => {
    if (selectedFilters.find((f) => f.categoryId === categoryId)) {
      setSelectedFilters((prev) => prev.filter((f) => f.categoryId !== categoryId));
    } else {
      setInitialFilterIndex(index);
      setIsFilterModalOpen(true);
    }
  };

  /**
   * Remove a specific filter chip
   */
  const handlePressFilterChip = (chipId: string) => {
    // Parse chipId: format is "categoryId-value" or "categoryId-range"
    const dashIndex = chipId.lastIndexOf('-');
    if (dashIndex === -1) return;

    const categoryId = chipId.substring(0, dashIndex);
    const value = chipId.substring(dashIndex + 1);

    setSelectedFilters((prev) => {
      const newFilters: FilterValue[] = [];

      prev.forEach((filter) => {
        if (filter.categoryId !== categoryId) {
          // Keep filters from other categories
          newFilters.push(filter);
        } else if (filter.type === 'ENUM') {
          // For ENUM type, remove specific value
          const newValues = filter.values.filter((v) => v !== value);
          if (newValues.length > 0) {
            newFilters.push({ ...filter, values: newValues });
          }
          // If no values left, don't add back (effectively removed)
        }
        // For NUMBER type, if categoryId matches, don't add back (effectively removed)
      });

      return newFilters;
    });
  };

  return (
    <SearchPhotographerView
      onPressBack={handlePressBack}
      searchKey={searchKey}
      onChangeSearchKey={setSearchKey}
      onSubmitSearchKey={handleSubmitSearchKey}
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
      photographers={photographers ?? []}
      totalCount={totalCount}
      sortBy={sortBy}
      onChangeSortBy={handleChangeSortBy}
      onLoadMore={handleLoadMore}
      onRefresh={handleRefresh}
      isFetchingNextPage={isFetchingNextPage}
      onPressPhotographer={handlePressPhotographer}
      isLoading={isLoading}
      isError={isError}
      navigation={navigation}
    />
  );
}