import ScreenContainer from '@/components/ScreenContainer.tsx';
import styled from '@/utils/scale/CustomStyled.ts';
import Typography from '@/components/theme/Typography.tsx';
import Loading from '@/components/Loading.tsx';
import { theme } from '@/theme';
import { formatDateTime } from '@/utils/format.ts';
import Icon from '@/components/Icon.tsx';
import ArrowRightIcon from '@/assets/icons/arrow-right2.svg';
import { ReservationStatus } from '@/api/reservations';

interface PhotographerBookingDetailsViewProps {
  onPressBack: () => void;
  customerNickname: string;
  customerName: string;
  bookingOption: string;
  date: string;
  time: string;
  additionalRequest: string;
  status: ReservationStatus;
  onPressViewPhotos?: () => void;
  isLoading?: boolean;
}

export default function PhotographerBookingDetailsView({
  onPressBack,
  customerNickname,
  customerName,
  bookingOption,
  date,
  time,
  additionalRequest,
  status,
  onPressViewPhotos,
  isLoading = false,
}: PhotographerBookingDetailsViewProps) {
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
      headerTitle={`${customerNickname}님과의 촬영`}
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
        <Description name="고객명" value={customerName} />
        <Description name="촬영 항목" value={bookingOption} />
        <Description name="촬영 일시" value={formatDateTime(date, time)} />
        <Description name="요청 사항" value={additionalRequest} />
      </InfoContainer>

      {onPressViewPhotos && (
        <ViewPhotosButton onPress={onPressViewPhotos}>
          <Typography
            fontSize={16}
            fontWeight="semiBold"
            lineHeight="140%"
            letterSpacing="-2.5%"
            color="#000"
          >
            촬영 사진 관리
          </Typography>
          <Icon width={24} height={24} Svg={ArrowRightIcon} />
        </ViewPhotosButton>
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
  margin-top: 10px;
`;

const DescriptionWrapper = styled.View`
  width: 100%;
  flex-direction: row;
  margin-bottom: 20px;
`;

const DescriptionNameWrapper = styled.View`
  width: 70px;
  margin-right: 16px;
`;

const DescriptionValueWrapper = styled.View`
  flex: 1;
`;

const Description = ({ name, value }: { name: string; value: string }) => (
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
);

const ViewPhotosButton = styled.TouchableOpacity`
  width: 100%;
  height: 65px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  margin-top: 10px;
  background-color: #fff;
`;
