import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation.ts';
import { TouchableOpacity } from 'react-native';
import BadgeIcon from '@/components/theme/BadgeIcon.tsx';
import NotificationIcon from '@/assets/icons/notification.svg';
import { useUnreadNotificationStatusQuery } from '@/queries/notifications.ts';

export default function NotificationButton() {
  const navigation = useNavigation<MainNavigationProp>();

  const { data: unreadStatus, isSuccess } = useUnreadNotificationStatusQuery();

  return (
    <TouchableOpacity onPress={() => navigation.navigate('Notification')}>
      {isSuccess && <BadgeIcon width={24} height={24} Svg={NotificationIcon} isNew={unreadStatus} />}
    </TouchableOpacity>
  );
}