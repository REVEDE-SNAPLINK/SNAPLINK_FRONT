import React from 'react';
import {
  FlatList,
  Dimensions,
} from 'react-native';
import ScreenContainer from '@/components/ScreenContainer';
import styled from '@/utils/scale/CustomStyled';
import Typography from '@/components/theme/Typography';
import Icon from '@/components/Icon';
import Loading from '@/components/Loading';
import { theme } from '@/theme';
import type { PhotographerDetails, PortfolioImage } from '@/types/photographer';
import HeartIcon from '@/assets/icons/heart.svg';
import ChatIcon from '@/assets/icons/chat.svg';
import UploadIcon from '@/assets/icons/upload.svg';
import SubmitButton from '@/components/theme/SubmitButton.tsx';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_MARGIN = 2;
const GRID_COLUMNS = 3;
const HORIZONTAL_PADDING = 17;
const IMAGE_SIZE = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - GRID_MARGIN * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

interface PhotographerDetailsViewProps {
  photographer: PhotographerDetails | null;
  portfolioImages: PortfolioImage[];
  isLoadingPhotographer: boolean;
  isFetchingNextPage: boolean;
  onPressBack: () => void;
  onPressUpload: () => void;
  onPressFavorite: () => void;
  onPressInquiry: () => void;
  onPressReservation: () => void;
  onEndReached: () => void;
}

export default function PhotographerDetailsView({
  photographer,
  portfolioImages,
  isLoadingPhotographer,
  isFetchingNextPage,
  onPressBack,
  onPressUpload,
  onPressFavorite,
  onPressInquiry,
  onPressReservation,
  onEndReached,
}: PhotographerDetailsViewProps) {
  const renderPortfolioItem = ({ item }: { item: PortfolioImage }) => (
    <PortfolioImageWrapper>
      <PortfolioImage source={{ uri: item.url }} />
    </PortfolioImageWrapper>
  );

  const renderHeader = () => {
    if (!photographer) return null;

    return (
      <>
        <DefaultInfoWrapper>
          <ProfileImageWrapper>
            {photographer.profileImage && (
              <ProfileImage source={{ uri: photographer.profileImage }} />
            )}
          </ProfileImageWrapper>
          <Typography
            fontSize={16}
            fontWeight="semiBold"
            lineHeight="140%"
            letterSpacing="-2.5%"
            marginLeft={24}
          >
            {photographer.name}
          </Typography>
        </DefaultInfoWrapper>
        <IntroductionWrapper>
          <Typography
            fontSize={14}
            lineHeight="140%"
            letterSpacing="-2.5%"
            marginBottom={5}
          >
            작가 한줄 소개
          </Typography>
          <Typography
            fontSize={11}
            lineHeight="140%"
            letterSpacing="-2.5%"
            marginBottom={2}
          >
            {photographer.introduction}
          </Typography>
        </IntroductionWrapper>
        <Typography
          fontSize={16}
          fontWeight="semiBold"
          lineHeight="140%"
          letterSpacing="-2.5%"
          marginBottom={15.11}
          marginLeft={27}
        >
          포트폴리오
        </Typography>
      </>
    );
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return <Loading size="small" variant="inline" />;
  };

  if (isLoadingPhotographer) {
    return (
      <ScreenContainer
        headerShown={true}
        headerTitle=""
        onPressBack={onPressBack}
      >
        <Loading size="large" variant="fullscreen" />
      </ScreenContainer>
    );
  }

  if (!photographer) {
    return (
      <ScreenContainer
        headerShown={true}
        headerTitle=""
        onPressBack={onPressBack}
      >
        <ContentContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Typography fontSize={14} color={theme.colors.textSecondary}>
            작가 정보를 불러울 수 없습니다.
          </Typography>
        </ContentContainer>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      headerShown={true}
      headerTitle={photographer.nickname}
      onPressBack={onPressBack}
      headerToolIcon={UploadIcon}
      onPressTool={onPressUpload}
    >

      <ContentContainer>
        <FlatList
          data={portfolioImages}
          renderItem={renderPortfolioItem}
          keyExtractor={(item) => item.id}
          numColumns={GRID_COLUMNS}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{ gap: GRID_MARGIN, paddingHorizontal: 17 }}
          contentContainerStyle={{ gap: GRID_MARGIN, paddingBottom: 100 }}
        />
      </ContentContainer>

      {/* Bottom Action Buttons */}
      <BottomActionContainer>
        <ActionButton onPress={onPressFavorite}>
          <Icon width={24} height={24} Svg={HeartIcon} />
        </ActionButton>
        <ActionButton onPress={onPressInquiry}>
          <Icon width={24} height={24} Svg={ChatIcon} />
        </ActionButton>
        <SubmitButton text="예약하기" onPress={onPressReservation} width="100%" />
      </BottomActionContainer>
    </ScreenContainer>
  );
}

const ContentContainer = styled.View`
  flex: 1;
`;

const DefaultInfoWrapper = styled.View`
  padding-horizontal: 26px;
  width: 100%;
  flex-direction: row;
`;

const ProfileImageWrapper = styled.View`
  width: 88px;
  height: 88px;
  border-radius: 50%;
  overflow: hidden;
  justify-content: center;
  align-items: center;
  background-color: #F4F4F4;
`;

const ProfileImage = styled.Image`
  max-width: 100%;
  max-height: 100%;
  resize-mode: cover;
`;

const IntroductionWrapper = styled.View`
  margin-horizontal: 27px;
  margin-bottom: 20px;
  margin-top: 18px;
  border-bottom-width: 1px;
  border-bottom-color: ${theme.colors.disabled};
`;

const PortfolioImageWrapper = styled.View`
  width: ${IMAGE_SIZE}px;
  height: ${IMAGE_SIZE}px;
  background-color: #F4F4F4;
`;

const PortfolioImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const BottomActionContainer = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  flex-direction: row;
  background-color: #fff;
  width: 100%;
  padding-horizontal: 17px;
  padding-vertical: 22px;
  justify-content: space-between;
`;

const ActionButton = styled.TouchableOpacity`
  width: 49px;
  height: 49px;
  border-radius: 8px;
  background-color: ${theme.colors.primary};
  justify-content: center;
  align-items: center;
  margin-right: 5px;
`