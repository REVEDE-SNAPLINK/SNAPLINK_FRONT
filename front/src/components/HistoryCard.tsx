import { theme } from '@/theme';
import Typography from '@/components/theme/Typography.tsx';
import styled from '@/utils/scale/CustomStyled.ts';
import { useAuthStore } from '@/store/authStore.ts';
import { useMemo } from 'react';

interface HistoryCardProps {
  onPress: () => void;
  onPressViewPhotos?: () => void;
  onPressWriteReview?: () => void;
  onPressRejectBooking?: () => void;
  onPressConfirmBooking?: () => void;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED';
  userName?: string;
  photographerName: string;
  photographerNickname: string;
  type: string;
  datetime: string;
}

export default function HistoryCard({
  onPress,
  onPressViewPhotos,
  onPressWriteReview,
  onPressRejectBooking,
  onPressConfirmBooking,
  status,
  userName,
  photographerName,
  photographerNickname,
  type,
  datetime,
}: HistoryCardProps) {
  const { userType, isExpertMode } = useAuthStore();

  const headerTitle = (() => {
    if (userType === 'user' || !isExpertMode) {
      if (status === 'PENDING') return photographerNickname + '과 인생샷 건질 준비 중이에요'
      return photographerNickname + '과 함께 한 추억이에요'
    }
    if (status !== 'PENDING' && userName) return userName + '님에게 추억을 선물했어요!'
    return photographerNickname + '님, 예약이 접수되었어요!'
  })();

  const renderUserActionButtons = useMemo(() => {
    if (status !== 'COMPLETED') {
      return (
        <Status
          text={
            status === 'PENDING'
              ? '아직 촬영 전이에요'
              : '작가님이 작업 중이에요'
          }
        />
      )
    }
    return (
      <ActionButtonWrapper>
        {onPressViewPhotos && (
          <ConfirmButton onPress={onPressViewPhotos}>
            <Typography
              fontSize={12}
              fontWeight="bold"
              lineHeight="140%"
              letterSpacing="-2.5%"
              color="#fff"
            >
              사진 보기
            </Typography>
          </ConfirmButton>
        )}
        {onPressWriteReview && (
          <CancelButton onPress={onPressWriteReview}>
            <Typography
              fontSize={12}
              fontWeight="bold"
              lineHeight="140%"
              letterSpacing="-2.5%"
              color={theme.colors.primary}
            >
              후기 작성
            </Typography>
          </CancelButton>
        )}
      </ActionButtonWrapper>
    );
  }, [status, onPressWriteReview, onPressViewPhotos]);

  const renderPhotographerActionButtons = useMemo(() => {
    if (status !== 'PENDING') {
      if (status === 'COMPLETED') {
        return (
          <Status
            disabled={false}
            onPress={onPressViewPhotos || (() => {})}
            text='사진 업로드'
          />
        )
      }
      return (
        <Status text='아직 촬영 전이에요' />
      )
    }
    return (
      <ActionButtonWrapper>
        {onPressConfirmBooking && (
          <ConfirmButton onPress={onPressConfirmBooking}>
            <Typography
              fontSize={12}
              fontWeight="bold"
              lineHeight="140%"
              letterSpacing="-2.5%"
              color="#fff"
            >
              예약 수락
            </Typography>
          </ConfirmButton>
        )}
        {onPressRejectBooking && (
          <CancelButton onPress={onPressRejectBooking}>
            <Typography
              fontSize={12}
              fontWeight="bold"
              lineHeight="140%"
              letterSpacing="-2.5%"
              color={theme.colors.primary}
            >
              예약 거절
            </Typography>
          </CancelButton>
        )}
      </ActionButtonWrapper>
    );
  }, [status, onPressConfirmBooking, onPressRejectBooking, onPressViewPhotos]);

  return (
    <HistoryContainer>
      <InfoWrapper>
        <Header title={headerTitle} onPress={onPress} />
        <Description name={userType === 'user' ? "작가명" : "고객명"} value={userType === "photographer" && userName ? userName : photographerName} marginBottom={12} />
        <Description name="촬영 항목" value={type} marginBottom={12} />
        <Description name="촬영 일시" value={datetime} />
      </InfoWrapper>
      {userType === 'user' || !isExpertMode ? renderUserActionButtons : renderPhotographerActionButtons}
    </HistoryContainer>
  );
}

const HistoryContainer = styled.View`
  width: 100%;
  border-radius: 10px;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  background-color: #fff;
  padding: 17px 20px;
  justify-content: space-between;
  margin-bottom: 15px;
`

const InfoWrapper = styled.View`
  width: 100%;
  margin-bottom: 15px;
`

const HeaderContainer = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`

const ViewDetailButton = styled.TouchableOpacity`
  padding: 3px 5px;
  border-radius: 100px;
  border: 1px solid ${theme.colors.disabled};
  justify-content: center;
  align-items: center;
`

const Header = ({ title, onPress }: {title: string, onPress: () => void}) => (
  <HeaderContainer>
    <Typography
      fontSize={16}
      fontWeight="semiBold"
      lineHeight="140%"
      letterSpacing="-2.5%"
      color="#000"
    >
      {title}
    </Typography>
    <ViewDetailButton onPress={onPress}>
      <Typography
        fontSize={11}
        lineHeight="140%"
        letterSpacing="-2.5%"
        color={theme.colors.disabled}
      >
        상세보기
      </Typography>
    </ViewDetailButton>
  </HeaderContainer>
);

const DescriptionWrapper = styled.View<{ marginBottom?: number }>`
  width: 100%;
  flex-direction: row;
  align-items: center;
  ${({ marginBottom }) => marginBottom !== undefined && `margin-bottom: ${marginBottom}px;`}
`

const DescriptionNameWrapper = styled.View`
  width: 45px;
  margin-right: 20px;
`

const Description = ({ name, value, marginBottom }: {name: string, value: string, marginBottom?: number}) => (
  <DescriptionWrapper marginBottom={marginBottom}>
    <DescriptionNameWrapper>
      <Typography
        fontSize={11}
        lineHeight="140%"
        letterSpacing="-2.5%"
        color={theme.colors.disabled}
      >
        {name}
      </Typography>
    </DescriptionNameWrapper>
    <Typography
      fontSize={11}
      lineHeight="140%"
      letterSpacing="-2.5%"
      color={theme.colors.textSecondary}
    >
      {value}
    </Typography>
  </DescriptionWrapper>
)

const StatusWrapper = styled.TouchableOpacity`
  width: 100%;
  height: 40px;
  border-radius: 8px;
  border: 1px solid ${theme.colors.disabled};
  justify-content: center;
  align-items: center;
`

const Status = ({ text, disabled = true, onPress = () => {} }: { text: string, disabled?: boolean, onPress?: () => void }) => (
  <StatusWrapper disabled={disabled} onPress={onPress}>
    <Typography
      fontSize={12}
      fontWeight="bold"
      lineHeight="140%"
      letterSpacing="-2.5%"
      color={theme.colors.disabled}
    >
      {text}
    </Typography>
  </StatusWrapper>
)

const ActionButtonWrapper = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

const ActionButton = styled.TouchableOpacity`
  flex: 1;
  height: 40px;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
`

const ConfirmButton = styled(ActionButton)`
  background-color: ${theme.colors.primary};
  margin-right: 7px;
`

const CancelButton = styled(ActionButton)`
  border: 1px solid ${theme.colors.primary};
`