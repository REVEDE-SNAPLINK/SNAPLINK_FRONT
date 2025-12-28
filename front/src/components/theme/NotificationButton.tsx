import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation.ts';
import { TouchableOpacity } from 'react-native';
import BadgeIcon from '@/components/theme/BadgeIcon.tsx';
import NotificationIcon from '@/assets/icons/notification.svg';

export default function NotificationButton() {
  const navigation = useNavigation<MainNavigationProp>();
  const badgeCount = 1;

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Notification')}
    >
      <BadgeIcon width={24} height={24} Svg={NotificationIcon} badgeCount={badgeCount} />
    </TouchableOpacity>
  )
}