import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation.ts';
import NotificationView from '@/screens/common/Notification/NotificationView.tsx';
import { useNotificationsQuery } from '@/queries/notifications.ts';
import { usePatchNotificationReadMutation } from '@/mutations/notifications.ts';

// TODO: 현재 API에 카테고리 필터 기능이 없습니다. 추후 백엔드 API가 추가되면 활성화하세요.
type NotificationCategory = '일정' | '리뷰' | '게시글';

export default function NotificationContainer() {
  const navigation = useNavigation<MainNavigationProp>();

  // TODO: 카테고리 필터 기능 - API 지원 시 활성화
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory>('일정');

  // Fetch notifications (최근 20개)
  const { data: notifications = [] } = useNotificationsQuery();

  // Mark as read mutation
  const markAsReadMutation = usePatchNotificationReadMutation();

  // TODO: 삭제 기능 - 백엔드 API가 추가되면 구현
  // DELETE /api/notifications/{notificationId} 엔드포인트 필요
  // const deleteMutation = useMutation({
  //   mutationFn: deleteNotification,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.list() });
  //   },
  // });

  const handlePressBack = () => navigation.goBack();

  // TODO: 카테고리 탭 기능 - API 지원 시 활성화
  const handlePressTab = (category: NotificationCategory) => {
    setSelectedCategory(category);
  };

  const handlePressNotification = (notificationId: string) => {
    // Mark as read
    markAsReadMutation.mutate({ notificationId: Number(notificationId) });

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
  const handlePressDelete = (notificationId: string) => {
    // deleteMutation.mutate(Number(notificationId));
    console.log(notificationId);
  };

  // Transform API data to view model
  const viewNotifications = notifications.map((n) => ({
    id: String(n.id),
    title: n.title,
    body: n.body,
    date: n.createdAt,
    isRead: n.isRead,
    // TODO: API에서 category, relatedId 제공 시 추가
    // category: n.category,
    // relatedId: n.relatedId,
  }));

  return (
    <NotificationView
      notifications={viewNotifications}
      // TODO: 카테고리 기능 활성화 시 props 전달
      selectedCategory={selectedCategory}
      onPressTab={handlePressTab}
      onPressBack={handlePressBack}
      onPressNotification={handlePressNotification}
      onPressDelete={handlePressDelete}
    />
  );
}
