import ScreenContainer from '@/components/ScreenContainer.tsx';
import styled from '@/utils/scale/CustomStyled.ts';
import Icon from '@/components/Icon.tsx';
import { theme } from '@/theme';
import Filter from '@/components/user/filter/Filter.tsx';
import FilterModal from '@/components/user/filter/FilterModal.tsx';
import { FilterCategory, FilterValue, FilterChip } from '@/types/filter.ts';
import Typography from '@/components/theme/Typography.tsx';
import SearchPhotographerList from '@/components/user/SearchPhotographerList.tsx';
import { PhotographerSearchItem } from '@/api/photographers.ts';
import BackButton from '@/components/BackButton.tsx';
import SwapIcon from '@/assets/icons/swap.svg'
import { useState } from 'react';

const SORT_BY_ENUM = {
  'LATEST': '최신순',
  'REVIEWS': '후기 많은 순',
  'HIGH_PRICE': '가격순(높은 순)',
  'LOW_PRICE': '가격순(낮은 순)',
  'DEFAULT': '기본 순'
};

export type SortByKey = keyof typeof SORT_BY_ENUM;

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
  photographers: PhotographerSearchItem[];
  totalCount: number;
  sortBy: SortByKey;
  onChangeSortBy: (key: SortByKey) => void;
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
  onChangeSortBy,
  onLoadMore,
  onRefresh,
  isRefreshing,
  isFetchingNextPage,
  onPressPhotographer,
}: SearchPhotographerViewProps) {
  const [openSortBy, setOpenSortBy] = useState<boolean>(false);

  return (
    <>
      <ScreenContainer paddingHorizontal={20} headerShown={false}>
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
          <SortButtonWrapper>
            {openSortBy && (
              <SortList>
                {(Object.keys(SORT_BY_ENUM) as SortByKey[]).map((s, i) => (
                  <SortItem
                    key={s}
                    onPress={() => {
                      onChangeSortBy(s);
                      setOpenSortBy(false)
                    }}
                    isSelected={sortBy === s}
                    {...(i === Object.keys(SORT_BY_ENUM).length - 1 ? { isLast: true } : i === 0 ? { isFirst: true } : {})}
                  >
                    <Typography fontSize={12} fontWeight="semiBold" color={sortBy === s ? '#fff' : 'textPrimary'}>
                      {SORT_BY_ENUM[s]}
                    </Typography>
                  </SortItem>
                ))}
              </SortList>
            )}
            <SortButton onPress={() => setOpenSortBy(!openSortBy)}>
              <Typography
                fontSize={12}
                lineHeight="140%"
                letterSpacing="-2.5%"
                color={theme.colors.disabled}
                marginRight={1.5}
              >
                {SORT_BY_ENUM[sortBy]}
              </Typography>
              <Icon width={14} height={14} Svg={SwapIcon} />
            </SortButton>
          </SortButtonWrapper>
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

const SortButtonWrapper = styled.View`
  
`

const SortButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`

const SearchResultWrapper = styled.View`
  flex: 1;
  width: 100%;
`

const SortList = styled.View`
  width: 120px;
  border-radius: 10px;
  background-color: #fff;
  position: absolute;
  right: 0;
  top: 20px;
  box-shadow: 0px 2px 6px rgba(0,0,0,0.15);
  z-index: 100;
`

const SortItem = styled.TouchableOpacity<{ isFirst?: boolean, isLast?: boolean, isSelected: boolean }>`
  width: 100%;
  height: 40px;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 101;
  ${({ isFirst }) => isFirst && `
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  `}
  ${({ isLast }) => !isLast ? `
    border-bottom-width: 1px;
    border-bottom-style: solid;
    border-bottom-color: #C8C8C8;
   ` : `
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
   `
  }
  ${({ isSelected }) => isSelected && `
    background-color: ${theme.colors.primary};
  `}
`