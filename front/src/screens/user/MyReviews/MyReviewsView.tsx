import ScreenContainer from '@/components/common/ScreenContainer';
import Typography from '../../../components/theme/Typography.tsx';
import Icon from '@/components/Icon.tsx';
import ActiveStarIcon from '@/assets/icons/star-color.svg';
import InactiveStarIcon from '@/assets/icons/star-gray.svg';
import EditIcon from '@/assets/icons/edit.svg';
import DeleteIcon from '@/assets/icons/delete.svg';
import React from 'react';
import styled from '@/utils/scale/CustomStyled.ts';
import { ScrollView } from 'react-native';
import ServerImage from '@/components/ServerImage.tsx';
import { MyReviewItem } from "@/api/reviews.ts";

interface MyReviewsViewProps {
  reviews: MyReviewItem[];
  totalCount: number;
  onPressBack: () => void;
  onPressReview: (review: MyReviewItem) => void;
  onPressEdit: (review: MyReviewItem) => void;
  onPressDelete: (reviewId: number) => void;
  navigation?: any;
}

export default function MyReviewsView({
  reviews,
  totalCount,
  onPressBack,
  onPressReview,
  onPressEdit,
  onPressDelete,
  navigation,
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

  return (
    <ScreenContainer onPressBack={onPressBack} headerShown={true} headerTitle="내 리뷰" navigation={navigation}>
      <ReviewsContainer showsVerticalScrollIndicator={false}>
        <TotalReviewsContainer>
          <Typography fontSize={16} fontWeight="bold" lineHeight="140%" letterSpacing="-2.5%">
            내가 쓴 총 리뷰 {totalCount}개
          </Typography>
        </TotalReviewsContainer>

        {reviews.map((review) => (
          <ReviewItem key={review.reviewId} onPress={() => onPressReview(review)}>
            <ReviewItemHeader>
              <ReviewWriterWrapper>
                <ReviewWriterProfileImage
                  uri={review.photographerProfileImage} // TODO: API 수정후 추가
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
                <ActionButton onPress={() => onPressEdit(review)}>
                  <Icon width={20} height={20} Svg={EditIcon} />
                </ActionButton>
                <ActionButton onPress={() => onPressDelete(review.reviewId)}>
                  <Icon width={20} height={20} Svg={DeleteIcon} />
                </ActionButton>
              </ActionButtonsWrapper>
            </ReviewItemHeader>
            <Typography fontSize={12} lineHeight="140%" letterSpacing="-2.5%" color="#C8C8C8">
              {review.shootingTag}
            </Typography>
            {review.photos.length > 0 && (
              <ReviewImageWrapper horizontal showsHorizontalScrollIndicator={false}>
                {review.photos.slice(0, 3).map((img, index) => (
                  <ReviewImage key={index} uri={img.url} />
                ))}
              </ReviewImageWrapper>
            )}
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

const ReviewWriterProfileImage = styled(ServerImage).attrs({ type: 'profile' })`
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

const ReviewImage = styled(ServerImage)`
  width: 100px;
  height: 100px;
  margin-right: 10px;
  background-color: #e0e0e0;
`;
