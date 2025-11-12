import styled from '@/utils/scale/CustomStyled.ts';
import Typography from '@/components/theme/Typography.tsx';
import Icon from '@/components/Icon.tsx';
import { theme } from '@/theme';
import { Photographer } from '@/types/photographer';
import { FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';

interface SearchPhotographerListProps {
  photographers: Photographer[];
  onEndReached: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  isFetchingNextPage: boolean;
  onPressItem: (photographerId: string) => void;
}

export default function SearchPhotographerList({
  photographers,
  onEndReached,
  onRefresh,
  isRefreshing,
  isFetchingNextPage,
  onPressItem,
}: SearchPhotographerListProps) {
  return (
    <FlatList
      data={photographers}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <SearchPhotographerItem photographer={item} onPress={() => onPressItem(item.id)} />
      )}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      ListFooterComponent={
        isFetchingNextPage ? (
          <LoadingWrapper>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </LoadingWrapper>
        ) : (
          <ScrollSpacer />
        )
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

interface SearchPhotographerItemProps {
  photographer: Photographer;
  onPress: () => void;
}

const SearchPhotographerItem = ({ photographer, onPress }: SearchPhotographerItemProps) => {
  const formatPrice = (price: number) => {
    return price.toLocaleString();
  };

  return (
    <SearchPhotographerItemContainer>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 5 }}
      >
        {photographer.portfolioImages.map((item, index) => (
          <PhotofolioImageWrapper key={`${photographer.id}-${index}`}>
            {/*<PhotofolioImage source={{ uri: item }} />*/}
            <PhotofolioImage source={require('@/assets/imgs/snap-sample2.png')} />
          </PhotofolioImageWrapper>
        ))}
      </ScrollView>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
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
            {photographer.rating.toFixed(1)} ({photographer.reviewCount})
          </Typography>
        </PhotographerInfoWrapper>
        <PhotographerInfoWrapper>
          <Typography fontSize={11} fontWeight="medium" lineHeight="140%" letterSpacing="-2.5%">
            {photographer.shootingUnit} {formatPrice(photographer.price)}원
          </Typography>
        </PhotographerInfoWrapper>
        <PhotographerLabelWrapper>
          {photographer.isPartner && <PhotographerLabel text="파트너 작가" special />}
          <PhotographerLabel text={photographer.gender} />
          {photographer.shootingTypes.map((type, index) => (
            <PhotographerLabel key={index} text={type} />
          ))}
        </PhotographerLabelWrapper>
      </TouchableOpacity>
    </SearchPhotographerItemContainer>
  );
};

const SearchPhotographerItemContainer = styled.View`
  width: 100%;
  margin-bottom: 19px;
`

const PhotofolioImageWrapper = styled.View`
  width: 101px;
  height: 101px;
  overflow: hidden;
  border-radius: 5px;
  margin-right: 5px;
`

const PhotofolioImage = styled.Image`
  width: 101px;
  height: 101px;
  resize-mode: cover;
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
  background-color: ${({ special }) => special ? "#EAFFFA" : "#EAEAEA"};
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

const LoadingWrapper = styled.View`
  padding-vertical: 20px;
  align-items: center;
  justify-content: center;
`;

const ScrollSpacer = styled.View`
  height: 50px;
`;