import ScreenContainer from '@/components/layout/ScreenContainer';
import styled from '@/utils/scale/CustomStyled.ts';
import Icon from '@/components/ui/Icon.tsx';
import { theme } from '@/theme';
import Filter from '@/components/domain/photographer/Filter.tsx';
import FilterModal from '@/components/domain/photographer/FilterModal.tsx';
import { FilterCategory, FilterValue, FilterChip } from '@/types/filter.ts';
import Typography from '@/components/ui/Typography.tsx';
import SearchPhotographerList from '@/components/domain/photographer/SearchPhotographerList.tsx';
import { PhotographerSearchItem } from '@/api/photographers.ts';
import BackButton from '@/components/layout/BackButton';
import SortButton, { SortOption } from '@/components/ui/SortButton.tsx';
import SearchIcon from '@/assets/icons/search-gray.svg';

export const SORT_BY_ENUM = {
  'LATEST': '최신순',
  'REVIEWS': '후기 많은 순',
  'HIGH_PRICE': '가격순(높은 순)',
  'LOW_PRICE': '가격순(낮은 순)',
  'DEFAULT': '기본 순'
};

export type SortByKey = keyof typeof SORT_BY_ENUM;

const SORT_OPTIONS: SortOption<SortByKey>[] = [
  { key: 'LATEST', label: '최신순' },
  { key: 'REVIEWS', label: '후기 많은 순' },
  { key: 'HIGH_PRICE', label: '가격순(높은 순)' },
  { key: 'LOW_PRICE', label: '가격순(낮은 순)' },
  { key: 'DEFAULT', label: '기본 순' },
];

interface SearchPhotographerViewProps {
  onPressBack: () => void;
  searchKey: string;
  onChangeSearchKey: (key: string) => void;
  onSubmitSearchKey: () => void;
  filterCategories: FilterCategory[];
  activeCategoryIds: string[];
  filterChips: FilterChip[];
  initialFilterIndex: number;
  onPressFilter: () => void;
  onPressCategoryChip: (categoryId: string, index: number) => void;
  onPressFilterChip: (chipId: string) => void;
  isFilterModalOpen: boolean;
  onCloseFilterModal: () => void;
  selectedFilters: FilterValue[];
  onApplyFilters: (filters: FilterValue[]) => void;
  photographers: PhotographerSearchItem[];
  totalCount: number;
  sortBy: SortByKey;
  onChangeSortBy: (key: SortByKey) => void;
  onLoadMore: () => void;
  onRefresh: () => void;
  isFetchingNextPage: boolean;
  onPressPhotographer: (photographerId: string) => void;
  isLoading?: boolean;
  isError?: boolean;
  navigation?: any;
}

export default function SearchPhotographerView({
  onPressBack,
  searchKey,
  onChangeSearchKey,
  onSubmitSearchKey,
  filterCategories,
  activeCategoryIds,
  filterChips,
  initialFilterIndex,
  onPressFilter,
  onPressCategoryChip,
  onPressFilterChip,
  isFilterModalOpen,
  onCloseFilterModal,
  selectedFilters,
  onApplyFilters,
  photographers,
  totalCount,
  sortBy,
  onChangeSortBy,
  onLoadMore,
  onRefresh,
  isFetchingNextPage,
  onPressPhotographer,
  isError,
  navigation,}: SearchPhotographerViewProps) {
  return (
    <>
      <ScreenContainer
        headerShown={false}
        navigation={navigation}
      >
        <Header>
          <BackButton onPress={onPressBack} />
          <SearchInputWrapper>
            <SearchInput
              value={searchKey}
              onChangeText={onChangeSearchKey}
              onSubmitEditing={() => onSubmitSearchKey()}
            />
            <Icon width={24} height={24} Svg={SearchIcon} />
          </SearchInputWrapper>
        </Header>
        <FilterWrapper>
          <Filter
            categories={filterCategories}
            activeCategoryIds={activeCategoryIds}
            filterChips={filterChips}
            onPressFilterButton={onPressFilter}
            onPressCategoryChip={onPressCategoryChip}
            onPressFilterChip={onPressFilterChip}
          />
        </FilterWrapper>
        {isError ? (
          <EmptyContainer>
            <Typography fontSize={16} color={theme.colors.disabled}>
              작가 목록을 불러올 수 없습니다.{'\n'}
              다시 시도해주세요.
            </Typography>
          </EmptyContainer>
        ) : (
          <>
            <SearchResultHeader>
              <Typography fontSize={12} lineHeight="140%" letterSpacing="-2.5%" color={theme.colors.disabled}>
                검색결과 총 {totalCount}명
              </Typography>
              <SortButton
                options={SORT_OPTIONS}
                selectedKey={sortBy}
                onSelect={onChangeSortBy}
              />
            </SearchResultHeader>
            <SearchResultWrapper>
              <SearchPhotographerList
                photographers={photographers}
                onEndReached={onLoadMore}
                onRefresh={onRefresh}
                isFetchingNextPage={isFetchingNextPage}
                onPressItem={onPressPhotographer}
              />
            </SearchResultWrapper>
          </>
        )}
      </ScreenContainer>

      {isFilterModalOpen && (
        <FilterModal
          initialIndex={initialFilterIndex}
          categories={filterCategories}
          selectedFilters={selectedFilters}
          onClose={onCloseFilterModal}
          onApply={onApplyFilters}
        />
      )}
    </>
  );
}

const CONTAINER_PADDING = 20;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding: 0 ${CONTAINER_PADDING}px;
`

const SearchInputWrapper = styled.View`
  flex: 1;
  flex-direction: row;
  padding-horizontal: 12px;
  border: 1px solid ${theme.colors.disabled};
  border-radius: 8px;
  height: 41px;
  margin-left: 13px;
  align-items: center;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  color: #000;
  font-size: 14px;
  font-family: Pretendard-Regular;
  margin-right: 10px;
`;

const FilterWrapper = styled.View`
  width: 100%;
  padding: 0 ${CONTAINER_PADDING}px;
`

const SearchResultHeader = styled.View`
  flex-direction: row;
  padding-horizontal: ${CONTAINER_PADDING}px;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 33px;
  margin-bottom: 20px;
  position: relative;
  z-index: 2;
`

const SearchResultWrapper = styled.View`
  flex: 1;
  width: 100%;
`

const EmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`