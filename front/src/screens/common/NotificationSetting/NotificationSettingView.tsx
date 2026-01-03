import ScreenContainer from '@/components/common/ScreenContainer.tsx';
import styled from '@/utils/scale/CustomStyled.ts';
import { PrimaryToggleButton, Typography } from '@/components/theme';

interface NotificationSettingViewProps {
  onPressBack: () => void;
  allNotifications: boolean;
  chatNotifications: boolean;
  serviceNotifications: boolean;
  communityNotifications: boolean;
  advertisementNotifications: boolean;
  followNotifications: boolean;
  onToggleAllNotifications: (value: boolean) => void;
  onToggleChatNotifications: (value: boolean) => void;
  onToggleServiceNotifications: (value: boolean) => void;
  onToggleCommunityNotifications: (value: boolean) => void;
  onToggleAdvertisementNotifications: (value: boolean) => void;
  onToggleFollowNotifications: (value: boolean) => void;
}

export default function NotificationSettingView({
  onPressBack,
  allNotifications,
  chatNotifications,
  serviceNotifications,
  communityNotifications,
  advertisementNotifications,
  followNotifications,
  onToggleAllNotifications,
  onToggleChatNotifications,
  onToggleServiceNotifications,
  onToggleCommunityNotifications,
  onToggleAdvertisementNotifications,
  onToggleFollowNotifications,
}: NotificationSettingViewProps) {
  return (
    <ScreenContainer
      headerShown={true}
      headerTitle="알림 설정"
      onPressBack={onPressBack}
      paddingHorizontal={33}
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
            팔로우 알림
          </Typography>
          <Typography
            fontSize={12}
            color="#aaa"
          >
            팔로우 한 작가 게시글, 포트폴리오 등 소식 안내
          </Typography>
        </NotificationItemTextWrapper>
        <PrimaryToggleButton value={followNotifications} onToggle={onToggleFollowNotifications} />
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
  
`