import React from 'react';
import {
  FlatList,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenContainer from '@/components/common/ScreenContainer';
import styled from '@/utils/scale/CustomStyled.ts';
import Typography from '@/components/theme/Typography.tsx';
import Icon from '@/components/Icon.tsx';
import Loading from '@/components/Loading.tsx';
import { theme } from '@/theme';
import BookmarkIcon from '@/assets/icons/bookmark-white.svg'
import ChatIcon from '@/assets/icons/chat-white.svg';
import UploadIcon from '@/assets/icons/upload.svg';
import LogoColorSmallIcon from '@/assets/icons/logo-color-icon-small.svg';
import InactiveStarIcon from '@/assets/icons/star-gray.svg'
import ActiveStarIcon from '@/assets/icons/star-color.svg'
import SubmitButton from '@/components/theme/SubmitButton.tsx';
import { GetPhotographerProfileResponse, PhotographerPortfolioThumb } from '@/api/photographers.ts';
import SlideModal from '@/components/theme/SlideModal.tsx';
import ServerImage from '@/components/ServerImage.tsx';
import CrossIcon from '@/assets/icons/cross-white.svg';
import { GetShootingResponse, mappingEditDeadline } from '@/api/shootings.ts';
import { formatNumber } from '@/utils/format.ts';
import TickSquareIcon from '@/assets/icons/tick-square.svg';
import EditIcon from '@/assets/icons/edit.svg';

export interface ShareLink {
  name: string;
  url: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_MARGIN = 2;
const GRID_COLUMNS = 3;
const HORIZONTAL_PADDING = 17;
const IMAGE_SIZE = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - GRID_MARGIN * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

const REVIEW_GRID_MARGIN = 2;
const REVIEW_GRID_COLUMNS = 4;
const REVIEW_GRID_CONTAINER_WIDTH = SCREEN_WIDTH - 44;
const REVIEW_PREVIEW_IMAGE_SIZE = (REVIEW_GRID_CONTAINER_WIDTH - REVIEW_GRID_MARGIN * (REVIEW_GRID_COLUMNS - 1)) / REVIEW_GRID_COLUMNS;

interface Review {
  id: string;
  content: string;
  date: string;
  imageUrl: string;
}

interface PhotographerDetailsViewProps {
  photographer: GetPhotographerProfileResponse | null;
  isPhotographer: boolean;
  isMyProfile: boolean;
  shootingData: GetShootingResponse | undefined;
  shootingOptions: string[];
  onPressAddPortfolio: () => void;
  portfolioImages: PhotographerPortfolioThumb[];
  isLoadingPhotographer: boolean;
  isFetchingNextPage: boolean;
  activeTab: 'portfolio' | 'reviews';
  portfolioCount: number;
  reviewCount: number;
  avgRating: number;
  reviewPreviewImages: string[];
  reviews: Review[];
  isScrapped: boolean;
  isMoreModalVisible: boolean;
  onCloseMoreModal: () => void;
  onPressMore: () => void;
  isReportModalVisible: boolean;
  onPressReportStart: () => void;
  onCloseReportModal: () => void;
  onPressEditProfile: () => void;
  reportType: string[];
  onPressReport: (type: string) => void;
  onPressBack: () => void;
  onPressShare: () => void;
  onPressFavorite: () => void;
  onPressInquiry: () => void;
  onPressReservation: () => void;
  onEndReached: () => void;
  onTabChange: (tab: 'portfolio' | 'reviews') => void;
  onPressPortfolioImage: (id: number) => void;
  onPressShowAllReviews: () => void;
  onPressShowAllReviewPhotos: () => void;
  navigation?: any;
}

export default function PhotographerDetailsView({
  photographer,
  isPhotographer,
  isMyProfile,
  shootingData,
  shootingOptions,
  onPressAddPortfolio,
  portfolioImages,
  isLoadingPhotographer,
  isFetchingNextPage,
  activeTab,
  portfolioCount,
  reviewCount,
  avgRating,
  reviewPreviewImages,
  reviews,
  isScrapped,
  isMoreModalVisible,
  onCloseMoreModal,
  onPressMore,
  isReportModalVisible,
  onPressReportStart,
  onCloseReportModal,
  onPressEditProfile,
  reportType,
  onPressReport,
  onPressBack,
  onPressShare,
  onPressFavorite,
  onPressInquiry,
  onPressReservation,
  onEndReached,
  onTabChange,
  onPressPortfolioImage,
  onPressShowAllReviews,
  onPressShowAllReviewPhotos,
  navigation,
}: PhotographerDetailsViewProps) {
  const insets = useSafeAreaInsets();

  const renderPortfolioItem = ({ item }: { item: PhotographerPortfolioThumb }) => (
    <PortfolioImageWrapper onPress={() => onPressPortfolioImage(item.id)}>
      <PortfolioImage uri={item.thumbnailUrl} />
    </PortfolioImageWrapper>
  );

  const renderHeader = () => {
    if (!photographer) return null;

    const safeResponseRate = Math.max(0, Math.min(100,
      typeof photographer.responseRate === 'number'
        ? photographer.responseRate
        : Number(photographer.responseRate) || 0
    ));

    return (
      <>
        <DefaultInfoWrapper>
          <ProfileImageWrapper>
            {photographer.profileImageUrl && (
              <ProfileImage uri={photographer.profileImageUrl} />
            )}
          </ProfileImageWrapper>
          <ProfileInfoWrapper>
            <NameWrapper>
              <Icon width={12} height={12} Svg={LogoColorSmallIcon} />
              <Typography
                fontSize={14}
                fontWeight="semiBold"
                lineHeight="140%"
                letterSpacing="-2.5%"
                marginLeft={5}
              >
                {photographer.nickname}
              </Typography>
            </NameWrapper>
            <IntroductionWrapper>
              <Typography
                fontSize={10}
                lineHeight="140%"
                letterSpacing="-2.5%"
              >
                {photographer.description}
              </Typography>
            </IntroductionWrapper>
          </ProfileInfoWrapper>
        </DefaultInfoWrapper>
        <ResponseRateContainer>
          <ResponseRateDescription>
            <Typography
              fontSize={11}
              lineHeight="140%"
              letterSpacing="-2.5%"
            >
              메시지 응답률 {safeResponseRate}%
            </Typography>
            <Typography
              fontSize={11}
              lineHeight="140%"
              letterSpacing="-2.5%"
            >
              {photographer.responseTime.includes("null") ? '' : `채팅 ${photographer.responseTime}`}
            </Typography>
          </ResponseRateDescription>
          <ResponseRateProgressBar>
            <ResponseRateProgressFill width={safeResponseRate} />
          </ResponseRateProgressBar>
        </ResponseRateContainer>
        <TabHeader>
          <TabButton
            onPress={() => onTabChange('portfolio')}
            isActive={activeTab === 'portfolio'}
          >
            <Typography
              fontSize={16}
              fontWeight="semiBold"
              lineHeight="140%"
              letterSpacing="-2.5%"
              color={activeTab === 'portfolio' ? theme.colors.textPrimary : '#C8C8C8'}
            >
              포트폴리오 {portfolioCount}
            </Typography>
          </TabButton>
          <TabButton
            onPress={() => onTabChange('reviews')}
            isActive={activeTab === 'reviews'}
          >
            <Typography
              fontSize={16}
              fontWeight="semiBold"
              lineHeight="140%"
              letterSpacing="-2.5%"
              color={activeTab === 'reviews' ? theme.colors.textPrimary : '#C8C8C8'}
            >
              촬영 후기 {reviewCount}
            </Typography>
          </TabButton>
        </TabHeader>
        {activeTab === 'portfolio' && shootingData !== undefined && (
          <PhotographerPortfolioInfoWrapper>
            <PhotographerPortfolioInfo>
              <PhotographerPortfolioRow>
                <Typography
                  fontSize={12}
                >
                  {shootingData?.shoootingName}/{photoHour}시간{photoMinute === 0 ? '' : ` ${photoMinute}분`}
                </Typography>
                <Typography
                  fontSize={12}
                >
                  {formatNumber(shootingData?.basePrice)}원
                </Typography>
              </PhotographerPortfolioRow>
              {shootingData.providesRawFile && (
                <PhotographerPortfolioRow>
                  <Typography
                    fontSize={12}
                  >
                    원본 파일 제공
                  </Typography>
                  <Icon width={20} height={20} Svg={TickSquareIcon} />
                </PhotographerPortfolioRow>
              )}
              {shootingOptions.length > 0 && (
                <PhotographerPortfolioRow>
                  <Typography
                    fontSize={12}
                  >
                    {shootingOptions.join(', ')}
                  </Typography>
                  <Icon width={20} height={20} Svg={TickSquareIcon} />
                </PhotographerPortfolioRow>
              )}
              {shootingData.editingType !== 'NONE' && (
                <PhotographerPortfolioRow>
                  <Typography
                    fontSize={12}
                  >
                    보정 작업일
                  </Typography>
                  <Typography
                    fontSize={12}
                  >
                    {mappingEditDeadline(shootingData.editingDeadline)}일
                  </Typography>
                </PhotographerPortfolioRow>
              )}
            </PhotographerPortfolioInfo>
          </PhotographerPortfolioInfoWrapper>
        )}
      </>
    );
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return <Loading size="small" variant="inline" />;
  };

  const renderReviewsContent = () => {
    const filledStars = Math.round(avgRating);
    const totalImages = reviewPreviewImages.length + reviewCount;

    return (
      <ReviewsContainer>
        <RatingContainer>
          <Typography
            fontSize={16}
            fontWeight="bold"
            lineHeight="140%"
            letterSpacing="-2.5%"
            marginRight={5}
          >
            {avgRating.toFixed(1)}
          </Typography>
          {[1, 2, 3, 4, 5].map((star) => (
            <RatingStarWrapper key={star}>
              <Icon
                width={20}
                height={20}
                Svg={star <= filledStars ? ActiveStarIcon : InactiveStarIcon}
              />
            </RatingStarWrapper>
          ))}
          <Typography
            fontSize={16}
            lineHeight="140%"
            letterSpacing="-2.5%"
            color="#C8C8C8"
          >
            ({reviewCount})
          </Typography>
        </RatingContainer>
        <ReviewPreviewImageContainer>
          <ReviewPreviewImageList>
            {reviewPreviewImages.slice(0, 8).map((imageUrl, index) => {
              const isLastItem = index === reviewPreviewImages.slice(0, 8).length - 1;

              return (
                <ReviewPreviewImageWrapper
                  key={index}
                  style={[index % 4 !== 3 && { 'marginRight': REVIEW_GRID_MARGIN }]}
                >
                  <ReviewPreviewImage uri={imageUrl} />
                  {isLastItem && (
                    <ShowAllPreviewButton onPress={onPressShowAllReviewPhotos}>
                      <Typography
                        fontSize={11}
                        lineHeight="140%"
                        letterSpacing="-2.5%"
                        color="#fff"
                        style={{ textAlign: 'center' }}
                      >
                        {totalImages}장{'\n'}전체보기
                      </Typography>
                    </ShowAllPreviewButton>
                  )}
                </ReviewPreviewImageWrapper>
              );
            })}
          </ReviewPreviewImageList>
        </ReviewPreviewImageContainer>
        {reviews.map((review) => (
          <ReviewWrapper key={review.id}>
            <ReviewImageWrapper>
              <ReviewImage uri={review.imageUrl} />
            </ReviewImageWrapper>
            <ReviewContent>
              <ReviewContentText
                fontSize={14}
                lineHeight="140%"
                letterSpacing="-2.5%"
                marginBottom={3}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {review.content}
              </ReviewContentText>
              <Typography
                fontSize={12}
                lineHeight="140%"
                letterSpacing="-2.5%"
                color="#C8C8C8"
              >
                {review.date}
              </Typography>
            </ReviewContent>
          </ReviewWrapper>
        ))}
      </ReviewsContainer>
    );
  };

  if (isLoadingPhotographer) {
    return (
      <ScreenContainer
        headerShown={true}
        headerTitle=""
        onPressBack={onPressBack}
        navigation={navigation}
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
        navigation={navigation}
      >
        <ContentContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Typography fontSize={14} color={theme.colors.textSecondary}>
            작가 정보를 불러울 수 없습니다.
          </Typography>
        </ContentContainer>
      </ScreenContainer>
    );
  }

  const photoHour = shootingData !== undefined ? ~~(shootingData?.photoTime / 60) : 0;
  const photoMinute = shootingData !== undefined ? shootingData?.photoTime : 0;

  return (
    <>
      <ScreenContainer
        headerShown={true}
        headerTitle={photographer.nickname}
        onPressBack={onPressBack}
        navigation={navigation}
        headerToolIcon={UploadIcon}
        onPressTool={onPressShare}
        onPressMore={onPressMore}
      >

        <ContentContainer>
        {activeTab === 'portfolio' ? (
          <>
            <FlatList
              key="portfolio-list"
              data={portfolioImages}
              renderItem={renderPortfolioItem}
              keyExtractor={(item) => item.id.toString()}
              numColumns={GRID_COLUMNS}
              ListHeaderComponent={renderHeader}
              ListFooterComponent={renderFooter}
              onEndReached={onEndReached}
              onEndReachedThreshold={0.5}
              showsVerticalScrollIndicator={false}
              columnWrapperStyle={{ gap: GRID_MARGIN, paddingHorizontal: 17 }}
              contentContainerStyle={{ gap: GRID_MARGIN, paddingBottom: 93 + insets.bottom }}
            />
          </>
        ) : (
          <>
            <FlatList
              key="reviews-list"
              data={[]}
              renderItem={() => null}
              ListHeaderComponent={renderHeader}
              ListEmptyComponent={renderReviewsContent}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 93 + insets.bottom }}
            />
          </>
        )}
      </ContentContainer>

      {/* Bottom Action Buttons */}
      <BottomActionContainer>
        {activeTab === 'portfolio' ? (
          <>
            {
              isPhotographer ?
                isMyProfile &&
                  (
                    <FloatingButton onPress={onPressAddPortfolio}>
                    <Icon width={20} height={20} Svg={CrossIcon} />
                    </FloatingButton>
                  )
                : (
                <>
                  <ActionButton
                    onPress={onPressFavorite}
                    backgroundColor={isScrapped ? theme.colors.primary : '#C8C8C8'}
                  >
                    <Icon width={24} height={24} Svg={BookmarkIcon} />
                  </ActionButton>
                  <ActionButton onPress={onPressInquiry}>
                    <Icon width={24} height={24} Svg={ChatIcon} />
                  </ActionButton>
                  <SubmitButton text="예약하기" onPress={onPressReservation} />
                </>
              )
            }
          </>
        ) : (
          <ShowReviewButton onPress={onPressShowAllReviews}>
            <Typography
              fontSize={14}
              fontWeight="bold"
              letterSpacing="-2.5%"
              color={theme.colors.primary}
            >
              후기 전체 보기
            </Typography>
          </ShowReviewButton>
        )}
      </BottomActionContainer>
    </ScreenContainer>

    {/* Share Modal */}
      <SlideModal
        visible={isMoreModalVisible}
        onClose={onCloseMoreModal}
        title="더보기"
        minHeight={276}
      >
        {isMyProfile ? (
          <>
            <ModalButton onPress={() => {
              onCloseMoreModal();
              onPressEditProfile();
            }}>
              <Icon width={18} height={18} Svg={EditIcon} />
              <Typography
                fontSize={14}
                lineHeight="140%"
                letterSpacing="-2.5%"
                marginLeft={8}
              >
                프로필 수정
              </Typography>
            </ModalButton>
          </>
        ) : (
          <>
            <ModalButton onPress={() => {
              onCloseMoreModal();
              onPressReportStart();
            }}>
              <Typography
                fontSize={14}
                lineHeight="140%"
                letterSpacing="-2.5%"
                marginLeft={8}
              >
                신고하기
              </Typography>
            </ModalButton>
          </>
        )}
      </SlideModal>

    <SlideModal
      visible={isReportModalVisible}
      onClose={onCloseReportModal}
      title="신고하기"
      minHeight={276}
    >
      {reportType.map((v, i) => (
        <ReportButton isFirst={i === 0} onPress={() => onPressReport(v)}>
          <Typography
            fontSize={12}
          >
            {v}
          </Typography>
        </ReportButton>
      ))}
    </SlideModal>

  </>
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
  border-radius: 88px;
  overflow: hidden;
  justify-content: center;
  align-items: center;
  background-color: #F4F4F4;
`;

const ProfileImage = styled(ServerImage)`
  max-width: 100%;
  max-height: 100%;
  resize-mode: cover;
`;

const ProfileInfoWrapper = styled.View`
  margin-left: 11px;
  justify-content: center;
  flex: 1;
`

const NameWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 9px;
`

const IntroductionWrapper = styled.View`
  width: 100%;
`;

const ResponseRateContainer = styled.View`
  width: 100%;
  padding: 0 30px;
  margin-bottom: 40px;
  margin-top: 18px;
`

const ResponseRateDescription = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`

const ResponseRateProgressBar = styled.View`
  width: 100%;
  height: 9px;
  background-color: #E9E9E9;
  border-radius: 100px;
  overflow: hidden;
`

const ResponseRateProgressFill = styled.View<{ width: number }>`
  width: ${({ width }) => width}%;
  height: 100%;
  border-radius: 100px;
  background-color: ${theme.colors.primary};
  position: absolute;
  left: 0;
  top: 0;
`

const TabHeader = styled.View`
  width: 100%;
  padding: 0 25px;
  flex-direction: row;
  margin-bottom: 15px;
`

const TabButton = styled.TouchableOpacity<{ isActive: boolean }>`
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: ${({ isActive }) => isActive ? theme.colors.textPrimary : '#C8C8C8'};
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 52px;
`

const PortfolioImageWrapper = styled.TouchableOpacity`
  width: ${IMAGE_SIZE}px;
  height: ${IMAGE_SIZE}px;
  background-color: #F4F4F4;
`;

const PortfolioImage = styled(ServerImage)`
  width: 100%;
  height: 100%;
`;

const ReviewContentText = styled(Typography)`
  overflow: hidden;
`;

const ReviewsContainer = styled.View`
  padding: 0 22px;
`

const RatingContainer = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
`

const RatingStarWrapper = styled.View`
  margin-right: 2px;
  align-items: center;
  justify-content: center;
`

const ReviewPreviewImageContainer = styled.View`
  width: 100%;
  align-items: center;
  margin-vertical: 20px;
`

const ReviewPreviewImageList = styled.View`
  width: ${REVIEW_GRID_CONTAINER_WIDTH}px;
  flex-direction: row;
  flex-wrap: wrap;
`

const ReviewPreviewImageWrapper = styled.View`
  width: ${REVIEW_PREVIEW_IMAGE_SIZE}px;
  height: ${REVIEW_PREVIEW_IMAGE_SIZE}px;
  margin-bottom: ${REVIEW_GRID_MARGIN}px;
  border-radius: 2px;
  overflow: hidden;
  justify-content: center;
  align-items: center;
  background-color: #ccc;
`

const ReviewPreviewImage = styled(ServerImage)`
  width: 100%;
  height: 100%;
`

const ShowAllPreviewButton = styled.TouchableOpacity`
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  border-radius: 2px;
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(47, 44, 43, .2);
`

const ReviewWrapper = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
`

const ReviewImageWrapper = styled.View`
  width: 100px;
  height: 100px;
  overflow: hidden;
  border-radius: 2px;
  justify-content: center;
  align-items: center;
  background-color: #ccc;
`

const ReviewImage = styled(ServerImage)`
  width: 100%;
  height: 100%;
`

const ReviewContent = styled.View`
  flex: 1;
  margin-left: 15px;
`

const BottomActionContainer = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  flex-direction: row;
  background-color: #fff;
  width: 100%;
  padding-horizontal: 17px;
  padding-top: 22px;
  justify-content: space-between;
  padding-bottom: 20px;
`;

const ActionButton = styled.TouchableOpacity<{ backgroundColor?: string }>`
  width: 49px;
  height: 49px;
  border-radius: 8px;
  background-color: ${(props) => props.backgroundColor || theme.colors.primary};
  justify-content: center;
  align-items: center;
  margin-right: 5px;
`

const ShowReviewButton = styled.TouchableOpacity`
  width: 100%;
  height: 49px;
  border-radius: 8px;
  border: 1px solid ${theme.colors.primary};
  justify-content: center;
  align-items: center;
`

const FloatingButton = styled.TouchableOpacity`
  width: 38px;
  height: 38px;
  border-radius: 38px;
  background-color: ${theme.colors.primary};
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: 20px;
  right: 19px;
  z-index: 1000;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
`

const PhotographerPortfolioInfoWrapper = styled.View`
  width: 100%;
  align-items: center;
  margin-bottom: 13px;
  padding: 0 25px;
`

const PhotographerPortfolioInfo = styled.View`
  width: 100%;
  background-color: #f1f0ef;
  padding-top: 10px;
  padding-bottom: 7px;
  padding-horizontal: 25px;
  justify-content: space-between;
  border-radius: 5px;
`

const PhotographerPortfolioRow = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 3px;
`

const ReportButton = styled.TouchableOpacity<{ isFirst: boolean }>`
  ${({ isFirst }) => !isFirst && `margin-top: 25px;`}
`

const ModalButton = styled.TouchableOpacity`
  flex-direction: row;
  margin-bottom: 15px;
  align-items: center;
`