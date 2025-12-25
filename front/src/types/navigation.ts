import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UserMainStackParamList } from '@/types/userNavigation';
import { PhotographerMainStackParamList } from '@/types/photographerNavigation';

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
export type MainStackParamList = UserMainStackParamList & PhotographerMainStackParamList & {
  Home: undefined;
  NicknameEdit: undefined;
  NameEdit: undefined;
  EmailEdit: undefined;
  AccountManage: undefined;
  SearchPhotographer: { searchKey: string };
  PhotographerDetails: { id: string };
  PostDetail: { postId: string };
  ChatDetails: { chatRoomId: string };
  MyPosts: undefined;
  Reviews: { photographerId: string };
  ReviewDetails: { reviewId: string };
  ReviewPhotos: { photographerId: string };
  CommunityDetails: { postId: string };
  Notification: undefined;
};

// Navigation Props
export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type MainNavigationProp = NativeStackNavigationProp<MainStackParamList>;
