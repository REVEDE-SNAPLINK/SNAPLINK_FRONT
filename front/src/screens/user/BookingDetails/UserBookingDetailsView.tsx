import ScreenContainer from '@/components/common/ScreenContainer';
import styled from '@/utils/scale/CustomStyled.ts';
import Typography from '@/components/theme/Typography.tsx';
import Loading from '@/components/Loading.tsx';
import { theme } from '@/theme';
import Icon from '@/components/Icon.tsx';
import SubmitButton from '@/components/theme/SubmitButton.tsx';
import ArrowRightIcon from '@/assets/icons/arrow-right2.svg';
import { ReservationStatus } from '@/api/bookings.ts';

interface UserBookingDetailsViewProps {
  onPressBack: () => void;
  name: string;
  bookingOption: string;
  datetime: string;
  additionalRequest: string;
  status: ReservationStatus;
  onPressViewPhotos?: () => void;
  onPressWriteReview?: () => void;
  onPressShowMyReview?: () => void;
  isLoading?: boolean;
}

export default function UserBookingDetailsView({
  onPressBack,
  name,
  bookingOption,
  datetime,
  additionalRequest,
  status,
  onPressViewPhotos,
  onPressWriteReview,
  onPressShowMyReview,
  isLoading = false,
}: UserBookingDetailsViewProps) {
  if (isLoading) {
    return (
      <ScreenContainer
        onPressBack={onPressBack}
        headerTitle="예약 상세"
        backgroundColor={theme.colors.bgSecondary}
      >
        <Loading size="large" variant="fullscreen" />
      </ScreenContainer>
    );
  }
  return (
    <ScreenContainer
      onPressBack={onPressBack}
      headerTitle="촬영 상세 내역"
      backgroundColor={theme.colors.bgSecondary}
    >
      <InfoContainer>
        <Typography
          fontSize={16}
          fontWeight="semiBold"
          lineHeight="140%"
          letterSpacing="-2.5%"
          marginBottom={16}
        >
          예약 정보
        </Typography>
        <Description name="작가명" value={name} />
        <Description name="촬영 항목" value={bookingOption} />
        <Description name="촬영 일시" value={datetime} />
        <Description name="요청 사항" value={additionalRequest} />
      </InfoContainer>
      {(status === 'DELIVERED' || status === 'REVIEWED') && onPressViewPhotos && (
        <ViewPhotosButton onPress={onPressViewPhotos}>
          <Typography
            fontSize={16}
            fontWeight="semiBold"
            lineHeight="140%"
            letterSpacing="-2.5%"
            color="#000"
          >
            촬영 사진 보기
          </Typography>
          <Icon width={24} height={24} Svg={ArrowRightIcon} />
        </ViewPhotosButton>
      )}
      {status === 'REVIEWED' && onPressShowMyReview && (
        <ViewPhotosButton onPress={onPressViewPhotos}>
          <Typography
            fontSize={16}
            fontWeight="semiBold"
            lineHeight="140%"
            letterSpacing="-2.5%"
            color="#000"
          >
            내가 쓴 후기 보기
          </Typography>
          <Icon width={24} height={24} Svg={ArrowRightIcon} />
        </ViewPhotosButton>
      )}
      {status === 'DELIVERED' && onPressWriteReview && (
        <WriteReviewButtonWrapper>
          <SubmitButton
            text="촬영 후기 작성"
            onPress={onPressWriteReview}
          />
        </WriteReviewButtonWrapper>
      )}
    </ScreenContainer>
  );
}

const InfoContainer = styled.View`
  width: 100%;
  background-color: #fff;
  padding-top: 22px;
  padding-horizontal: 25px;
  padding-bottom: 10px;
`

const DescriptionWrapper = styled.View`
  width: 100%;
  flex-direction: row;
  margin-bottom: 20px;
`

const DescriptionNameWrapper = styled.View`
  width: 50px;
  margin-right: 16px;
`

const DescriptionValueWrapper = styled.View`
  flex: 1;
`

const Description = ({ name, value }: {name: string, value: string}) => (
  <DescriptionWrapper>
    <DescriptionNameWrapper>
      <Typography
        fontSize={12}
        lineHeight="140%"
        letterSpacing="-2.5%"
        color={theme.colors.disabled}
      >
        {name}
      </Typography>
    </DescriptionNameWrapper>
    <DescriptionValueWrapper>
      <Typography
        fontSize={12}
        lineHeight="140%"
        letterSpacing="-2.5%"
        color={theme.colors.textSecondary}
      >
        {value}
      </Typography>
    </DescriptionValueWrapper>
  </DescriptionWrapper>
)

const ViewPhotosButton = styled.TouchableOpacity`
  width: 100%;
  height: 65px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  margin-top: 10px;
  background-color: #fff;
`

const WriteReviewButtonWrapper = styled.View`
  padding: 0 24px;
  width: 100%;
  position: absolute;
  left: 0;
  bottom: 30px;
`
