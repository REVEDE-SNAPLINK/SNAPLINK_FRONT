import { useNavigation } from '@react-navigation/native';
import SelectTypeView from './SelectTypeView';
import { AuthNavigationProp } from '@/types/navigation.ts';

export default function SelectTypeContainer() {
  const navigation = useNavigation<AuthNavigationProp>();

  const handlePressUser = () => navigation.navigate('UserOnboarding', { type: 'user' });
  const handlePressPhotographer = () => navigation.navigate('UserOnboarding', { type: 'photographer' });

  return (
    <SelectTypeView
      onPressUser={handlePressUser}
      onPressPhotographer={handlePressPhotographer}
    />
  );
}
