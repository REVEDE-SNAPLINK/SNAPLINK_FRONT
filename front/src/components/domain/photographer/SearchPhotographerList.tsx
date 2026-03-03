import styled from '@/utils/scale/CustomStyled.ts';
import Typography from '@/components/ui/Typography.tsx';
import Icon from '@/components/ui/Icon.tsx';
import { theme } from '@/theme';
import { PhotographerSearchItem } from '@/api/photographers.ts';
import { RefreshControl, ScrollView, Pressable } from 'react-native';
import { LegendList } from '@legendapp/list';
import Loading from '@/components/feedback/Loading.tsx';
import AIIcon from '@/assets/icons/ai-button-small.svg';
import StarIcon from '@/assets/icons/star-review.svg';
import ServerImage from '@/components/ui/ServerImage.tsx';
import { formatNumber } from '@/utils/format.ts';
import { memo, useState, useCallback, useEffect } from 'react';
import { InteractionManager } from 'react-native';
interface SearchPhotographerListProps {
  photographers: PhotographerSearchItem[];
  onEndReached: () => void;
  onRefresh: () => void;
  isFetchingNextPage: boolean;
  onPressItem: (photographerId: string) => void;
  aiRecommendationScore?: number;
  isAIRecommendation?: boolean;
}

export default function SearchPhotographerList({
  photographers,
  onEndReached,
  onRefresh,
  isFetchingNextPage,
  onPressItem,
  aiRecommendationScore,
  isAIRecommendation = false,
}: SearchPhotographerListProps) {
  const [localRefreshing, setLocalRefreshing] = useState(false);
  const [isInteractionsComplete, setIsInteractionsComplete] = useState(false);

  useEffect(() => {
    // 네비게이션 애니메이션(탭 전환 등)이 끝난 후 FlatList 목록을 띄워 버벅임 해소
    const interactionTask = InteractionManager.runAfterInteractions(() => {
      setIsInteractionsComplete(true);
    });
    return () => interactionTask.cancel();
  }, []);

  const handleRefresh = async () => {
    setLocalRefreshing(true);
    await onRefresh();
    // 데이터가 로드된 후 레이아웃이 계산될 아주 짧은 시간을 벌어줌
    setTimeout(() => {
      setLocalRefreshing(false);
    }, 100);
  };

  return (
    <LegendList
      testID="photographer-list"
      data={isInteractionsComplete ? photographers : []}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <MemoizedSearchPhotographerItem
          photographer={item}
          index={index}
          onPress={onPressItem}
          aiRecommendationScore={aiRecommendationScore}
          isAIRecommendation={isAIRecommendation}
        />
      )}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={!isAIRecommendation ? <RefreshControl refreshing={localRefreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} /> : undefined}
      ListFooterComponent={
        isFetchingNextPage ? (
          <Loading size="small" variant="inline" />
        ) : (
          <ScrollSpacer />
        )
      }
      ItemSeparatorComponent={ItemSeparator}
      showsVerticalScrollIndicator={false}
      estimatedItemSize={250}
      recycleItems={true}
      drawDistance={800}
    />
  );
}

interface SearchPhotographerItemProps {
  photographer: PhotographerSearchItem;
  index: number;
  onPress: (id: string) => void;
  aiRecommendationScore?: number;
  isAIRecommendation?: boolean;
}


export const SearchPhotographerItem = ({ photographer, index, onPress, aiRecommendationScore, isAIRecommendation = false }: SearchPhotographerItemProps) => {
  const genderLabel = photographer.gender === 'MALE' ? '남성작가' : '여성작가';

  // onPress 함수 재생성을 막아 React.memo가 깨지지 않게 콜백 래핑
  const handlePress = useCallback(() => {
    onPress(photographer.id);
  }, [onPress, photographer.id]);

  const baseHour = ~~(photographer.baseTime / 60);
  const baseMinute = photographer.baseTime % 60;

  return (
    <SearchPhotographerItemContainer>
      {aiRecommendationScore !== undefined && (
        <ResultCaption>
          <Icon width={13} height={13} Svg={AIIcon} />
          <Typography fontSize={10} color="primary" marginLeft={5}>
            AI 추천 적합도 {aiRecommendationScore}%
          </Typography>
        </ResultCaption>
      )}
      {photographer.portfolioImages.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 5 }}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {photographer.portfolioImages.map((item, photoIndex) => (
            <Pressable key={`${photographer.id}-${photoIndex}`} onPress={handlePress}>
              <PhotofolioImageWrapper>
                <PhotofolioImage
                  uri={item}
                  requestWidth={202}
                  priority={index < 2 && photoIndex === 0 ? 'high' : (index > 4 ? 'low' : 'normal')}
                  recyclingKey={item}
                />
              </PhotofolioImageWrapper>
            </Pressable>
          ))}
        </ScrollView>
      )}
      <Pressable onPress={handlePress}>
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
          <Icon width={13} height={12} Svg={StarIcon} />
          <Typography
            fontSize={11}
            lineHeight="140%"
            letterSpacing="-2.5%"
            color="textSecondary"
          >
            {photographer.averageRating.toFixed(1)} ({photographer.reviewCount})
          </Typography>
        </PhotographerInfoWrapper>
        <PhotographerInfoWrapper>
          <Typography
            fontSize={11}
            fontWeight="medium"
            lineHeight="140%"
            letterSpacing="-2.5%"
          >
            기본촬영/{baseHour}시간{baseMinute > 0 ? ` ${baseMinute}분` : ''}{' '}
            {formatNumber(photographer.basePrice)}원
          </Typography>
        </PhotographerInfoWrapper>
        <PhotographerLabelWrapper>
          <PhotographerLabel text={genderLabel} special={isAIRecommendation} />
          {photographer.concepts.map((concept, index) => (
            <PhotographerLabel
              key={index}
              text={concept}
              special={isAIRecommendation}
            />
          ))}
        </PhotographerLabelWrapper>
      </Pressable>
    </SearchPhotographerItemContainer>
  );
};

// React.memo를 사용해 부모가 리렌더되더라도 아이템 데이터가 같으면 아이템은 재렌더 안함
export const MemoizedSearchPhotographerItem = memo(SearchPhotographerItem, (prevProps, nextProps) => {
  return (
    prevProps.photographer.id === nextProps.photographer.id &&
    prevProps.index === nextProps.index &&
    prevProps.aiRecommendationScore === nextProps.aiRecommendationScore &&
    prevProps.isAIRecommendation === nextProps.isAIRecommendation
  );
});

const SearchPhotographerItemContainer = styled.View`
  width: 100%;
  padding: 0 20px;
`

const PhotofolioImageWrapper = styled.View`
  width: 101px;
  height: 101px;
  overflow: hidden;
  border-radius: 5px;
  margin-right: 5px;
`

const PhotofolioImage = styled(ServerImage)`
  width: 100%;
  height: 100%;
`

const PhotographerInfoWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 6px;
`

const PhotographerLabelWrapper = styled.View`
  flex-direction: row;
  align-items: center;
`

const PhotographerLabelContainer = styled.View<{ special: boolean }>`
  height: 17px;
  padding-horizontal: 4px;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  margin-right: 5px;
  border-radius: 5px;
  background-color: ${({ special }) => special ? "#EAFFFA" : theme.colors.bgSecondary};
  ${({ special }) => special && `border: 1px solid ${theme.colors.primary};`}
`

const PhotographerLabel = ({
  special = false,
  text,
}: { special?: boolean; text: string }) => {
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

const ResultCaption = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 5px;
  z-index: 1;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
`;

const ItemSeparator = styled.View`
  height: 1px;
  background: ${theme.colors.disabled};
  margin-vertical: 15px;
`