import { ReservationStatus } from '@/api/reservations';

/**
 * Photo type for booking photos
 */
export interface Photo {
  id: string;
  url: string;
  type: 'original' | 'edited';
}

/**
 * Booking form data for creating a reservation
 */
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

/**
 * Booking details response
 */
export interface BookingDetails {
  id: string;
  photographerId: string;
  photographerNickname: string;
  photographerName: string;
  userId?: string;
  userNickname?: string;
  userName?: string;
  requiredOption: string;
  bookingDate: string;
  bookingTime: string;
  additionalRequest: string;
  status: ReservationStatus;
  photos?: Photo[];
}

/**
 * Booking photos response
 */
export interface BookingPhotosResponse {
  bookingId: string;
  photos: Photo[];
  zipUrl?: string;
}
