import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/types/navigation';
import MainTab from '@/screens/MainTab';
import SearchPhotographerContainer from '@/screens/common/SearchPhotographer/SearchPhotographerContainer.tsx';
import PhotographerDetailsContainer from '@/screens/common/PhotographerDetails/PhotographerDetailsContainer.tsx';
import PostDetailContainer from '@/screens/common/PostDetail/PostDetailContainer.tsx';
import ChatDetailsContainer from '@/screens/common/ChatDetails/ChatDetailsContainer.tsx';
import BookingContainer from '@/screens/user/Booking/BookingContainer.tsx';
import BookingHistoryContainer from '@/screens/user/BookingHistory/BookingHistoryContainer.tsx';
import BookingDetailsContainer from '@/screens/common/BookingDetails/BookingDetailsContainer.tsx';
import WriteReviewContainer from '@/screens/user/WriteReview/WriteReviewContainer.tsx';
import ViewPhotosContainer from '@/screens/common/ViewPhotos/ViewPhotosContainer.tsx';
import PortfolioOnboardingContainer from '@/screens/photographer/PortfolioOnboarding/PortfolioOnboardingContainer.tsx';
import BookingRequestContainer from '@/screens/user/BookingRequest/BookingRequestContainer.tsx';
import MyPostsContainer from '@/screens/common/MyPosts/MyPostsContainer.tsx';
import ReviewsContainer from '@/screens/common/Reviews/ReviewsContainer.tsx';
import ReviewDetailsContainer from '@/screens/common/ReviewDetails/ReviewDetailsContainer.tsx';
import ReviewPhotosContainer from '@/screens/common/ReviewPhotos/ReviewPhotosContainer.tsx';
import CommunityDetailsContainer from '@/screens/common/CommunityDetails/CommunityDetailsContainer.tsx';
import BookingCalendarContainer from '@/screens/photographer/BookingCalendar/BookingCalendarContainer.tsx';
import NotificationContainer from '@/screens/common/Notification/NotificationContainer.tsx';
import MyReviewsContainer from '@/screens/user/MyReviews/MyReviewsContainer.tsx';
import NicknameEditScreen from '@/screens/common/NicknameEditScreen.tsx';
import NameEditScreen from '@/screens/common/NameEditScreen.tsx';
import AccountManageScreen from '@/screens/common/AccountManageScreen.tsx';
import EmailEditScreen from '@/screens/common/EmailEditScreen.tsx';

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{headerShown: false}}
    >
      <Stack.Screen name="Home" component={MainTab} />
      <Stack.Screen name="NicknameEdit" component={NicknameEditScreen} />
      <Stack.Screen name="NameEdit" component={NameEditScreen} />
      <Stack.Screen name="EmailEdit" component={EmailEditScreen} />
      <Stack.Screen name="AccountManage" component={AccountManageScreen} />
      <Stack.Screen name="Notification" component={NotificationContainer} />
      <Stack.Screen name="SearchPhotographer" component={SearchPhotographerContainer} />
      <Stack.Screen name="PhotographerDetails" component={PhotographerDetailsContainer} />
      <Stack.Screen name="PostDetail" component={PostDetailContainer} />
      <Stack.Screen name="ChatDetails" component={ChatDetailsContainer} />
      <Stack.Screen name="Booking" component={BookingContainer} />
      <Stack.Screen name="BookingHistory" component={BookingHistoryContainer} />
      <Stack.Screen name="BookingRequest" component={BookingRequestContainer} />
      <Stack.Screen name="BookingDetails" component={BookingDetailsContainer} />
      <Stack.Screen name="WriteReview" component={WriteReviewContainer} />
      <Stack.Screen name="ViewPhotos" component={ViewPhotosContainer} />
      <Stack.Screen name="MyPosts" component={MyPostsContainer} />
      <Stack.Screen name="Reviews" component={ReviewsContainer} />
      <Stack.Screen name="ReviewDetails" component={ReviewDetailsContainer} />
      <Stack.Screen name="ReviewPhotos" component={ReviewPhotosContainer} />
      <Stack.Screen name="CommunityDetails" component={CommunityDetailsContainer} />
      <Stack.Screen name="BookingCalendar" component={BookingCalendarContainer} />
      <Stack.Screen name="MyReviews" component={MyReviewsContainer} />
      <Stack.Screen name="PortfolioOnboarding" component={PortfolioOnboardingContainer} />
    </Stack.Navigator>
  )
}