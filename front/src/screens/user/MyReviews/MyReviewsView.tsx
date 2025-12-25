import ScreenContainer from '@/components/ScreenContainer.tsx';
import Typography from '../../../components/theme/Typography.tsx';
import Icon from '@/components/Icon.tsx';
import ActiveStarIcon from '@/assets/icons/star-color.svg';
import InactiveStarIcon from '@/assets/icons/star-gray.svg';
import EditIcon from '@/assets/icons/edit.svg';
import DeleteIcon from '@/assets/icons/delete.svg';
import React from 'react';
import styled from '@/utils/scale/CustomStyled.ts';
import { Dimensions, ScrollView } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const REVIEW_GRID_MARGIN = 2;
const REVIEW_GRID_COLUMNS = 4;
const REVIEW_GRID_CONTAINER_WIDTH = SCREEN_WIDTH - 44;
const REVIEW_PREVIEW_IMAGE_SIZE =
  (REVIEW_GRID_CONTAINER_WIDTH - REVIEW_GRID_MARGIN * (REVIEW_GRID_COLUMNS - 1)) /
  REVIEW_GRID_COLUMNS;

export interface MyReview {
  id: string;
  photographerId: string;
  photographerNickname: string; // 리뷰 대상 작가 닉네임
  photographerProfileImage?: string;
  rating: number;
  title: string;
  content: string;
  bookingType: string; // e.g., "2인 기본 촬영"
  images: string[];
  createdAt: string;
}

interface MyReviewsViewProps {
  reviews: MyReview[];
  totalCount: number;
  onPressBack: () => void;
  onPressReview: (reviewId: string) => void;
  onPressAllPhotos: () => void;
  onPressEdit: (reviewId: string) => void;
  onPressDelete: (reviewId: string) => void;
}

export default function MyReviewsView({
  reviews,
  totalCount,
  onPressBack,
  onPressReview,
  onPressAllPhotos,
  onPressEdit,
  onPressDelete,
}: MyReviewsViewProps) {
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

  // Get first 4 photos from reviews for preview
  const previewPhotos = reviews
    .flatMap((review) => review.images.map((img) => ({ reviewId: review.id, img })))
    .slice(0, 4);

  return (
    <ScreenContainer onPressBack={onPressBack} headerShown={true} headerTitle="내 리뷰">
      <ReviewsContainer showsVerticalScrollIndicator={false}>
        <TotalReviewsContainer>
          <Typography fontSize={16} fontWeight="bold" lineHeight="140%" letterSpacing="-2.5%">
            내가 쓴 총 리뷰 {totalCount}개
          </Typography>
        </TotalReviewsContainer>

        {previewPhotos.length > 0 && (
          <ReviewPreviewImageContainer>
            <ReviewPreviewImageList>
              {previewPhotos.map((photo, index) => (
                <ReviewPreviewImageButton
                  key={index}
                  onPress={onPressAllPhotos}
                  style={{ marginRight: index < 3 ? REVIEW_GRID_MARGIN : 0 }}
                >
                  <ReviewPreviewImage source={{ uri: photo.img }} />
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

        {reviews.map((review) => (
          <ReviewItem key={review.id} onPress={() => onPressReview(review.id)}>
            <ReviewItemHeader>
              <ReviewWriterWrapper>
                <ReviewWriterProfileImage
                  source={
                    review.photographerProfileImage
                      ? { uri: review.photographerProfileImage }
                      : undefined
                  }
                />
                <ReviewWriterInfoWrapper>
                  <Typography
                    fontSize={14}
                    fontWeight="semiBold"
                    lineHeight="140%"
                    letterSpacing="-2.5%"
                  >
                    {review.photographerNickname}
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
              </ReviewWriterWrapper>
              <ActionButtonsWrapper>
                <ActionButton onPress={() => onPressEdit(review.id)}>
                  <Icon width={20} height={20} Svg={EditIcon} />
                </ActionButton>
                <ActionButton onPress={() => onPressDelete(review.id)}>
                  <Icon width={20} height={20} Svg={DeleteIcon} />
                </ActionButton>
              </ActionButtonsWrapper>
            </ReviewItemHeader>
            <Typography fontSize={12} lineHeight="140%" letterSpacing="-2.5%" color="#C8C8C8">
              {review.bookingType}
            </Typography>
            {review.images.length > 0 && (
              <ReviewImageWrapper horizontal showsHorizontalScrollIndicator={false}>
                {review.images.slice(0, 3).map((img, index) => (
                  <ReviewImage key={index} source={{ uri: img }} />
                ))}
              </ReviewImageWrapper>
            )}
            <Typography
              fontSize={16}
              fontWeight="bold"
              lineHeight="140%"
              letterSpacing="-2.5%"
              marginBottom={10}
            >
              {review.title}
            </Typography>
            <Typography fontSize={14} lineHeight="140%" letterSpacing="-2.5%" numberOfLines={3}>
              {review.content}
            </Typography>
          </ReviewItem>
        ))}
      </ReviewsContainer>
    </ScreenContainer>
  );
}

const ReviewsContainer = styled(ScrollView)`
  flex: 1;
  width: 100%;
  padding: 0 20px;
`;

const TotalReviewsContainer = styled.View`
  margin-bottom: 15px;
  margin-top: 10px;
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

const ReviewPreviewImage = styled.Image`
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
  justify-content: space-between;
  margin-bottom: 10px;
`;

const ReviewWriterWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  flex: 1;
`;

const ReviewWriterProfileImage = styled.Image`
  width: 45px;
  height: 45px;
  border-radius: 45px;
  background-color: #e0e0e0;
`;

const ReviewWriterInfoWrapper = styled.View`
  margin-left: 10px;
  flex: 1;
`;

const ReviewInfoWrapper = styled.View`
  flex-direction: row;
  align-items: flex-end;
`;

const RatingStarWrapper = styled.View`
  margin-right: 2px;
  align-items: center;
  justify-content: center;
`;

const ActionButtonsWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

const ActionButton = styled.TouchableOpacity`
  padding: 5px;
`;

const ReviewImageWrapper = styled.ScrollView`
  height: 100px;
  margin-vertical: 10px;
`;

const ReviewImage = styled.Image`
  width: 100px;
  height: 100px;
  margin-right: 10px;
  background-color: #e0e0e0;
`;
