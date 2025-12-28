import ScreenContainer from '@/components/common/ScreenContainer.tsx';
import styled from '@/utils/scale/CustomStyled.ts';
import Icon from '@/components/Icon.tsx';
import SearchIcon from '@/assets/icons/search.svg';
import { Typography } from '@/components/theme';
import Filter from '@/components/user/filter/Filter.tsx';
import FilterModal from '@/components/user/filter/FilterModal.tsx';
import { FilterCategory, FilterValue, FilterChip } from '@/types/filter.ts';
import SearchPhotographerList from '@/components/user/SearchPhotographerList.tsx';
import { PhotographerSearchItem } from '@/api/photographers.ts';
import { FlatList, RefreshControl } from 'react-native';
import Loading from '@/components/Loading.tsx';

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
  onPressFilter: () => void;
  onPressCategoryChip: (categoryId: string) => void;
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
}

export default function AIRecommdationResultView({
  onPressBack,
  nickname,
  resultCounts,
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
  onLoadMore,
  onRefresh,
  isRefreshing,
  isFetchingNextPage,
  onPressPhotographer,
} : AIRecommdationResultViewProps) {
  return (
    <>
      <ScreenContainer
        headerTitle="AI 추천 작가 확인"
        onPressBack={onPressBack}
        paddingHorizontal={20}
      >
        <Header>
          <Icon width={19} height={20} Svg={SearchIcon} />
          <Typography
            fontSize={16}
            fontWeight="semiBold"
            marginLeft={15}
          >
            {nickname}님 컨셉에 가장 잘 맞는 사진 작가들을{'\n'}
            분석한 결과로 <Typography fontSize={16} fontWeight="semiBold" color="primary">{resultCounts}명</Typography>의 작가를 찾았어요!
          </Typography>
        </Header>
        <DividerWrapper>
          <Divider />
        </DividerWrapper>
        <Filter
          categories={filterCategories}
          activeCategoryIds={activeCategoryIds}
          filterChips={filterChips}
          onPressFilterButton={onPressFilter}
          onPressCategoryChip={onPressCategoryChip}
          onPressFilterChip={onPressFilterChip}
        />
        <SearchResultWrapper>
          <FlatList
            testID="photographer-list"
            data={photographers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SearchPhotographerList
                photographers={[item]}
                onEndReached={() => {}}
                onRefresh={onRefresh}
                isRefreshing={false}
                isFetchingNextPage={false}
                onPressItem={onPressPhotographer}
                aiRecommendationScore={item.aiScore}
                isAIRecommendation={true}
              />
            )}
            onEndReached={onLoadMore}
            onEndReachedThreshold={0.5}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
            ListFooterComponent={
              isFetchingNextPage ? (
                <Loading size="small" variant="inline" />
              ) : null
            }
            showsVerticalScrollIndicator={false}
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
  )
}

const Header = styled.View`
  flex-direction: row;
  align-items: center;
`

const DividerWrapper = styled.View`
  align-items: center;
  margin-top: 30px;
  margin-bottom: 20px;
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