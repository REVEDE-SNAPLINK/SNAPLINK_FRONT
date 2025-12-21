import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type PhotographerMainStackParamList = {
  Home: undefined;
  BookingHistory: undefined;
  BookingDetails: { id: string };
  ViewPhotos: { id: string };
};

export type PhotographerMainNavigationProp = NativeStackNavigationProp<PhotographerMainStackParamList>;
