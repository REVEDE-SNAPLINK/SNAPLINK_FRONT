import ScreenContainer from '@/components/ScreenContainer.tsx';
import styled from '@/utils/scale/CustomStyled.ts';
import Icon from '@/components/Icon.tsx';
import { theme } from '@/theme';
import Filter from '@/components/user/filter/Filter.tsx';
import FilterModal from '@/components/user/filter/FilterModal.tsx';
import { FilterCategory, FilterValue, FilterChip } from '@/types/filter';
import Typography from '@/components/theme/Typography.tsx';
import SearchPhotographerList from '@/components/user/SearchPhotographerList';
import { Photographer } from '@/types/photographer';
import BackButton from '@/components/BackButton.tsx';

interface SearchPhotographerViewProps {
  onPressBack: () => void;
  searchKey: string;
  onChangeSearchKey: (key: string) => void;
  onSubmitSearchKey: () => void;
  filterCategories: FilterCategory[];
  activeCategoryIds: string[];
  filterChips: FilterChip[];
  onPressFilter: () => void;
  onPressCategoryChip: (categoryId: string) => void;
  onPressFilterChip: (chipId: string) => void;
  isFilterModalOpen: boolean;
  onCloseFilterModal: () => void;
  selectedFilters: FilterValue[];
  onApplyFilters: (filters: FilterValue[]) => void;
  photographers: Photographer[];
  totalCount: number;
  sortBy: 'recommended' | 'latest';
  onToggleSort: () => void;
  onLoadMore: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  isFetchingNextPage: boolean;
  onPressPhotographer: (photographerId: string) => void;
}

export default function SearchPhotographerView({
  onPressBack,
  searchKey,
  onChangeSearchKey,
  onSubmitSearchKey,
  filterCategories,
  activeCategoryIds,
  filterChips,
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
  onToggleSort,
  onLoadMore,
  onRefresh,
  isRefreshing,
  isFetchingNextPage,
  onPressPhotographer,
}: SearchPhotographerViewProps) {
  return (
    <>
      <ScreenContainer paddingHorizontal={20}>
        <Header>
          <BackButton onPress={onPressBack} />
          <SearchInputWrapper>
            <SearchInput
              value={searchKey}
              onChangeText={onChangeSearchKey}
              onSubmitEditing={() => onSubmitSearchKey()}
            />
            <Icon width={24} height={24} source={require('@/assets/icons/search.png')} />
          </SearchInputWrapper>
        </Header>
        <Filter
          categories={filterCategories}
          activeCategoryIds={activeCategoryIds}
          filterChips={filterChips}
          onPressFilterButton={onPressFilter}
          onPressCategoryChip={onPressCategoryChip}
          onPressFilterChip={onPressFilterChip}
        />
        <SearchResultHeader>
          <Typography fontSize={12} lineHeight="140%" letterSpacing="-2.5%" color={theme.colors.disabled}>
            {totalCount}명
          </Typography>
          <SortButton onPress={onToggleSort}>
            <Typography
              fontSize={12}
              lineHeight="140%"
              letterSpacing="-2.5%"
              color={theme.colors.disabled}
              marginRight={1.5}
            >
              {sortBy === 'recommended' ? '추천순' : '최신순'}
            </Typography>
            <Icon width={14} height={14} source={require('@/assets/icons/swap.png')} />
          </SortButton>
        </SearchResultHeader>
        <SearchResultWrapper>
          <SearchPhotographerList
            photographers={photographers}
            onEndReached={onLoadMore}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
            isFetchingNextPage={isFetchingNextPage}
            onPressItem={onPressPhotographer}
          />
        </SearchResultWrapper>
      </ScreenContainer>

      {isFilterModalOpen && (
        <FilterModal
          categories={filterCategories}
          selectedFilters={selectedFilters}
          onClose={onCloseFilterModal}
          onApply={onApplyFilters}
        />
      )}
    </>
  );
}

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
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

const SearchResultHeader = styled.View`
  flex-direction: row;
  padding-horizontal: 3px;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 33px;
  margin-bottom: 20px;
`

const SortButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`

const SearchResultWrapper = styled.View`
  flex: 1;
  width: 100%;
`