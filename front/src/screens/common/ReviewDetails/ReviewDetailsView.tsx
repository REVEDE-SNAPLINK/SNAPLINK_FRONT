import ScreenContainer from '@/components/common/ScreenContainer';
import Typography from '../../../components/theme/Typography.tsx';
import Icon from '@/components/Icon.tsx';
import ActiveStarIcon from '@/assets/icons/star-color.svg';
import InactiveStarIcon from '@/assets/icons/star-gray.svg';
import EditIcon from '@/assets/icons/edit.svg';
import DeleteIcon from '@/assets/icons/delete.svg';
import React from 'react';
import styled from '@/utils/scale/CustomStyled.ts';
import { PhotographerReviewItem } from '@/api/photographers.ts';
import { MyReviewItem } from '@/api/reviews.ts';
import ServerImage from '@/components/ServerImage.tsx';

interface ReviewDetailsViewProps {
  onPressBack: () => void;
  review: PhotographerReviewItem | MyReviewItem;
  nickname: string;
  profileImage: string;
  photos: string[];
  isEditable: boolean;
  onPressEdit?: () => void;
  onPressDelete?: () => void;

  navigation?: any;
}

export default function ReviewDetailsView({
  onPressBack,
  review,
  nickname,
  profileImage,
  photos,
  isEditable,
  onPressEdit,
  onPressDelete,
  navigation,}: ReviewDetailsViewProps) {
  if (!review) {
    return <ScreenContainer onPressBack={onPressBack} headerShown={true} headerTitle="리뷰"
      navigation={navigation}>{null}</ScreenContainer>;
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

  return (
    <ScreenContainer onPressBack={onPressBack} headerShown={true} headerTitle="리뷰"
      navigation={navigation}>
      <ReviewDetailsContainer showsVerticalScrollIndicator={false}>
        <ReviewItemHeader>
          <ReviewWriterWrapper>
            <ReviewWriterProfileImageWrapper>
              <ReviewWriterProfileImage
                uri={profileImage}
              />
            </ReviewWriterProfileImageWrapper>
            <ReviewWriterInfoWrapper>
              <Typography fontSize={14} fontWeight="semiBold" lineHeight="140%" letterSpacing="-2.5%">
                {nickname}
              </Typography>
              <ReviewInfoWrapper>
                {renderStars(review.rating)}
                <Typography fontSize={12} lineHeight="140%" letterSpacing="-2.5%" color="#C8C8C8">
                  {review.createdAt}
                </Typography>
              </ReviewInfoWrapper>
            </ReviewWriterInfoWrapper>
          </ReviewWriterWrapper>
          {isEditable && onPressEdit && onPressDelete && (
            <ActionButtonsWrapper>
              <ActionButton onPress={onPressEdit}>
                <Icon width={20} height={20} Svg={EditIcon} />
              </ActionButton>
              <ActionButton onPress={onPressDelete}>
                <Icon width={20} height={20} Svg={DeleteIcon} />
              </ActionButton>
            </ActionButtonsWrapper>
          )}
        </ReviewItemHeader>
        <Typography fontSize={12} lineHeight="140%" letterSpacing="-2.5%" color="#C8C8C8">
          {review.shootingTag}
        </Typography>
        {photos.length > 0 && (
          <ReviewImageWrapper horizontal showsHorizontalScrollIndicator={false}>
            {photos.map((key, index) => (
              <ReviewImage key={index} uri={key} />
            ))}
          </ReviewImageWrapper>
        )}
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
  justify-content: space-between;
  margin-bottom: 10px;
`

const ReviewWriterWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  flex: 1;
`

const ReviewWriterProfileImageWrapper = styled.View`
  width: 45px;
  height: 45px;
  border-radius: 45px;
  overflow: hidden;
  background-color: #e0e0e0;
`

const ReviewWriterProfileImage = styled(ServerImage)`
  width: 100%;
  height: 100%;
`

const ReviewWriterInfoWrapper = styled.View`
  margin-left: 10px;
  flex: 1;
`

const ReviewInfoWrapper = styled.View`
  flex-direction: row;
  align-items: flex-end;
`

const ReviewImageWrapper = styled.ScrollView`
  height: 100px;
  margin-vertical: 10px;
`

const ReviewImage = styled(ServerImage)`
  width: 100px;
  height: 100px;
  margin-right: 10px;
`

const ActionButtonsWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`

const ActionButton = styled.TouchableOpacity`
  padding: 5px;
`
