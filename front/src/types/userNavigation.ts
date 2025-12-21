import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type UserMainStackParamList = {
  SearchPhotographer: { searchKey: string };
  PhotographerDetails: { id: string };
  Booking: { id: string };
  BookingHistory: undefined;
  BookingDetails: { id: string };
  WriteReview: { id: string };
  ViewPhotos: { id: string };
};

export type UserMainNavigationProp = NativeStackNavigationProp<UserMainStackParamList>;
