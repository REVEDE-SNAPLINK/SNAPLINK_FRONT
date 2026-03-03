import ScreenContainer from '@/components/layout/ScreenContainer.tsx';
import styled from '@/utils/scale/CustomStyled.ts';
import Icon from '@/components/ui/Icon.tsx';
import SearchIcon from '@/assets/icons/search.svg';
import { Typography } from '@/components/ui';
import Filter from '@/components/domain/photographer/Filter.tsx';
import FilterModal from '@/components/domain/photographer/FilterModal.tsx';
import { FilterCategory, FilterValue, FilterChip } from '@/types/filter.ts';
import SearchPhotographerList from '@/components/domain/photographer/SearchPhotographerList.tsx';
import { PhotographerSearchItem } from '@/api/photographers.ts';
import { FlatList, RefreshControl } from 'react-native';
import Loading from '@/components/feedback/Loading.tsx';
import LoadingSpinner from '@/components/feedback/LoadingSpinner.tsx';

interface PhotographerWithScore extends PhotographerSearchItem {
  aiScore: number;
}

interface AIRecommdationResultViewProps {
  onPressBack: () => void;
  nickname: string;
  resultCounts: number;
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
  photographers: PhotographerWithScore[];
  onLoadMore: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  isFetchingNextPage: boolean;
  onPressPhotographer: (photographerId: string) => void;
  isLoading: boolean;
  navigation?: any;
}

export default function AIRecommdationResultView({
  onPressBack,
  nickname,
  resultCounts,
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
  onLoadMore,
  onRefresh,
  isRefreshing,
  isFetchingNextPage,
  onPressPhotographer,
  isLoading,
  navigation,
}: AIRecommdationResultViewProps) {
  return (
    <>
      <ScreenContainer
        headerTitle="AI 추천 작가 확인"
        onPressBack={onPressBack}
        navigation={navigation}
      >
        {!isLoading &&
          <>
            <Header>
              <Icon width={19} height={20} Svg={SearchIcon} />
              <Typography fontSize={16} fontWeight="semiBold" marginLeft={15}>
                {nickname}님 컨셉에 가장 잘 맞는 사진 작가들을{'\n'}
                분석한 결과로{' '}
                <Typography fontSize={16} fontWeight="semiBold" color="primary">
                  {resultCounts}명
                </Typography>
                의 작가를 찾았어요!
              </Typography>
            </Header>
            <DividerWrapper>
              <Divider />
            </DividerWrapper>
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
          </>
        }
        <SearchResultWrapper>
          {!isLoading && (
            <FlatList
              testID="photographer-list"
              data={photographers}
              keyExtractor={item => item.id}
              ListHeaderComponent={SearchResultHeader}
              renderItem={({ item }) => (
                <SearchPhotographerList
                  photographers={[item]}
                  onEndReached={() => {}}
                  onRefresh={onRefresh}
                  isFetchingNextPage={false}
                  onPressItem={onPressPhotographer}
                  aiRecommendationScore={item.aiScore}
                  isAIRecommendation={true}
                />
              )}
              onEndReached={onLoadMore}
              onEndReachedThreshold={0.5}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={onRefresh}
                />
              }
              ListFooterComponent={
                isFetchingNextPage ? (
                  <Loading size="small" variant="inline" />
                ) : null
              }
              showsVerticalScrollIndicator={false}
            />
          )}
        </SearchResultWrapper>
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

      <LoadingSpinner visible={isLoading} />
    </>
  );
}

const Header = styled.View`
  flex-direction: row;
  align-items: center;
`

const FilterWrapper = styled.View`
  padding-horizontal: 20px;
`

const DividerWrapper = styled.View`
  align-items: center;
  margin-top: 30px;
`

const Divider = styled.View`
  width: 326px;
  height: 1px;
  background-color: #C8C8C8;
`

const SearchResultWrapper = styled.View`
  flex: 1;
  width: 100%;
`

const SearchResultHeader = styled.View`
  height: 30px;
`