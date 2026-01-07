import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation.ts';
import NotificationView from '@/screens/common/Notification/NotificationView.tsx';
import { useNotificationsQuery } from '@/queries/notifications.ts';
import { usePatchNotificationReadMutation } from '@/mutations/notifications.ts';

export default function NotificationContainer() {
  const navigation = useNavigation<MainNavigationProp>();

  // TODO: 카테고리 필터 기능 - API 지원 시 활성화
  // const [selectedCategory, setSelectedCategory] = useState<NotificationCategory>('일정');

  // Fetch notifications (최근 20개)
  const { data: notifications = [] } = useNotificationsQuery();

  // Mark as read mutation
  const markAsReadMutation = usePatchNotificationReadMutation();

  const handlePressBack = () => navigation.goBack();

  // // TODO: 카테고리 탭 기능 - API 지원 시 활성화
  // const handlePressTab = (category: NotificationCategory) => {
  //   setSelectedCategory(category);
  // };

  const handlePressNotification = (notificationId: number) => {
    // Mark as read
    markAsReadMutation.mutate({ notificationId });

    // TODO: Navigate based on notification type
    // 현재 API 응답에 notification type이나 relatedId가 없어서 네비게이션 불가
    // 백엔드 API에서 type, relatedId 필드가 추가되면 아래 로직 활성화

    // const notification = notifications.find((n) => n.id === Number(notificationId));
    // if (!notification) return;
    //
    // if (notification.type === 'POST' && notification.relatedId) {
    //   navigation.navigate('CommunityDetails', { postId: notification.relatedId });
    // } else if (notification.type === 'BOOKING' && notification.relatedId) {
    //   navigation.navigate('BookingDetails', { reservationId: Number(notification.relatedId) });
    // } else if (notification.type === 'REVIEW' && notification.relatedId) {
    //   navigation.navigate('ReviewDetails', { reviewId: Number(notification.relatedId) });
    // }
  };

  // TODO: 삭제 기능 - 백엔드 API 추가 시 구현
  // const handlePressDelete = (notificationId: string) => {
  //   // deleteMutation.mutate(Number(notificationId));
  //   console.log(notificationId);
  // };

  const handlePressSetting = () => navigation.navigate('NotificationSetting')

  // // Transform API data to view model
  // const viewNotifications = notifications.map((n) => ({
  //   id: String(n.id),
  //   category: '일정' as NotificationCategory, // TODO: API에서 category 필드 추가 시 n.category 사용
  //   type: 'BOOKING_REQUEST', // TODO: API에서 type 필드 추가 시 n.type 사용
  //   message: n.body,
  //   time: n.createdAt,
  //   relatedId: undefined, // TODO: API에서 relatedId 필드 추가 시 n.relatedId 사용
  //   // 게시글 알림 관련 (TODO: API 데이터 추가 시 활성화)
  //   postMessage: undefined,
  //   commentCount: undefined,
  //   relatedImage: undefined,
  //   // 일정 알림 관련 (TODO: API 데이터 추가 시 활성화)
  //   photographerNickname: undefined,
  //   userNickname: undefined,
  //   bookingType: undefined,
  //   datetime: undefined,
  // }));

  return (
    <NotificationView
      notifications={notifications}
      // TODO: 카테고리 기능 활성화 시 props 전달
      // selectedCategory={selectedCategory}
      // onPressTab={handlePressTab}
      onPressBack={handlePressBack}
      onPressNotification={handlePressNotification}
      // onPressDelete={handlePressDelete}
      onPressSetting={handlePressSetting}
      navigation={navigation}
    />
  );
}
