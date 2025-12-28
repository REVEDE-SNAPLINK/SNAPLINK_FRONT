import ScreenContainer from '@/components/common/ScreenContainer';
import styled from '@/utils/scale/CustomStyled.ts';
import Typography from '@/components/theme/Typography.tsx';
import { theme } from '@/theme';
import { PhotographerSearchItem } from '@/api/photographers.ts';
import { FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import Icon from '@/components/Icon.tsx';
import Loading from '@/components/Loading.tsx';

interface BookmarksViewProps {
  photographers: PhotographerSearchItem[];
  totalCount: number;
  onPressPhotographer: (photographerId: string) => void;
  onLoadMore: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  isFetchingNextPage: boolean;
}

export default function BookmarksView({
  photographers,
  totalCount,
  onPressPhotographer,
  onLoadMore,
  onRefresh,
  isRefreshing,
  isFetchingNextPage,
}: BookmarksViewProps) {
  const hasBookmarks = photographers.length > 0;

  return (
    <ScreenContainer
      headerShown={true}
      headerTitle="스크랩"
      paddingHorizontal={20}
    >
      {!hasBookmarks ? (
        <EmptyContainer>
          <Typography
            fontSize={16}
            fontWeight="medium"
            color="#AAAAAA"
            style={{ textAlign: 'center' }}
          >
            아직 스크랩한 작가가 없어요.
          </Typography>
        </EmptyContainer>
      ) : (
        <>
          <BookmarkCountHeader>
            <Typography fontSize={12} lineHeight="140%" letterSpacing="-2.5%" color={theme.colors.disabled}>
              스크랩한 작가 총 {totalCount}명
            </Typography>
          </BookmarkCountHeader>
          <BookmarkListWrapper>
            <FlatList
              testID="bookmarks-list"
              data={photographers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <BookmarkedPhotographerItem
                  photographer={item}
                  onPress={() => onPressPhotographer(item.id)}
                />
              )}
              onEndReached={onLoadMore}
              onEndReachedThreshold={0.5}
              refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
              ListFooterComponent={
                isFetchingNextPage ? (
                  <Loading size="small" variant="inline" />
                ) : (
                  <ScrollSpacer />
                )
              }
              showsVerticalScrollIndicator={false}
            />
          </BookmarkListWrapper>
        </>
      )}
    </ScreenContainer>
  );
}

interface BookmarkedPhotographerItemProps {
  photographer: PhotographerSearchItem;
  onPress: () => void;
}

const BookmarkedPhotographerItem = ({
  photographer,
  onPress,
}: BookmarkedPhotographerItemProps) => {
  const formatPrice = (price: number) => {
    return price.toLocaleString();
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}분`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
  };

  const genderLabel = photographer.gender === 'WOMAN' ? '여성작가' : '남성작가';

  return (
    <BookmarkedPhotographerItemContainer>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <PortfolioImagesWrapper>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={photographer.portfolioImages}
            keyExtractor={(item, index) => `${photographer.id}-${index}`}
            renderItem={({ item }) => (
              <PhotofolioImageWrapper>
                <PhotofolioImage source={{ uri: item }} />
              </PhotofolioImageWrapper>
            )}
            style={{ marginBottom: 5 }}
          />
        </PortfolioImagesWrapper>
        <PhotographerInfoWrapper>
          <Typography
            fontSize={12}
            fontWeight="bold"
            lineHeight="140%"
            letterSpacing="-2.5%"
            marginRight={6}
          >
            {photographer.nickname}
          </Typography>
          <Icon width={13} height={12} source={require('@/assets/icons/star-review.png')} />
          <Typography fontSize={11} lineHeight="140%" letterSpacing="-2.5%" color="textSecondary">
            {photographer.averageRating.toFixed(1)} ({photographer.reviewCount})
          </Typography>
        </PhotographerInfoWrapper>
        <PhotographerInfoWrapper>
          <Typography fontSize={11} fontWeight="medium" lineHeight="140%" letterSpacing="-2.5%">
            {formatTime(photographer.baseTime)} {formatPrice(photographer.basePrice)}원
          </Typography>
        </PhotographerInfoWrapper>
        <PhotographerLabelWrapper>
          <PhotographerLabel text={genderLabel} />
          {photographer.concepts.map((concept, index) => (
            <PhotographerLabel key={index} text={concept} />
          ))}
        </PhotographerLabelWrapper>
      </TouchableOpacity>
    </BookmarkedPhotographerItemContainer>
  );
};

const EmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const BookmarkCountHeader = styled.View`
  padding-horizontal: 3px;
  width: 100%;
  margin-top: 33px;
  margin-bottom: 20px;
`;

const BookmarkListWrapper = styled.View`
  flex: 1;
  width: 100%;
`;

const BookmarkedPhotographerItemContainer = styled.View`
  width: 100%;
  margin-bottom: 19px;
`;

const PortfolioImagesWrapper = styled.View`
  position: relative;
`;

const PhotofolioImageWrapper = styled.View`
  width: 101px;
  height: 101px;
  overflow: hidden;
  border-radius: 5px;
  margin-right: 5px;
`;

const PhotofolioImage = styled.Image`
  width: 101px;
  height: 101px;
  resize-mode: cover;
`;

const PhotographerInfoWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 6px;
`;

const PhotographerLabelWrapper = styled.View`
  flex-direction: row;
  align-items: center;
`;

const PhotographerLabelContainer = styled.View<{ special: boolean }>`
  height: 17px;
  padding-horizontal: 4px;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  margin-right: 5px;
  background-color: ${({ special }) => (special ? '#EAFFFA' : theme.colors.bgSecondary)};
  ${({ special }) => special && `border: 1px solid ${theme.colors.primary};`}
`;

const PhotographerLabel = ({ special = false, text }: { special?: boolean; text: string }) => {
  return (
    <PhotographerLabelContainer special={special}>
      <Typography
        fontSize={8}
        letterSpacing="-2.5%"
        color={special ? theme.colors.primary : theme.colors.textPrimary}
      >
        {text}
      </Typography>
    </PhotographerLabelContainer>
  );
};

const ScrollSpacer = styled.View`
  height: 50px;
`;