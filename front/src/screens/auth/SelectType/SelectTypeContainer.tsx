import { useNavigation } from '@react-navigation/native';
import SelectTypeView from './SelectTypeView';
import { AuthNavigationProp } from '@/types/navigation.ts';
import { useAuthStore } from '@/store/authStore.ts';

export default function SelectTypeContainer() {
  const navigation = useNavigation<AuthNavigationProp>();
  const { setUserType } = useAuthStore();

  const handlePressUser = () => {
    setUserType('user');
    navigation.navigate('UserOnboarding');
  }
  const handlePressPhotographer = () => {
    setUserType('photographer');
    navigation.navigate('UserOnboarding');
  }

  return (
    <SelectTypeView
      onPressUser={handlePressUser}
      onPressPhotographer={handlePressPhotographer}
    />
  );
}
