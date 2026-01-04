import ScreenContainer from '@/components/common/ScreenContainer';
import styled from '@/utils/scale/CustomStyled.ts';
import { theme } from '@/theme';
import { Typography } from '@/components/theme';
import Icon from '@/components/Icon.tsx';
import MoreCircleIcon from '@/assets/icons/more-circle.svg';
import SettingsIcon from '@/assets/icons/settings.svg';
import { Notification, NotificationCategory } from '@/api/notifications';

interface NotificationViewProps {
  notifications: Notification[];
  selectedCategory: NotificationCategory;
  onPressBack: () => void;
  onPressTab: (category: NotificationCategory) => void;
  onPressNotification: (notificationId: string, relatedId?: string) => void;
  onPressDelete: (notificationId: string) => void;
  onPressSetting: () => void;

  navigation?: any;
}

const CATEGORIES: NotificationCategory[] = ['일정', '게시글', '리뷰'];

export default function NotificationView({
  notifications,
  selectedCategory,
  onPressBack,
  onPressTab,
  onPressNotification,
  onPressDelete,
  onPressSetting,
  navigation,
}: NotificationViewProps) {
  return (
    <ScreenContainer
      headerShown={true}
      headerTitle="알림"
      onPressBack={onPressBack}
      onPressTool={onPressSetting}
      headerToolIcon={SettingsIcon}
      navigation={navigation}
    >
      <TabNavigator>
        {CATEGORIES.map((category) => (
          <Tab
            key={category}
            isSelected={selectedCategory === category}
            onPress={() => onPressTab(category)}
          >
            <Typography
              fontSize={11}
              color={selectedCategory === category ? '#fff' : theme.colors.textPrimary}
            >
              {category}
            </Typography>
          </Tab>
        ))}
      </TabNavigator>
      <NotificationContainer showsVerticalScrollIndicator={false}>
        {notifications.map((notification) => {
          if (notification.category === '게시글') {
            return (
              <PostNotificationItem
                key={notification.id}
                message={notification.postMessage || notification.message}
                count={notification.commentCount || 0}
                time={notification.time || ''}
                relatedImage={notification.relatedImage}
                onPress={() => onPressNotification(notification.id, notification.relatedId)}
                onPressDelete={() => onPressDelete(notification.id)}
              />
            );
          } else if (notification.category === '일정') {
            // Check if it's a user notification or photographer notification
            if (notification.photographerNickname) {
              return (
                <UserBookingNotificationItem
                  key={notification.id}
                  notificationType={notification.type as any}
                  photographerNickname={notification.photographerNickname}
                  bookingType={notification.bookingType || ''}
                  datetime={notification.datetime || ''}
                  onPress={() => onPressNotification(notification.id, notification.relatedId)}
                  onPressDelete={() => onPressDelete(notification.id)}
                />
              );
            } else if (notification.userNickname) {
              return (
                <PhotographerBookingNotificationItem
                  key={notification.id}
                  notificationType={notification.type as any}
                  userNickname={notification.userNickname}
                  bookingType={notification.bookingType || ''}
                  datetime={notification.datetime || ''}
                  onPress={() => onPressNotification(notification.id, notification.relatedId)}
                  onPressDelete={() => onPressDelete(notification.id)}
                />
              );
            }
          }
          return null;
        })}
      </NotificationContainer>
    </ScreenContainer>
  );
}

const TabNavigator = styled.View`
  width: 100%;
  flex-direction: row;
  padding-left: 23px;
  margin-bottom: 36px;
`

const Tab = styled.TouchableOpacity<{ isSelected: boolean }>`
  height: 25px;
  border-radius: 100px;
  padding: 0 8px;
  justify-content: center;
  align-items: center;
  margin-right: 8px;
  background-color: ${({ isSelected }) => isSelected ? theme.colors.primary : '#F4F4F4'};
`

const NotificationContainer = styled.ScrollView`
  flex: 1;
  width: 100%;
  padding: 0 25px;
`

const NotificationItem = styled.View`
  width: 100%;
  flex-direction: row;
  margin-bottom: 15px;
`

const NotificationItemImage = styled.Image`
  width: 65px;
  height: 65px;
  margin-right: 6px;
  background-color: #ccc;
`

const NotificationItemContent = styled.View`
  flex: 1;
`

const NotificationItemHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

const NotificationItemToolWrapper = styled.View`
  flex-direction: row;
  align-items: center;
`

const NotificationItemButton = styled.TouchableOpacity`
  width: 100%;
  flex-direction: row;
  margin-bottom: 15px;
`

const NotificationItemDeleteButton = styled.TouchableOpacity`
  padding: 2px;
`

interface PostNotificationProps {
  message: string;
  count: number;
  time: string;
  relatedImage?: string;
  onPress: () => void;
  onPressDelete: () => void;
}

// tab이 게시물일때
const PostNotificationItem = ({
  message,
  count,
  time,
  relatedImage,
  onPress,
  onPressDelete,
}: PostNotificationProps) => {
  return (
    <NotificationItemButton onPress={onPress}>
      <NotificationItemImage source={relatedImage ? { uri: relatedImage } : undefined} />
      <NotificationItemContent>
        <NotificationItemHeader>
          <Typography fontSize={10} marginBottom={11}>
            게시글 알림
          </Typography>
          <NotificationItemToolWrapper>
            <Typography fontSize={10} color="#C8C8C8" marginRight={7}>
              {time}
            </Typography>
            <NotificationItemDeleteButton onPress={onPressDelete}>
              <Icon width={18} height={18} Svg={MoreCircleIcon} />
            </NotificationItemDeleteButton>
          </NotificationItemToolWrapper>
        </NotificationItemHeader>
        <Typography fontSize={12} marginBottom={10} color="#AAA">
          {message}
        </Typography>
        <Typography fontSize={12} marginBottom={10} color="#AAA">
          {count}건 더보기
        </Typography>
      </NotificationItemContent>
    </NotificationItemButton>
  );
};

// 탭이 일정인데 고객일때
interface UserBookingNotificationProps {
  notificationType: 'BOOKING_CONFIRMED' | 'SHOOTING_REMINDER_D1' | 'SHOOTING_COMPLETED' | 'REVIEW_REQUEST';
  photographerNickname: string;
  bookingType: string;
  datetime: string;
  onPress: () => void;
  onPressDelete: () => void;
}

const UserBookingNotificationItem = ({
  notificationType,
  photographerNickname,
  bookingType,
  datetime,
  onPress,
  onPressDelete,
}: UserBookingNotificationProps) => {
  const title = (() => {
    switch (notificationType) {
      case 'BOOKING_CONFIRMED':
        return '촬영이 예약되었어요.';
      case 'SHOOTING_REMINDER_D1':
        return '드디어 내일이 촬영일이에요!';
      case 'SHOOTING_COMPLETED':
        return '촬영이 완료되었어요.';
      case 'REVIEW_REQUEST':
        return '예약했던 촬영은 마음에 드셨나요?';
    }
  })();

  const nicknameElement = (
    <Typography
      fontSize={12}
      fontWeight='bold'
    >
      {photographerNickname}
    </Typography>
  )

  const bookingTypeElement = (
    <Typography
      fontSize={12}
      fontWeight='bold'
    >
      {bookingType}
    </Typography>
  )

  const message = (() => {
    switch (notificationType) {
      case 'BOOKING_CONFIRMED':
        return (
          <Typography fontSize={12} marginBottom={5}>
            {nicknameElement}과 함께할 {bookingTypeElement}이 예약되었어요. 예약일까지 두근두근 기다리고 있을게요!
          </Typography>
        )
      case 'SHOOTING_REMINDER_D1':
        return (
          <Typography fontSize={12} marginBottom={5}>
            {nicknameElement}과 함께할 {bookingTypeElement}이 벌써 하루를 남겨두고 있어요. 챙겨야 할 준비물이나 빠트린 것은 없는지 점검해보세요!
          </Typography>
        )
      case 'SHOOTING_COMPLETED':
        return (
          <Typography fontSize={12} marginBottom={5}>
            {nicknameElement}과 함께한 {bookingTypeElement}이 마무리 되었어요. 촬영한 사진을 확인해보세요!
          </Typography>
        )
      case 'REVIEW_REQUEST':
        return (
          <Typography fontSize={12} marginBottom={5}>
            {nicknameElement}과 함께한 {bookingTypeElement}에 대한 리뷰를 남겨보세요. 고객님의 리뷰는 다른 분들에게 소중해요!
          </Typography>
        )
    }
  })();

  return (
    <NotificationItemButton onPress={onPress}>
      <NotificationItemImage />
      <NotificationItemContent>
        <NotificationItemHeader>
          <Typography fontSize={10} marginBottom={11}>
            {title}
          </Typography>
          <NotificationItemDeleteButton onPress={onPressDelete}>
            <Icon width={18} height={18} Svg={MoreCircleIcon} />
          </NotificationItemDeleteButton>
        </NotificationItemHeader>
        {message}
        <Typography fontSize={10} color="#C8C8C8">
          {datetime}
        </Typography>
      </NotificationItemContent>
    </NotificationItemButton>
  );
};

// 탭이 일정인데 작가일때
interface PhotographerBookingNotificationProps {
  notificationType: 'BOOKING_REQUEST' | 'SHOOTING_REMINDER_D1' | 'SHOOTING_COMPLETED';
  userNickname: string;
  bookingType: string;
  datetime: string;
  onPress: () => void;
  onPressDelete: () => void;
}

const PhotographerBookingNotificationItem = ({
  notificationType,
  userNickname,
  bookingType,
  datetime,
  onPress,
  onPressDelete,
}: PhotographerBookingNotificationProps) => {
  const title = (() => {
    switch (notificationType) {
      case 'BOOKING_REQUEST':
        return '촬영 예약이 도착했어요.';
      case 'SHOOTING_REMINDER_D1':
        return '드디어 내일이 촬영일이에요!';
      case 'SHOOTING_COMPLETED':
        return '촬영이 완료되었나요?';
    }
  })();

  const nicknameElement = (
    <Typography
      fontSize={12}
      fontWeight='bold'
    >
      {userNickname}님
    </Typography>
  )

  const bookingTypeElement = (
    <Typography
      fontSize={12}
      fontWeight='bold'
    >
      {bookingType}
    </Typography>
  )

  const message = (() => {
    switch (notificationType) {
      case 'BOOKING_REQUEST':
        return (
          <Typography fontSize={12} marginBottom={5}>
            {nicknameElement}이 {bookingTypeElement}을 예약했어요. 예약 정보를 자세히 확인하러 가볼까요?
          </Typography>
        )
      case 'SHOOTING_REMINDER_D1':
        return (
          <Typography fontSize={12} marginBottom={5}>
            {nicknameElement}과 함께할 {bookingTypeElement}이 벌써 하루를 남겨두고 있어요. 챙겨야 할 준비물이나 빠트린 것은 없는지 점검해보세요!
          </Typography>
        )
      case 'SHOOTING_COMPLETED':
        return (
          <Typography fontSize={12} marginBottom={5}>
            {nicknameElement}과 함께한 {bookingTypeElement}이 마무리 되었다면 필요한 보정 작업 등을 마무리 한 후에 촬영 사진을 업로드해주세요!
          </Typography>
        )
    }
  })();

  return (
    <NotificationItemButton onPress={onPress}>
      <NotificationItemContent>
        <NotificationItemHeader>
          <Typography fontSize={10} marginBottom={11}>
            {title}
          </Typography>
          <NotificationItemDeleteButton onPress={onPressDelete}>
            <Icon width={18} height={18} Svg={MoreCircleIcon} />
          </NotificationItemDeleteButton>
        </NotificationItemHeader>
        {message}
        <Typography fontSize={10} color="#C8C8C8">
          {datetime}
        </Typography>
      </NotificationItemContent>
    </NotificationItemButton>
  );
};
