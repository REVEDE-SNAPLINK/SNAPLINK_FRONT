import { useState, useMemo } from 'react';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import SearchPhotographerView from '@/screens/common/SearchPhotographer/SearchPhotographerView.tsx';
import { MainStackParamList, MainNavigationProp } from '@/types/navigation.ts';
import { FilterCategory, FilterValue, FilterChip } from '@/types/filter.ts';
import { useSearchPhotographersInfiniteQuery } from '@/queries/photographers.ts';
import { SearchPhotographersBody, PhotographerSearchItem } from '@/api/photographers.ts';
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
  const [sortBy, setSortBy] = useState<'recommended' | 'latest'>('recommended');

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
      query: searchKey || undefined,
    };

    selectedFilters.forEach((filter) => {
      if (filter.categoryId === 'gender' && filter.type === 'ENUM') {
        // '여성작가' -> 'WOMAN', '남성작가' -> 'MAN'
        const genderValue = filter.values[0];
        if (genderValue === '여성작가') body.gender = 'WOMAN';
        else if (genderValue === '남성작가') body.gender = 'MAN';
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
  }, [searchKey, selectedFilters, regions, concepts]);

  /**
   * Infinite query for photographer search
   */
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useSearchPhotographersInfiniteQuery(
    { size: PAGE_SIZE, sort: sortBy === 'latest' ? ['createdAt,DESC'] : [] },
    searchBody,
  );

  /**
   * Flatten paginated data into single array
   */
  const photographers = useMemo<PhotographerSearchItem[]>(() => {
    if (!data) return [];
    return data.pages.flatMap((page) => page.content);
  }, [data]);

  const totalCount = data?.pages[0]?.totalElements ?? 0;

  const handlePressBack = () => {
    navigation.goBack();
  };

  const handleSubmitSearchKey = () => {
    // Query will automatically refetch when searchKey changes
    refetch();
  };

  const handleToggleSort = () => {
    setSortBy((prev) => (prev === 'recommended' ? 'latest' : 'recommended'));
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

  const handlePressPhotographer = (photographerId: string) => navigation.navigate('PhotographerDetails', { photographerId });

  /**
   * Remove all filters for a category when category chip is clicked
   */
  const handlePressCategoryChip = (categoryId: string) => {
    setSelectedFilters((prev) => prev.filter((f) => f.categoryId !== categoryId));
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
      onPressFilter={handlePressFilter}
      onPressCategoryChip={handlePressCategoryChip}
      onPressFilterChip={handlePressFilterChip}
      isFilterModalOpen={isFilterModalOpen}
      onCloseFilterModal={handleCloseFilterModal}
      selectedFilters={selectedFilters}
      onApplyFilters={handleApplyFilters}
      photographers={photographers}
      totalCount={totalCount}
      sortBy={sortBy}
      onToggleSort={handleToggleSort}
      onLoadMore={handleLoadMore}
      onRefresh={handleRefresh}
      isRefreshing={isRefetching}
      isFetchingNextPage={isFetchingNextPage}
      onPressPhotographer={handlePressPhotographer}
    />
  );
}