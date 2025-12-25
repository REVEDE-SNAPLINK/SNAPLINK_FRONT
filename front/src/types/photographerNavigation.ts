import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type PhotographerMainStackParamList = {
  PortfolioOnboarding: undefined;
  BookingHistory: undefined;
  BookingDetails: { reservationId: number };
  ViewPhotos: { reservationId: number };
  BookingCalendar: undefined;
};

export type PhotographerMainNavigationProp = NativeStackNavigationProp<PhotographerMainStackParamList>;
