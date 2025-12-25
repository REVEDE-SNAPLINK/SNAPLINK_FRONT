import ScreenContainer from '@/components/ScreenContainer.tsx';
import styled from '@/utils/scale/CustomStyled.ts';
import Typography from '@/components/theme/Typography.tsx';
import { theme } from '@/theme';
import { Photographer } from '@/types/photographer.ts';
import { ScrollView, TouchableOpacity } from 'react-native';
import Icon from '@/components/Icon.tsx';
import BookmarkColorIcon from '@/assets/icons/bookmark-color.svg';

interface BookmarksViewProps {
  photographers: Photographer[];
  totalCount: number;
  onPressPhotographer: (photographerId: string) => void;
  onPressBookmark: (photographerId: string) => void;
}

export default function BookmarksView({
  photographers,
  totalCount,
  onPressPhotographer,
  onPressBookmark,
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
            <ScrollView showsVerticalScrollIndicator={false}>
              {photographers.map((photographer) => (
                <BookmarkedPhotographerItem
                  key={photographer.id}
                  photographer={photographer}
                  onPress={() => onPressPhotographer(photographer.id)}
                  onPressBookmark={() => onPressBookmark(photographer.id)}
                />
              ))}
              <ScrollSpacer />
            </ScrollView>
          </BookmarkListWrapper>
        </>
      )}
    </ScreenContainer>
  );
}

interface BookmarkedPhotographerItemProps {
  photographer: Photographer;
  onPress: () => void;
  onPressBookmark: () => void;
}

const BookmarkedPhotographerItem = ({
  photographer,
  onPress,
  onPressBookmark,
}: BookmarkedPhotographerItemProps) => {
  const formatPrice = (price: number) => {
    return price.toLocaleString();
  };

  return (
    <BookmarkedPhotographerItemContainer>
      <PortfolioImagesWrapper>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 5 }}>
          {photographer.portfolioImages.map((item, index) => (
            <PhotofolioImageWrapper key={`${photographer.id}-${index}`}>
              <PhotofolioImage source={require('@/assets/imgs/snap-sample2.png')} />
            </PhotofolioImageWrapper>
          ))}
        </ScrollView>
        <BookmarkButton onPress={onPressBookmark}>
          <Icon width={24} height={24} Svg={BookmarkColorIcon} />
        </BookmarkButton>
      </PortfolioImagesWrapper>
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

const BookmarkButton = styled.TouchableOpacity`
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 0.9);
  justify-content: center;
  align-items: center;
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