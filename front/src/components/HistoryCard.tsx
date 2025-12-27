import { theme } from '@/theme';
import Typography from '@/components/theme/Typography.tsx';
import styled from '@/utils/scale/CustomStyled.ts';
import { useAuthStore } from '@/store/authStore.ts';
import { useMemo } from 'react';
import { ReservationStatus } from '@/api/reservations.ts';

interface HistoryCardProps {
  onPress: () => void;
  onPressViewPhotos?: () => void;
  onPressWriteReview?: () => void;
  onPressRejectBooking?: () => void;
  onPressConfirmBooking?: () => void;
  status: ReservationStatus;
  userName?: string;
  photographerName: string;
  photographerNickName: string;
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
  photographerNickName,
  type,
  datetime,
}: HistoryCardProps) {

  const { userType, isExpertMode } = useAuthStore();

  const isUserMode = userType === 'user' || !isExpertMode;

  const headerTitle = (() => {
    switch (status) {
      case 'REJECTED':
        if (isUserMode) return photographerNickName + '님이 예약을 거절했어요'
        return userName + '님의 예약을 거절했어요'
      case 'REQUESTED':
        if (!isUserMode) return photographerNickName + '님, 예약이 접수되었어요!'
      case 'CONFIRMED':
        if (isUserMode) return photographerNickName + '님과 인생샷 건질 준비 중이에요'
        else return userName + '님과 인생샷 건질 준비 중이에요'
      case 'COMPLETED':
      case 'DELIVERED':
      case 'REVIEWED':
        if (isUserMode) return photographerNickName + '님과 함께 한 추억이에요'
        else return userName + '님에게 추억을 선물했어요!'
      }
    })();

  const renderUserActionButtons = useMemo(() => {
    if (status !== 'DELIVERED' && status !== 'REVIEWED') {
      return (
        <Status
          text={
            status === 'REQUESTED'
              ? '작가님의 승인을 기다리고 있어요'
              : status === 'CONFIRMED'
            ? '아직 촬영 전이에요' :
              status === 'COMPLETED'
            ? '작가님이 작업 중이에요'
              : '거절된 예약이에요'
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
    if (status !== 'REQUESTED') {
      if (status !== 'CONFIRMED' && status === 'REJECTED') {
        return (
          <Status text={
            status === 'REJECTED'
              ? '거절한 예약이에요'
              : '아직 촬영 전이에요'
          } />
        )
      }
      return (
        <Status
          disabled={false}
          onPress={onPressViewPhotos || (() => {})}
          text='사진 업로드'
        />
      )
    }
    return (
      <ActionButtonWrapper>
        {onPressConfirmBooking && (
          <ConfirmButton onPress={(e) => {
            e.stopPropagation();
            onPressConfirmBooking();
          }}>
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
          <CancelButton onPress={(e) => {
            e.stopPropagation();
            onPressRejectBooking();
          }}>
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
    <HistoryContainer onPress={onPress}>
      <InfoWrapper>
        <Header title={headerTitle} />
        <Description name={userType === 'user' ? "작가명" : "고객명"} value={userType === "photographer" && userName ? userName : photographerName} marginBottom={12} />
        <Description name="촬영 항목" value={type} marginBottom={12} />
        <Description name="촬영 일시" value={datetime} />
      </InfoWrapper>
      {userType === 'user' || !isExpertMode ? renderUserActionButtons : renderPhotographerActionButtons}
    </HistoryContainer>
  );
}

const HistoryContainer = styled.Pressable`
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

const ViewDetailButton = styled.View`
  padding: 3px 5px;
  border-radius: 100px;
  border: 1px solid ${theme.colors.disabled};
  justify-content: center;
  align-items: center;
`

const Header = ({ title }: {title: string}) => (
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
    <ViewDetailButton>
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
  <StatusWrapper
    disabled={disabled}
    onPress={(e) => {
      if (onPress) {
        e.stopPropagation();
        onPress();
      }
    }}
  >
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