import { theme } from '@/theme';
import Typography from '@/components/theme/Typography.tsx';
import styled from '@/utils/scale/CustomStyled.ts';
import { useAuthStore } from '@/store/authStore.ts';
import { useMemo } from 'react';
import { BookingStatus } from '@/api/bookings.ts';

interface HistoryCardProps {
  onPress: () => void;
  onPressViewPhotos?: () => void;
  onPressWriteReview?: () => void;
  onPressViewMyReivew?: () => void;
  onPressRejectBooking?: () => void;
  onPressConfirmBooking?: () => void;
  onPressCompleteBooking?: () => void;
  onPressCancelBooking?: () => void;
  canCompleteBooking?: boolean;
  canCancelBooking?: boolean;
  status: BookingStatus;
  userName?: string;
  photographerName: string;
  photographerNickName: string;
  type: string;
  datetime: string;
  /**
   * 이 예약이 "내가 예약한 것"인지 "내가 받은 것"인지 명시
   * - true: 내가 예약한 것 (사용자 입장) - BookingHistory에서 사용
   * - false: 내가 받은 것 (작가 입장) - BookingManage에서 사용
   * - undefined: 기존 로직 사용 (userType/isExpertMode 기반)
   */
  isUserBooking?: boolean;
}

export default function HistoryCard({
  onPress,
  onPressViewPhotos,
  onPressWriteReview,
  onPressViewMyReivew,
  onPressRejectBooking,
  onPressConfirmBooking,
  onPressCompleteBooking,
  onPressCancelBooking,
  canCompleteBooking,
  canCancelBooking,
  status,
  userName,
  photographerName,
  photographerNickName,
  type,
  datetime,
  isUserBooking,
}: HistoryCardProps) {

  const { userType, isExpertMode } = useAuthStore();

  // isUserBooking이 명시되면 그 값을 사용, 아니면 기존 로직 (userType/isExpertMode 기반)
  const isUserMode = isUserBooking !== undefined
    ? isUserBooking
    : (userType === 'user' || !isExpertMode);

  const headerTitle = (() => {
    switch (status) {
      case 'CANCELLED':
        if (isUserMode) return photographerNickName + '님과의 예약이 취소됐어요'
        return userName + '님과의 예약이 취소됐어요'
      case 'REJECTED':
        if (isUserMode) return photographerNickName + '님이 예약을 거절했어요'
        return userName + '님의 예약을 거절했어요'
      case 'WAITING_FOR_APPROVAL':
        if (isUserMode) return photographerNickName + '님에게 촬영을 예약했어요!'
        else return photographerNickName + '님, 예약이 접수되었어요!'
      case 'APPROVED':
        if (isUserMode) return photographerNickName + '님과 인생샷 건질 준비 중이에요'
        else return userName + '님과 인생샷 건질 준비 중이에요'
      case 'COMPLETED':
      case 'PHOTOS_DELIVERED':
      case 'USER_PHOTO_CHECK':
        if (isUserMode) return photographerNickName + '님과 함께 한 추억이에요'
        else return userName + '님에게 추억을 선물했어요!'
      }
    })();

  const renderUserActionButtons = useMemo(() => {
    if (status !== 'PHOTOS_DELIVERED' && status !== 'USER_PHOTO_CHECK') {
      if (status === 'WAITING_FOR_APPROVAL' && onPressCancelBooking) {
        return (
          <Status
            text="예약 취소"
            disabled={false}
            onPress={onPressCancelBooking}
          />
        )
      }
      return (
        <Status
          text={
            status === 'APPROVED'
              ? '아직 촬영 전이에요' :
                status === 'COMPLETED'
              ? '작가님이 작업 중이에요'
                : status === 'CANCELLED'
                    ? '취소된 예약이에요'
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
        {onPressViewMyReivew && (
          <CancelButton onPress={onPressViewMyReivew}>
            <Typography
              fontSize={12}
              fontWeight="bold"
              lineHeight="140%"
              letterSpacing="-2.5%"
              color={theme.colors.primary}
            >
              내가 쓴 리뷰
            </Typography>
          </CancelButton>
        )}
      </ActionButtonWrapper>
    );
  }, [status, onPressWriteReview, onPressViewPhotos, onPressViewMyReivew, onPressCancelBooking]);

  const renderPhotographerActionButtons = useMemo(() => {
    if (status !== 'WAITING_FOR_APPROVAL') {
      if (status !== 'COMPLETED') {
        if (status === 'APPROVED') {
          if (canCompleteBooking && onPressCompleteBooking) {
            return (
              <Status
                text="촬영 완료"
                disabled={false}
                onPress={onPressCompleteBooking}
              />
            )
          }
          if (canCancelBooking && onPressCancelBooking) {
            return (
              <Status
                text="예약 취소"
                disabled={false}
                onPress={onPressCancelBooking}
              />
            )
          }
        }
        return (
          <Status text={
            status === 'REJECTED'
              ? '거절한 예약이에요'
              : status === 'CANCELLED'
              ? '취소한 예약이에요'
              : status === 'PHOTOS_DELIVERED' || status === 'USER_PHOTO_CHECK'
              ? '사진 업로드 완료'
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
  }, [status, onPressConfirmBooking, onPressRejectBooking, onPressViewPhotos, onPressCompleteBooking, canCompleteBooking, canCancelBooking, onPressCancelBooking]);

  return (
    <HistoryContainer onPress={onPress}>
      <InfoWrapper>
        <Header title={headerTitle} />
        <Description name={userType === 'user' || !isExpertMode ? "작가명" : "고객명"} value={userType === "photographer" && userName ? userName : photographerName} marginBottom={12} />
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
  margin-bottom: 16px;
`

const HeaderTitleWrapper = styled.View`
  flex: 1;
  margin-right: 10px;
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
    <HeaderTitleWrapper>
      <Typography
        fontSize={16}
        fontWeight="semiBold"
        lineHeight="140%"
        letterSpacing="-2.5%"
        color="#000"
      >
        {title}
      </Typography>
    </HeaderTitleWrapper>
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

const StatusWrapper = styled.TouchableOpacity<{ $disabled: boolean }>`
  width: 100%;
  height: 40px;
  border-radius: 8px;
  border: 1px solid ${({ $disabled }) => $disabled ? theme.colors.disabled : theme.colors.primary};
  justify-content: center;
  align-items: center;
  ${({ $disabled }) => !$disabled ? `background-color: ${theme.colors.primary}` : null };
`

interface StatusProps {
  text: string,
  disabled?: boolean,
  onPress?: () => void
}

const Status = ({
  text,
  disabled = true,
  onPress = () => {}
}: StatusProps ) => (
  <StatusWrapper
    $disabled={disabled}
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
      color={disabled ? theme.colors.disabled : '#fff'}
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