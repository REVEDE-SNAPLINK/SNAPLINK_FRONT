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
  region: string; // City name
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
  PhotographerDetails: { photographerId: string; source?: string };
  AIRecommdationForm: undefined;
  AIRecommdationResult: { prompt: string; resultCount?: number };
  PostDetail: { postId: number; profileImageURI: string; photographerId?: string; source?: string };

  // Community
  CommunityDetails: { postId: number; source?: string };
  MyPosts: undefined;

  // Chat
  ChatDetails: {
    roomId: number;
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
  ReviewDetails: { review?: PhotographerReviewItem | MyReviewItem; bookingId?: number };
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
  PortfolioForm: { postId?: number };
  ShootingManage: undefined;
  ServiceForm: { productId?: number };
  ScheduleForm: undefined;
  EditProfile: {
    description: string;
    profileImageURI: string;
    onSubmit?: (description: string) => void;
  };
  EditRegion: {
    regionIds: number[];
    onSubmit?: (regionIds: number[]) => void;
  };
  EditConceptTag: {
    tagIds: number[];
    conceptIds: number[];
    onSubmit?: (tagIds: number[], conceptIds: number[]) => void;
  };

  // Notification
  Notification: undefined;
  NotificationSetting: undefined;
  Notice: undefined;
  NoticeDetail: { noticeId: number };
  FAQ: undefined;

  // etc
  Legal: undefined;
  OpenSourceLicense: undefined;
  BlockManage: undefined;
};

// Navigation Props
export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type MainNavigationProp = NativeStackNavigationProp<MainStackParamList>;
