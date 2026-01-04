import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PhotographerReviewItem } from '@/api/photographers.ts';
import { MyReviewItem } from '@/api/reviews.ts';
import { BookingRequestOption } from '@/api/bookings.ts';

export type BookingRequestParams = {
  photographerId: string;
  productId: number;
  options: BookingRequestOption[];
  shootingDate: string; // ISO date-time string
  startTime: string; // HH:mm format
};

// Root Stack
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
}

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  UserOnboarding: undefined;
}

// Main Stack
export type MainStackParamList = {
  Home: undefined;

  // Home
  SearchPhotographer: { searchKey: string };
  PhotographerDetails: { photographerId: string };
  AIRecommdationForm: undefined;
  AIRecommdationResult: { prompt: string; resultCount?: number };
  PostDetail: { postId: number, profileImageURI: string };

  // Community
  CommunityDetails: { postId: number };
  MyPosts: undefined;

  // Chat
  ChatDetails: {
    roomId: number;
    opponentNickname?: string;
    opponentProfileImageURI?: string;
  };

  // Reservation
  BookingHistory: undefined;
  BookingDetails: { bookingId: number };
  Booking: { photographerId: string };
  BookingRequest: BookingRequestParams;
  BookingReject: { bookingId: number };
  BookingCancel: { bookingId: number };
  BookingManage: undefined;

  // Review
  Reviews: { photographerId: string };
  ReviewDetails: { review: PhotographerReviewItem | MyReviewItem };
  ReviewPhotos: { photographerId: string };
  WriteReview: { bookingId?: number; review?: MyReviewItem };
  ViewPhotos: { bookingId: number };
  MyReviews: undefined;

  // Profile
  NicknameEdit: undefined;
  EmailEdit: undefined;
  AccountManage: undefined;

  // For Photographer
  PortfolioOnboarding: undefined;
  PortfolioForm: undefined;
  ShootingManage: undefined;
  ServiceForm: { productId?: number };
  HolidayManage: undefined;
  ScheduleForm: undefined;

  // Notification
  Notification: undefined;
  NotificationSetting: undefined;

  // etc
  OpenSourceLicense: undefined;
};

// Navigation Props
export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type MainNavigationProp = NativeStackNavigationProp<MainStackParamList>;
