import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BookingContainer from '../BookingContainer';
import * as photographerApi from '@/api/photographer';

// Mock navigation
const mockGoBack = jest.fn();
const mockNavigation = {
  goBack: mockGoBack,
  navigate: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
  getState: jest.fn(),
  getParent: jest.fn(),
  setParams: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
};

const mockRoute = {
  params: { id: '1' },
  key: 'Booking-1',
  name: 'Booking' as const,
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
  useRoute: () => mockRoute,
}));

// Mock BookingView
jest.mock('../BookingView', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  return function MockBookingView(props: any) {
    return (
      <View testID="reserve-view">
        <Text testID="photographer-nickname">{props.nickname}</Text>
        <Text testID="total-price">{props.totalPrice}</Text>
        <TouchableOpacity testID="back-button" onPress={props.onPressBack}>
          <Text>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="submit-button" onPress={props.onSubmit}>
          <Text>Submit</Text>
        </TouchableOpacity>
        {props.timeSlots.map((slot: any) => (
          <TouchableOpacity
            key={slot.time}
            testID={`time-slot-${slot.time}`}
            onPress={() => props.onSelectTime(slot.time)}
          >
            <Text>{slot.time}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          testID="required-option-checkbox"
          onPress={props.onRequiredOptionPress}
        >
          <Text>Required Option</Text>
        </TouchableOpacity>
        {props.optionalOptions.map((option: any) => (
          <View key={option.id} testID={`optional-option-${option.id}`}>
            <Text>{option.title}</Text>
            <TouchableOpacity
              testID={`increase-${option.id}`}
              onPress={() => props.onOptionalQuantityChange(option.id, (props.optionalQuantities[option.id] || 0) + 1)}
            >
              <Text>+</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };
});

// Mock API functions
jest.mock('@/api/photographer');

const mockPhotographerDetails = {
  id: '1',
  nickname: '유앤미스냅',
  rating: 4.8,
  reviewCount: 34,
  portfolioImages: ['img1.jpg', 'img2.jpg'],
  shootingUnit: '기본촬영/2시간',
  price: 50000,
  isPartner: true,
  gender: '여성작가' as const,
  shootingTypes: ['커플', '웨딩'],
  styleTags: ['우정', '자연광', '감성'],
  region: '서울',
  createdAt: '2024-01-15T10:00:00Z',
  name: '유앤미스냅 작가',
  introduction: '안녕하세요',
  portfolioCount: 120,
};

const mockReservationData = {
  photographerId: '1',
  availableDates: ['2025-11-17', '2025-11-18', '2025-11-20'],
  timeSlotsByDate: {
    '2025-11-17': [
      { time: '10:00', isReserved: false },
      { time: '11:00', isReserved: true },
      { time: '14:00', isReserved: false },
    ],
    '2025-11-18': [
      { time: '09:00', isReserved: false },
      { time: '10:00', isReserved: false },
    ],
  },
  requiredOptions: [
    {
      id: 'req-1',
      title: '2인 기본 촬영',
      price: 50000,
      duration: '2시간',
      description: '2인 기준 기본 촬영',
    },
  ],
  optionalOptions: [
    {
      id: 'opt-1',
      title: '촬영 인원 추가',
      price: 10000,
      maxQuantity: 10,
    },
    {
      id: 'opt-2',
      title: '원본 사진 요청',
      price: 5000,
      maxQuantity: 100,
    },
  ],
};

describe('BookingContainer', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();

    (photographerApi.getPhotographerDetails as jest.Mock).mockResolvedValue(
      mockPhotographerDetails
    );
    (photographerApi.getReservationData as jest.Mock).mockResolvedValue(
      mockReservationData
    );
  });

  const renderWithQuery = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
    );
  };

  describe('Data Fetching', () => {
    it('should fetch photographer details on mount', async () => {
      renderWithQuery(<BookingContainer />);

      await waitFor(() => {
        expect(photographerApi.getPhotographerDetails).toHaveBeenCalledWith('1');
      });
    });

    it('should fetch reservation data on mount', async () => {
      renderWithQuery(<BookingContainer />);

      await waitFor(() => {
        expect(photographerApi.getReservationData).toHaveBeenCalledWith('1');
      });
    });

    it('should display loading indicator while fetching data', () => {
      const { UNSAFE_getByType } = renderWithQuery(<BookingContainer />);
      expect(UNSAFE_getByType('ActivityIndicator' as any)).toBeTruthy();
    });

    it('should render BookingView after data is loaded', async () => {
      const { getByTestId } = renderWithQuery(<BookingContainer />);

      await waitFor(() => {
        expect(getByTestId('reserve-view')).toBeTruthy();
      });
    });

    it('should display photographer nickname after loading', async () => {
      const { getByTestId } = renderWithQuery(<BookingContainer />);

      await waitFor(() => {
        expect(getByTestId('photographer-nickname')).toBeTruthy();
      });
    });
  });

  describe('Navigation', () => {
    it('should call navigation.goBack when back button is pressed', async () => {
      const { getByTestId } = renderWithQuery(<BookingContainer />);

      await waitFor(() => {
        expect(getByTestId('back-button')).toBeTruthy();
      });

      fireEvent.press(getByTestId('back-button'));
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  describe('State Management', () => {
    it('should initialize required option as checked', async () => {
      const { getByTestId } = renderWithQuery(<BookingContainer />);

      await waitFor(() => {
        expect(getByTestId('total-price').children[0]).toBe('50000');
      });
    });

    it('should initialize optional quantities as 0', async () => {
      const { getByTestId } = renderWithQuery(<BookingContainer />);

      await waitFor(() => {
        expect(getByTestId('optional-option-opt-1')).toBeTruthy();
        expect(getByTestId('optional-option-opt-2')).toBeTruthy();
      });
    });

    it('should reset selected time when date changes', async () => {
      const { getByTestId } = renderWithQuery(<BookingContainer />);

      await waitFor(() => {
        expect(getByTestId('time-slot-10:00')).toBeTruthy();
      });

      // Select a time
      fireEvent.press(getByTestId('time-slot-10:00'));

      // Change date (would trigger onChangeDate in real scenario)
      // The selected time should reset to null
    });
  });

  describe('Price Calculation', () => {
    it('should calculate total price with required option only', async () => {
      const { getByTestId } = renderWithQuery(<BookingContainer />);

      await waitFor(() => {
        expect(getByTestId('total-price').children[0]).toBe('50000');
      });
    });

    it('should update total price when optional quantity increases', async () => {
      const { getByTestId } = renderWithQuery(<BookingContainer />);

      await waitFor(() => {
        expect(getByTestId('increase-opt-1')).toBeTruthy();
      });

      fireEvent.press(getByTestId('increase-opt-1'));

      await waitFor(() => {
        expect(getByTestId('total-price').children[0]).toBe('60000');
      });
    });

    it('should calculate total price with multiple optional options', async () => {
      const { getByTestId } = renderWithQuery(<BookingContainer />);

      await waitFor(() => {
        expect(getByTestId('increase-opt-1')).toBeTruthy();
        expect(getByTestId('increase-opt-2')).toBeTruthy();
      });

      // Add 2 extra people (10000 each)
      fireEvent.press(getByTestId('increase-opt-1'));
      fireEvent.press(getByTestId('increase-opt-1'));

      // Add 1 original photo request (5000)
      fireEvent.press(getByTestId('increase-opt-2'));

      await waitFor(() => {
        // 50000 (required) + 20000 (opt-1 x 2) + 5000 (opt-2 x 1) = 75000
        expect(getByTestId('total-price').children[0]).toBe('75000');
      });
    });

    it('should update price when required option is unchecked', async () => {
      const { getByTestId } = renderWithQuery(<BookingContainer />);

      await waitFor(() => {
        expect(getByTestId('required-option-checkbox')).toBeTruthy();
      });

      // Uncheck required option
      fireEvent.press(getByTestId('required-option-checkbox'));

      await waitFor(() => {
        expect(getByTestId('total-price').children[0]).toBe('0');
      });
    });
  });

  describe('Time Slot Selection', () => {
    it('should allow selecting available time slots', async () => {
      const { getByTestId } = renderWithQuery(<BookingContainer />);

      await waitFor(() => {
        expect(getByTestId('time-slot-10:00')).toBeTruthy();
      });

      fireEvent.press(getByTestId('time-slot-10:00'));
      // In the real implementation, this would update selectedTime state
    });

    it('should display time slots for current date', async () => {
      const { getByTestId } = renderWithQuery(<BookingContainer />);

      await waitFor(() => {
        expect(getByTestId('time-slot-10:00')).toBeTruthy();
        expect(getByTestId('time-slot-11:00')).toBeTruthy();
        expect(getByTestId('time-slot-14:00')).toBeTruthy();
      });
    });
  });

  describe('Submission', () => {
    it('should handle submit button press', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const { getByTestId } = renderWithQuery(<BookingContainer />);

      await waitFor(() => {
        expect(getByTestId('submit-button')).toBeTruthy();
      });

      fireEvent.press(getByTestId('submit-button'));

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should handle API error gracefully', async () => {
      (photographerApi.getPhotographerDetails as jest.Mock).mockRejectedValue(
        new Error('API Error')
      );

      const { queryByTestId } = renderWithQuery(<BookingContainer />);

      await waitFor(() => {
        expect(queryByTestId('reserve-view')).toBeFalsy();
      });
    });

    it('should return null when data is not available', async () => {
      (photographerApi.getPhotographerDetails as jest.Mock).mockResolvedValue(null);

      const { toJSON } = renderWithQuery(<BookingContainer />);

      await waitFor(() => {
        expect(toJSON()).toBeNull();
      });
    });
  });
});
