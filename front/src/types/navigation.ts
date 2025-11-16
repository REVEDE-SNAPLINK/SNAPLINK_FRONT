import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Root Stack
export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
}

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  SelectType: undefined;
  ApplyPhotographer: undefined;
}

// Main Stack
export type MainStackParamList = {
  Home: undefined;
  SearchPhotographer: { searchKey: string };
  PhotographerDetails: { id: string };
  Booking: { id: string };
  BookingHistory: undefined;
}

// Onboarding Stack
export type OnboardingStackParamList = {
  OnboardingMain: undefined;
}

// Navigation Props
export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type MainNavigationProp = NativeStackNavigationProp<MainStackParamList>;
export type OnboardingNavigationProp = NativeStackNavigationProp<OnboardingStackParamList>;
