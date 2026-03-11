import ScreenContainer from '@/components/layout/ScreenContainer.tsx';
import styled from '@/utils/scale/CustomStyled.ts';
import { PrimaryToggleButton, Typography } from '@/components/ui';

interface NotificationSettingViewProps {
  onPressBack: () => void;
  allNotifications: boolean;
  chatNotifications: boolean;
  serviceNotifications: boolean;
  communityNotifications: boolean;
  advertisementNotifications: boolean;
  systemNotifications: boolean;
  onToggleAllNotifications: (value: boolean) => void;
  onToggleChatNotifications: (value: boolean) => void;
  onToggleServiceNotifications: (value: boolean) => void;
  onToggleCommunityNotifications: (value: boolean) => void;
  onToggleAdvertisementNotifications: (value: boolean) => void;
  onToggleSystemNotifications: (value: boolean) => void;

  navigation?: any;
}

export default function NotificationSettingView({
  onPressBack,
  allNotifications,
  chatNotifications,
  serviceNotifications,
  communityNotifications,
  advertisementNotifications,
  systemNotifications,
  onToggleAllNotifications,
  onToggleChatNotifications,
  onToggleServiceNotifications,
  onToggleCommunityNotifications,
  onToggleAdvertisementNotifications,
  onToggleSystemNotifications,
  navigation,
}: NotificationSettingViewProps) {
  return (
    <ScreenContainer
      headerShown={true}
      headerTitle="알림 설정"
      onPressBack={onPressBack}
      paddingHorizontal={33}
      navigation={navigation}
    >
      <NotificationItem>
        <Typography
          fontSize={16}
          color="#000"
        >
          전체 알림
        </Typography>
        <PrimaryToggleButton value={allNotifications} onToggle={onToggleAllNotifications} />
      </NotificationItem>
      <NotificationItem>
        <NotificationItemTextWrapper>
          <Typography
            fontSize={16}
            color="#000"
            marginBottom={4}
          >
            채팅 알림
          </Typography>
          <Typography
            fontSize={12}
            color="#aaa"
          >
            채팅 메시지, 안 읽음 메시지 리마인드 알림
          </Typography>
        </NotificationItemTextWrapper>
        <PrimaryToggleButton value={chatNotifications} onToggle={onToggleChatNotifications} />
      </NotificationItem>
      <NotificationItem>
        <NotificationItemTextWrapper>
          <Typography
            fontSize={16}
            color="#000"
            marginBottom={4}
          >
            서비스 푸시 알림
          </Typography>
          <Typography
            fontSize={12}
            color="#aaa"
          >
            촬영 예약 관련 안내
          </Typography>
        </NotificationItemTextWrapper>
        <PrimaryToggleButton value={serviceNotifications} onToggle={onToggleServiceNotifications} />
      </NotificationItem>
      <NotificationItem>
        <NotificationItemTextWrapper>
          <Typography
            fontSize={16}
            color="#000"
            marginBottom={4}
          >
            커뮤니티 알림
          </Typography>
          <Typography
            fontSize={12}
            color="#aaa"
          >
            작성한 글의 댓글, 좋아요 등 알림
          </Typography>
        </NotificationItemTextWrapper>
        <PrimaryToggleButton value={communityNotifications} onToggle={onToggleCommunityNotifications} />
      </NotificationItem>
      <NotificationItem>
        <NotificationItemTextWrapper>
          <Typography
            fontSize={16}
            color="#000"
            marginBottom={4}
          >
            광고 서비스 알림
          </Typography>
          <Typography
            fontSize={12}
            color="#aaa"
          >
            쿠폰 발급, 확인하지 않은 혜택 등 놓치지 않도록 안내
          </Typography>
        </NotificationItemTextWrapper>
        <PrimaryToggleButton value={advertisementNotifications} onToggle={onToggleAdvertisementNotifications} />
      </NotificationItem>
      <NotificationItem>
        <NotificationItemTextWrapper>
          <Typography
            fontSize={16}
            color="#000"
            marginBottom={4}
          >
            시스템 알림
          </Typography>
          <Typography
            fontSize={12}
            color="#aaa"
          >
            공지사항 등 스냅링크 시스템 관련 안내
          </Typography>
        </NotificationItemTextWrapper>
        <PrimaryToggleButton value={systemNotifications} onToggle={onToggleSystemNotifications} />
      </NotificationItem>
    </ScreenContainer>
  )
}

const NotificationItem = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 31px;
`

const NotificationItemTextWrapper = styled.View`
  flex: 1;
  padding-right: 20px;
`