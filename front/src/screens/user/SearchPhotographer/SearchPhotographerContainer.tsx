import { useState, useMemo } from 'react';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useInfiniteQuery } from '@tanstack/react-query';
import SearchPhotographerView from '@/screens/user/SearchPhotographer/SearchPhotographerView.tsx';
import { UserMainStackParamList, UserMainNavigationProp } from '@/types/userNavigation.ts';
import { FilterCategory, FilterValue, FilterChip } from '@/types/filter';
import { searchPhotographers } from '@/api/photographer';
import { Photographer } from '@/types/photographer';

import CameraIcon from '@/assets/icons/camera.svg';
import SendIcon from '@/assets/icons/send.svg';
import DiscountIcon from '@/assets/icons/discount.svg';
import ProfileIcon from '@/assets/icons/profile.svg';
import ActiveCameraIcon from '@/assets/icons/camera-white.svg';
import ActiveSendIcon from '@/assets/icons/send-white.svg';
import ActiveDiscountIcon from '@/assets/icons/discount-white.svg';
import ActiveProfileIcon from '@/assets/icons/profile-white.svg';

type SearchPhotographerRouteProp = RouteProp<MainStackParamList, 'SearchPhotographer'>;

/**
 * Filter categories configuration
 * In production, ENUM items should be fetched from DB
 */
const FILTER_CATEGORIES: FilterCategory[] = [
  {
    id: 'shooting-type',
    name: '촬영 유형',
    type: 'ENUM',
    icon: CameraIcon,
    activeIcon: ActiveCameraIcon,
    items: ['인물', '웨딩', '사물', '반려동물'], // TODO: Fetch from DB
  },
  {
    id: 'region',
    name: '지역',
    type: 'ENUM',
    icon: SendIcon,
    activeIcon: ActiveSendIcon,
    items: [
      '서울',
      '경기',
      '인천',
      '부산',
      '울산',
      '경남',
      '대구',
      '경북',
      '충청',
      '대전',
      '세종',
      '전남',
      '전북',
      '광주',
      '강원',
      '제주',
    ], // TODO: Fetch from DB
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
    items: ['여성작가', '남성작가'], // TODO: Fetch from DB
  },
];

const PAGE_SIZE = 10;

export default function SearchPhotographerContainer() {
  const route = useRoute<SearchPhotographerRouteProp>();
  const navigation = useNavigation<MainNavigationProp>();

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
  }, [selectedFilters]);

  /**
   * Get list of category IDs that have active filters
   */
  const activeCategoryIds = useMemo<string[]>(() => {
    return selectedFilters.map((filter) => filter.categoryId);
  }, [selectedFilters]);

  /**
   * Infinite query for photographer search
   * TODO: Replace with actual API endpoint when backend is ready
   */
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['photographers', searchKey, selectedFilters, sortBy],
    queryFn: ({ pageParam = 1 }) =>
      searchPhotographers({
        searchKey,
        filters: selectedFilters,
        sortBy,
        page: pageParam,
        pageSize: PAGE_SIZE,
      }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  /**
   * Flatten paginated data into single array
   */
  const photographers = useMemo<Photographer[]>(() => {
    if (!data) return [];
    return data.pages.flatMap((page) => page.photographers);
  }, [data]);

  const totalCount = data?.pages[0]?.totalCount ?? 0;

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

  const handlePressPhotographer = (photographerId: string) => navigation.navigate('PhotographerDetails', { id: photographerId });

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