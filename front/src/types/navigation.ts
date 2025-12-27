import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BookingFormData } from '@/screens/user/Booking/BookingContainer.tsx';

// Root Stack
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
}

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  SelectType: undefined;
  UserOnboarding: undefined;
}

// Main Stack
export type MainStackParamList = {
  Home: undefined;

  // Home
  SearchPhotographer: { searchKey: string };
  PhotographerDetails: { photographerId: string };
  PostDetail: { postId: number };

  // Community
  CommunityDetails: { postId: string };
  MyPosts: undefined;

  // Chat
  ChatDetails: { chatRoomId: number, opponentId: string, profileImageURI: string };

  // Reservation
  BookingHistory: undefined;
  BookingDetails: { reservationId: number };
  Booking: { photographerId: string };
  BookingRequest: BookingFormData;

  // Review
  Reviews: { photographerId: string };
  ReviewDetails: { reviewId: number };
  ReviewPhotos: { photographerId: string };
  WriteReview: { reservationId: number };
  ViewPhotos: { reservationId: number };
  MyReviews: undefined;

  // Profile
  NicknameEdit: undefined;
  EmailEdit: undefined;
  AccountManage: undefined;

  // For Photographer
  PortfolioOnboarding: undefined;
  BookingCalendar: undefined;
  ShootingManage: undefined;

  // etc
  Notification: undefined;
};

// Navigation Props
export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type MainNavigationProp = NativeStackNavigationProp<MainStackParamList>;
