import ScreenContainer from '@/components/ScreenContainer.tsx';
import Typography from '../../../components/theme/Typography.tsx';
import Icon from '@/components/Icon.tsx';
import ActiveStarIcon from '@/assets/icons/star-color.svg';
import InactiveStarIcon from '@/assets/icons/star-gray.svg';
import React from 'react';
import styled from '@/utils/scale/CustomStyled.ts';
import { Review } from '@/api/review.ts';
import { ScrollView } from 'react-native';

interface ReviewDetailsViewProps {
  review?: Review;
  onPressBack: () => void;
}

export default function ReviewDetailsView({ review, onPressBack }: ReviewDetailsViewProps) {
  if (!review) {
    return <ScreenContainer onPressBack={onPressBack} headerShown={true} headerTitle="리뷰">{null}</ScreenContainer>;
  }

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <RatingStarWrapper key={i}>
          <Icon width={15} height={15} Svg={i <= rating ? ActiveStarIcon : InactiveStarIcon} />
        </RatingStarWrapper>
      );
    }
    return stars;
  };

  const reviewDate = new Date(review.createdAt);
  const formattedDate = `${reviewDate.getFullYear()}.${String(reviewDate.getMonth() + 1).padStart(
    2,
    '0'
  )}.${String(reviewDate.getDate()).padStart(2, '0')}`;

  return (
    <ScreenContainer onPressBack={onPressBack} headerShown={true} headerTitle="리뷰">
      <ReviewDetailsContainer showsVerticalScrollIndicator={false}>
        <ReviewItemHeader>
          <ReviewWriterProfileImage
            source={review.authorProfileImage ? { uri: review.authorProfileImage } : undefined}
          />
          <ReviewWriterInfoWrapper>
            <Typography fontSize={14} fontWeight="semiBold" lineHeight="140%" letterSpacing="-2.5%">
              {review.authorNickname}
            </Typography>
            <ReviewInfoWrapper>
              {renderStars(review.rating)}
              <Typography fontSize={12} lineHeight="140%" letterSpacing="-2.5%" color="#C8C8C8">
                {formattedDate}
              </Typography>
            </ReviewInfoWrapper>
          </ReviewWriterInfoWrapper>
        </ReviewItemHeader>
        <Typography fontSize={12} lineHeight="140%" letterSpacing="-2.5%" color="#C8C8C8">
          {review.bookingType}
        </Typography>
        {review.images.length > 0 && (
          <ReviewImageWrapper horizontal showsHorizontalScrollIndicator={false}>
            {review.images.map((img, index) => (
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
        <Typography fontSize={14} lineHeight="140%" letterSpacing="-2.5%" marginBottom={10}>
          {review.content}
        </Typography>
      </ReviewDetailsContainer>
    </ScreenContainer>
  );
}

const ReviewDetailsContainer = styled.ScrollView`
  flex: 1;
  width: 100%;
  padding: 0 20px;
`

const RatingStarWrapper = styled.View`
  margin-right: 2px;
  align-items: center;
  justify-content: center;
`

const ReviewItemHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
`

const ReviewWriterProfileImage = styled.Image`
  width: 45px;
  height: 45px;
  border-radius: 45px;
`

const ReviewWriterInfoWrapper = styled.View`
  margin-left: 10px;
`

const ReviewInfoWrapper = styled.View`
  flex-direction: row;
  align-items: flex-end;
`

const ReviewImageWrapper = styled.View`
  height: 100px;
  margin-vertical: 10px;
`

const ReviewImage = styled.Image`
  width: 100px;
  height: 100px;
  margin-right: 10px;
`
