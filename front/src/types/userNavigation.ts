import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export interface BookingFormData {
  photographerId: string;
  photographerNickname: string;
  date: string;
  time: string;
  requiredOptionId: string;
  requiredOptionChecked: boolean;
  optionalOptions: Record<string, number>;
  totalPrice: number;
}

export type UserMainStackParamList = {
  Booking: { photographerId: string };
  BookingHistory: undefined;
  BookingDetails: { reservationId: number };
  BookingRequest: BookingFormData;
  WriteReview: { reservationId: number };
  ViewPhotos: { reservationId: number };
  MyReviews: undefined;
};

export type UserMainNavigationProp = NativeStackNavigationProp<UserMainStackParamList>;
