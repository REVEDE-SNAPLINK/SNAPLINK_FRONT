import { useNavigation } from '@react-navigation/native';
import SelectTypeView from './SelectTypeView';
import { AuthNavigationProp } from '@/types/navigation.ts';

export default function SelectTypeContainer() {
  const navigation = useNavigation<AuthNavigationProp>();

  const handleBackButton = () => navigation.goBack();
  const handleUserButton = () => navigation.navigate('ApplyPhotographer');
  const handlePhotographerButton = () => navigation.navigate('ApplyPhotographer');

  return (
    <SelectTypeView
      onPressBackButton={handleBackButton}
      onPressUser={handleUserButton}
      onPressPhotographer={handlePhotographerButton}
    />
  );
}
