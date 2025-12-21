import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/types/navigation';
import MainTab from '@/screens/MainTab';
import SearchPhotographerContainer from '@/screens/user/SearchPhotographer/SearchPhotographerContainer.tsx';
import PhotographerDetailsContainer from '@/screens/user/PhotographerDetails/PhotographerDetailsContainer.tsx';
import BookingContainer from '@/screens/user/Booking/BookingContainer.tsx';
import BookingHistoryContainer from '@/screens/user/BookingHistory/BookingHistoryContainer.tsx';
import BookingDetailsContainer from '@/screens/user/BookingDetails/BookingDetailsContainer.tsx';
import WriteReviewContainer from '@/screens/user/WriteReview/WriteReviewContainer.tsx';
import ViewPhotosContainer from '@/screens/user/ViewPhotos/ViewPhotosContainer.tsx';
import PortfolioOnboardingContainer from '@/screens/photographer/PortfolioOnboarding/PortfolioOnboardingContainer.tsx';

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{headerShown: false}}
    >
      <Stack.Screen name="Home" component={MainTab} />
      <Stack.Screen name="SearchPhotographer" component={SearchPhotographerContainer} />
      <Stack.Screen name="PhotographerDetails" component={PhotographerDetailsContainer} />
      <Stack.Screen name="Booking" component={BookingContainer} />
      <Stack.Screen name="BookingHistory" component={BookingHistoryContainer} />
      <Stack.Screen name="BookingDetails" component={BookingDetailsContainer} />
      <Stack.Screen name="WriteReview" component={WriteReviewContainer} />
      <Stack.Screen name="ViewPhotos" component={ViewPhotosContainer} />
      <Stack.Screen name="PortfolioOnboarding" component={PortfolioOnboardingContainer} />
    </Stack.Navigator>
  )
}