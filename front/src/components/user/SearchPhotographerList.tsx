import styled from '@/utils/scale/CustomStyled.ts';
import Typography from '@/components/theme/Typography.tsx';
import Icon from '@/components/Icon.tsx';
import { theme } from '@/theme';
import { PhotographerSearchItem } from '@/api/photographers.ts';
import { FlatList, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import Loading from '@/components/Loading.tsx';
import AIIcon from '@/assets/icons/ai-button-small.svg';
import StarIcon from '@/assets/icons/star-review.svg';
import ServerImage from '@/components/ServerImage.tsx';
import { formatNumber } from '@/utils/format.ts';

interface SearchPhotographerListProps {
  photographers: PhotographerSearchItem[];
  onEndReached: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  isFetchingNextPage: boolean;
  onPressItem: (photographerId: string) => void;
  aiRecommendationScore?: number;
  isAIRecommendation?: boolean;
}

export default function SearchPhotographerList({
  photographers,
  onEndReached,
  onRefresh,
  isRefreshing,
  isFetchingNextPage,
  onPressItem,
  aiRecommendationScore,
  isAIRecommendation = false,
}: SearchPhotographerListProps) {
  return (
    <FlatList
      testID="photographer-list"
      data={photographers}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <SearchPhotographerItem
          photographer={item}
          onPress={() => onPressItem(item.id)}
          aiRecommendationScore={aiRecommendationScore}
          isAIRecommendation={isAIRecommendation}
        />
      )}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      ListFooterComponent={
        isFetchingNextPage ? (
          <Loading size="small" variant="inline" />
        ) : (
          <ScrollSpacer />
        )
      }
      ItemSeparatorComponent={ItemSeparator}
      showsVerticalScrollIndicator={false}
    />
  );
}

interface SearchPhotographerItemProps {
  photographer: PhotographerSearchItem;
  onPress: () => void;
  aiRecommendationScore?: number;
  isAIRecommendation?: boolean;
}

const SearchPhotographerItem = ({ photographer, onPress, aiRecommendationScore, isAIRecommendation = false }: SearchPhotographerItemProps) => {
  const genderLabel = photographer.gender === 'MALE' ? '남성작가' : '여성작가';

  return (
    <SearchPhotographerItemContainer>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {aiRecommendationScore !== undefined && (
          <ResultCaption>
            <Icon width={13} height={13} Svg={AIIcon} />
            <Typography fontSize={10} color="primary" marginLeft={5}>
              AI 추천 적합도 {aiRecommendationScore}%
            </Typography>
          </ResultCaption>
        )}
        {photographer.portfolioImages.length > 0 &&
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 5 }}
          >
            {photographer.portfolioImages.map((item, index) => (
              <PhotofolioImageWrapper key={`${photographer.id}-${index}`}>
                <PhotofolioImage uri={item} />
              </PhotofolioImageWrapper>
            ))}
          </ScrollView>
        }
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
            기본촬영/{photographer.baseTime}시간{' '}
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
      </TouchableOpacity>
    </SearchPhotographerItemContainer>
  );
};

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