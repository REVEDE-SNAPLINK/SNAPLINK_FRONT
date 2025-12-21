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
  UserOnboarding: { type: 'user' | 'photographer' };
  ApplyPhotographer: undefined;
}

// Main Stack
export type MainStackParamList = UserMainStackParamList & PhotographerMainStackParamList;

// Navigation Props
export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type MainNavigationProp = NativeStackNavigationProp<MainStackParamList>;
