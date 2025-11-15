import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/types/navigation';
import { useAuth } from '@/context/AuthContext';
import UserTab from '@/screens/user/UserTab';
import PhotographerTab from '@/screens/photographer/PhotographerTab';
import SearchPhotographerContainer from '@/screens/user/SearchPhotographer/SearchPhotographerContainer.tsx';
import PhotographerDetailsContainer from '@/screens/user/PhotographerDetails/PhotographerDetailsContainer.tsx';
import BookingContainer from '@/screens/user/Booking/BookingContainer.tsx';
import BookingHistoryContainer from '@/screens/user/BookingHistory/BookingHistoryContainer.tsx';

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainStack() {
  const { user } = useAuth();

  // user type에 따라 다른 탭 네비게이션 렌더링
  const TabComponent = user?.userType === 'photographer' ? PhotographerTab : UserTab;

  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{headerShown: false}}
    >
      <Stack.Screen name="Home" component={TabComponent} />
      <Stack.Screen name="SearchPhotographer" component={SearchPhotographerContainer} />
      <Stack.Screen name="PhotographerDetails" component={PhotographerDetailsContainer} />
      <Stack.Screen name="Booking" component={BookingContainer} />
      <Stack.Screen name="BookingHistory" component={BookingHistoryContainer} />
    </Stack.Navigator>
  )
}