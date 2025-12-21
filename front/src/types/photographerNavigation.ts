import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type PhotographerMainStackParamList = {
  BookingHistory: undefined;
  BookingDetails: { id: string };
  ViewPhotos: { id: string };
  PortfolioOnboarding: { id: string };
};

export type PhotographerMainNavigationProp = NativeStackNavigationProp<PhotographerMainStackParamList>;
