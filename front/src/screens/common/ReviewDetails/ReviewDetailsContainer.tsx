import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';
import ReviewDetailsView from '@/screens/common/ReviewDetails/ReviewDetailsView.tsx';

type ReviewDetailsRouteProp = RouteProp<MainStackParamList, 'ReviewDetails'>;

export default function ReviewDetailsContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<ReviewDetailsRouteProp>();

  const { review } = route.params;

  const handlePressBack = () => navigation.goBack();

  return (
    <ReviewDetailsView
      review={review}
      onPressBack={handlePressBack}
    />
  );
}
