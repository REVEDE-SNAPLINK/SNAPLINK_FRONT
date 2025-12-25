import ScreenContainer from '@/components/ScreenContainer.tsx';
import styled from '@/utils/scale/CustomStyled.ts';
import IconButton from '@/components/IconButton.tsx';
import Typography from '@/components/theme/Typography.tsx';
import { theme } from '@/theme';
import Icon from '@/components/Icon.tsx';
import InactiveStarIcon from '@/assets/icons/star-gray.svg'
import ActiveStarIcon from '@/assets/icons/star-color.svg'
import CrossIcon from '@/assets/icons/cross.svg'
import TextInput from '@/components/theme/TextInput.tsx';
import SubmitButton from '@/components/theme/SubmitButton.tsx';

interface WriteReviewViewProps {
  onPressBack: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  // Form values
  rating: number;
  onRatingChange: (rating: number) => void;
  images: string[];
  maxImages: number;
  onImageSelect: () => void;
  shootingType: string;
  shootingTypeMinLength: number;
  onShootingTypeChange: (text: string) => void;
  content: string;
  contentMinLength: number;
  contentMaxLength: number;
  onContentChange: (text: string) => void;
}

const STAR_RATINGS = [1, 2, 3, 4, 5] as const;

export default function WriteReviewView({
  onPressBack,
  onSubmit,
  isSubmitting = false,
  rating,
  onRatingChange,
  images,
  maxImages,
  onImageSelect,
  shootingType,
  shootingTypeMinLength,
  onShootingTypeChange,
  content,
  contentMinLength,
  contentMaxLength,
  onContentChange,
}: WriteReviewViewProps) {

  return (
    <ScreenContainer
        headerTitle="후기 작성"
        headerShown={true}
        onPressBack={onPressBack}
      >
        <ScrollContainer
          nestedScrollEnabled={false}
          showsVerticalScrollIndicator={false}
        >
          <RateButtonWrapper>
            {STAR_RATINGS.map((star) => (
              <IconButton
                key={star}
                width={36}
                height={35}
                Svg={rating >= star ? ActiveStarIcon : InactiveStarIcon}
                onPress={() => onRatingChange(star)}
              />
            ))}
          </RateButtonWrapper>
          <ContentContainer>
            <Typography
              fontSize={11}
              lineHeight="160%"
              letterSpacing="-2.5%"
              color={theme.colors.textSecondary}
              marginTop={37}
              marginBottom={19}
            >
              {' '}･ 촬영과 무관한 내용 등이 나오지 않게 유의해 주세요.
            </Typography>
            <UploadImagesButton onPress={onImageSelect}>
              <Icon
                width={20}
                height={20}
                Svg={CrossIcon}
              />
              <Typography
                fontSize={12}
                lineHeight="140%"
                letterSpacing="-2.5%"
                color={theme.colors.disabled}
                marginTop={14}
              >
                {images.length}/{maxImages}
              </Typography>
            </UploadImagesButton>
            <Caption
              text="어떤 사진 촬영하셨나요?"
              minLength={shootingTypeMinLength}
            />
            <TextInput
              placeholder="웨딩, 프로필, 우정 등"
              value={shootingType}
              onChangeText={onShootingTypeChange}
            />
            <Caption
              text="촬영 경험은 어떠셨나요?"
              minLength={contentMinLength}
            />
            <TextInput
              placeholder="솔직한 후기를 남겨주세요."
              height={170}
              maxLength={contentMaxLength}
              multiline
              value={content}
              onChangeText={onContentChange}
            />
          </ContentContainer>
          <TermsWrapper>
            <Typography
              fontSize={11}
              lineHeight="160%"
              letterSpacing="-2.5%"
              color={theme.colors.textSecondary}
            >
              {' '}･ 리뷰는 서비스 개선 목적으로만 활용됩니다.{'\n'}
              {' '}･ 리뷰 내에 작가 또는 제 3자에게 심한 모욕을 주거나 명예를 손상시키는 내용,{'\n'}
              {' '}･ 혹은 제 3자에게 불쾌감을 주거나 언어적 폭룍으로 느낄 . 있는 과도한 표현 {'\n'}
              {'    '}등이 포함된 경우, 스냅링크 서비스 이용약관 00조에 의거, 통보없이 삭제, {'\n'}
              {'    '}숨김 처리를 할 수 있습니다.
            </Typography>
            <TermLinkButton>
              <Typography
                fontSize={11}
                lineHeight="160%"
                letterSpacing="-2.5%"
                color={theme.colors.textSecondary}
              >
                {' '}･ <TermLinkText>스냅링크 서비스 이용 약관</TermLinkText>
              </Typography>
            </TermLinkButton>
          </TermsWrapper>
          <SubmitButtonWrapper>
            <SubmitButton
              text="작성 완료"
              onPress={onSubmit}
              disabled={isSubmitting || rating === 0 || shootingType.length < shootingTypeMinLength || content.length < contentMinLength}
            />
          </SubmitButtonWrapper>
        </ScrollContainer>
      </ScreenContainer>
  )
}

const ScrollContainer = styled.ScrollView`
  width: 100%;
`

const ContentContainer = styled.View`
  width: 100%;
  padding: 0 33px;
`

const RateButtonWrapper = styled.View`
  flex-direction: row;
  width: 223px;
  justify-content: space-between;
  align-self: center;
`

const UploadImagesButton = styled.TouchableOpacity`
  width: 100%;
  height: 170px;
  border-radius: 8px;
  border: 1px dashed ${theme.colors.disabled};
  justify-content: center;
  align-items: center;
  margin-bottom: 18px;
`

const CaptionWrapper = styled.View`
  flex-direction: row;
  align-items: flex-end;
  margin-bottom: 16px;
  margin-top: 19px;
`

const Caption = ({ text, minLength }: {text: string, minLength: number}) => {
  return (
    <CaptionWrapper>
      <Typography
        fontSize={16}
        fontWeight="semiBold"
        lineHeight="140%"
        letterSpacing="-2.5%"
        color="#000"
        marginRight={5}
      >
        {text}
      </Typography>
      <Typography
        fontSize={12}
        lineHeight="140%"
        letterSpacing="-2.5%"
        color="textSecondary"
      >
        (최소 {minLength}자)
      </Typography>
    </CaptionWrapper>
  )
}

const TermsWrapper = styled.View`
  padding: 18.5px 22px;
  margin-top: 55.5px;
  width: 100%;
  background-color: ${theme.colors.bgSecondary};
`

const TermLinkButton = styled.TouchableOpacity`
`

const TermLinkText = styled(Typography)`
  text-decoration: underline;
`

const SubmitButtonWrapper = styled.View`
  padding: 20px 33px 22px;
`