import ScreenContainer from '@/components/common/ScreenContainer';
import Typography from '../../../components/theme/Typography.tsx';
import Icon from '@/components/Icon.tsx';
import ActiveStarIcon from '@/assets/icons/star-color.svg';
import InactiveStarIcon from '@/assets/icons/star-gray.svg';
import React from 'react';
import styled from '@/utils/scale/CustomStyled.ts';
import { Dimensions, FlatList, RefreshControl } from 'react-native';
import { GetPhotographerReviewSummaryResponse, PhotographerReviewItem } from '@/api/photographers.ts';
import ServerImage from '@/components/ServerImage.tsx';
import Loading from '@/components/Loading.tsx';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const REVIEW_GRID_MARGIN = 2;
const REVIEW_GRID_COLUMNS = 4;
const REVIEW_GRID_CONTAINER_WIDTH = SCREEN_WIDTH - 44;
const REVIEW_PREVIEW_IMAGE_SIZE =
  (REVIEW_GRID_CONTAINER_WIDTH - REVIEW_GRID_MARGIN * (REVIEW_GRID_COLUMNS - 1)) /
  REVIEW_GRID_COLUMNS;

interface ReviewsViewProps {
  reviews: PhotographerReviewItem[];
  reviewSummary?: GetPhotographerReviewSummaryResponse;
  totalCount: number;
  averageRating: number;
  onPressBack: () => void;
  onPressReview: (reviewId: number) => void;
  onPressAllPhotos: () => void;
  onLoadMore: () => void;
  onRefresh: () => void;
  isFetchingNextPage: boolean;
  isRefreshing: boolean;
  isLoading: boolean;
}

export default function ReviewsView({
  reviews,
  reviewSummary,
  totalCount,
  averageRating,
  onPressBack,
  onPressReview,
  onPressAllPhotos,
  onLoadMore,
  onRefresh,
  isFetchingNextPage,
  isRefreshing,
  isLoading,
}: ReviewsViewProps) {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <RatingStarWrapper key={i}>
          <Icon width={20} height={20} Svg={i <= rating ? ActiveStarIcon : InactiveStarIcon} />
        </RatingStarWrapper>
      );
    }
    return stars;
  };

  const renderHeader = () => (
    <>
      <RatingContainer>
        <Typography
          fontSize={16}
          fontWeight="bold"
          lineHeight="140%"
          letterSpacing="-2.5%"
          marginRight={5}
        >
          {averageRating.toFixed(1)}
        </Typography>
        {renderStars(Math.round(averageRating))}
        <Typography fontSize={16} lineHeight="140%" letterSpacing="-2.5%" color="#C8C8C8">
          {totalCount}
        </Typography>
      </RatingContainer>

      {reviewSummary && reviewSummary.topPhotoKeys.length > 0 && (
        <ReviewPreviewImageContainer>
          <ReviewPreviewImageList>
            {reviewSummary.topPhotoKeys.map((key, index) => (
              <ReviewPreviewImageButton
                key={index}
                onPress={onPressAllPhotos}
                style={{ marginRight: index < 3 ? REVIEW_GRID_MARGIN : 0 }}
              >
                <ReviewPreviewImage uri={key} />
              </ReviewPreviewImageButton>
            ))}
          </ReviewPreviewImageList>
          <AllPhotosButton onPress={onPressAllPhotos}>
            <Typography fontSize={12} lineHeight="140%" letterSpacing="-2.5%" color="#C8C8C8">
              전체보기
            </Typography>
          </AllPhotosButton>
        </ReviewPreviewImageContainer>
      )}
    </>
  );

  const renderReviewItem = ({ item: review }: { item: PhotographerReviewItem }) => (
    <ReviewItem onPress={() => onPressReview(review.reviewId)}>
      <ReviewItemHeader>
        <ReviewWriterProfileImage
          {...(review.writerProfileKey ? { uri: review.writerProfileKey } :  {})}
        />
        <ReviewWriterInfoWrapper>
          <Typography fontSize={14} fontWeight="semiBold" lineHeight="140%" letterSpacing="-2.5%">
            {review.writerNickname}
          </Typography>
          <ReviewInfoWrapper>
            {renderStars(review.rating).map((star, i) => (
              <RatingStarWrapper key={i}>{star.props.children}</RatingStarWrapper>
            ))}
            <Typography fontSize={12} lineHeight="140%" letterSpacing="-2.5%" color="#C8C8C8">
              {new Date(review.createdAt).toLocaleDateString('ko-KR')}
            </Typography>
          </ReviewInfoWrapper>
        </ReviewWriterInfoWrapper>
      </ReviewItemHeader>
      <Typography fontSize={12} lineHeight="140%" letterSpacing="-2.5%" color="#C8C8C8">
        {review.shootingTag}
      </Typography>
      {review.photoKeys.length > 0 && (
        <ReviewImageWrapper horizontal showsHorizontalScrollIndicator={false}>
          {review.photoKeys.slice(0, 3).map((key, index) => (
            <ReviewImage key={index} uri={key} />
          ))}
        </ReviewImageWrapper>
      )}
      <Typography fontSize={14} lineHeight="140%" letterSpacing="-2.5%" numberOfLines={3}>
        {review.content}
      </Typography>
    </ReviewItem>
  );

  if (isLoading) {
    return (
      <ScreenContainer onPressBack={onPressBack} headerShown={true} headerTitle={`리뷰 ${totalCount}`}>
        <Loading />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer onPressBack={onPressBack} headerShown={true} headerTitle={`리뷰 ${totalCount}`}>
      <ReviewsContainer
        data={reviews}
        keyExtractor={(item) => item.reviewId.toString()}
        renderItem={renderReviewItem}
        ListHeaderComponent={renderHeader}
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
    </ScreenContainer>
  );
}

const ReviewsContainer = styled(FlatList)`
  flex: 1;
  width: 100%;
  padding: 0 20px;
` as unknown as typeof FlatList;

const RatingContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
`;

const RatingStarWrapper = styled.View`
  margin-right: 2px;
  align-items: center;
  justify-content: center;
`;

const ReviewPreviewImageContainer = styled.View`
  width: 100%;
  margin-bottom: 20px;
`;

const ReviewPreviewImageList = styled.View`
  flex-direction: row;
  margin-bottom: 10px;
`;

const ReviewPreviewImageButton = styled.TouchableOpacity`
  width: ${REVIEW_PREVIEW_IMAGE_SIZE}px;
  height: ${REVIEW_PREVIEW_IMAGE_SIZE}px;
`;

const ReviewPreviewImage = styled(ServerImage)`
  width: 100%;
  height: 100%;
  background-color: #e0e0e0;
`;

const AllPhotosButton = styled.TouchableOpacity`
  align-items: flex-end;
`;

const ReviewItem = styled.TouchableOpacity`
  width: 100%;
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom-width: 1px;
  border-bottom-color: #c8c8c8;
`;

const ReviewItemHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
`;

const ReviewWriterProfileImage = styled(ServerImage)`
  width: 45px;
  height: 45px;
  border-radius: 45px;
  background-color: #e0e0e0;
`;

const ReviewWriterInfoWrapper = styled.View`
  margin-left: 10px;
`;

const ReviewInfoWrapper = styled.View`
  flex-direction: row;
  align-items: flex-end;
`;

const ReviewImageWrapper = styled.ScrollView`
  height: 100px;
  margin-vertical: 10px;
`;

const ReviewImage = styled(ServerImage)`
  width: 100px;
  height: 100px;
  margin-right: 10px;
  background-color: #e0e0e0;
`;
