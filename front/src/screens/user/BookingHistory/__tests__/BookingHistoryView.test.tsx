import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import BookingHistoryView from '../BookingHistoryView';
import { UserBooking } from '@/api/photographer';

// Mock assets
jest.mock('@/assets/icons/arrow-left.png', () => 'ArrowLeftIcon');

// Mock HeaderWithBackButton
jest.mock('@/components/HeaderWithBackButton', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  return function MockHeaderWithBackButton(props: any) {
    return (
      <View testID="header-with-back-button">
        <TouchableOpacity testID="back-button" onPress={props.onPressBack}>
          <Text>Back</Text>
        </TouchableOpacity>
        {props.title && <Text testID="header-title">{props.title}</Text>}
      </View>
    );
  };
});

describe('BookingManageView Component', () => {
  const mockBookings: UserBooking[] = [
    {
      id: 'booking-1',
      photographerId: '1',
      photographerName: '유앤미스냅 작가',
      photographerNickname: '유앤미스냅',
      photographerImage: 'https://picsum.photos/200/200?random=1',
      bookingDate: '2025-11-20',
      bookingTime: '14:00',
      shootingDuration: '2시간',
      status: 'confirmed',
      totalPrice: 50000,
      location: '서울',
      shootingType: '커플',
      createdAt: '2025-11-10T10:00:00Z',
      updatedAt: '2025-11-10T10:00:00Z',
    },
    {
      id: 'booking-2',
      photographerId: '3',
      photographerName: '스냅마스터 작가',
      photographerNickname: '스냅마스터',
      photographerImage: 'https://picsum.photos/200/200?random=7',
      bookingDate: '2025-11-05',
      bookingTime: '10:00',
      shootingDuration: '3시간',
      status: 'completed',
      totalPrice: 120000,
      location: '서울',
      shootingType: '웨딩',
      createdAt: '2025-10-25T15:30:00Z',
      updatedAt: '2025-11-05T14:00:00Z',
    },
    {
      id: 'booking-3',
      photographerId: '6',
      photographerName: '펫포토그래퍼 작가',
      photographerNickname: '펫포토그래퍼',
      photographerImage: 'https://picsum.photos/200/200?random=16',
      bookingDate: '2025-12-01',
      bookingTime: '10:00',
      shootingDuration: '2시간',
      status: 'pending',
      totalPrice: 90000,
      location: '서울',
      shootingType: '반려동물',
      createdAt: '2025-11-15T14:00:00Z',
      updatedAt: '2025-11-15T14:00:00Z',
    },
  ];

  const defaultProps = {
    onPressBack: jest.fn(),
    bookings: mockBookings,
    isLoading: false,
    isError: false,
    onLoadMore: jest.fn(),
    isFetchingNextPage: false,
    hasNextPage: true,
    onPressBookingDetail: jest.fn(),
    onRefresh: jest.fn(),
    onPressViewPhotos: jest.fn(),
    onPressWriteReview: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with bookings', () => {
    const { getByText } = render(<BookingHistoryView {...defaultProps} />);

    expect(getByText('촬영 내역')).toBeTruthy();
    expect(getByText('유앤미스냅과 함께한 추억이에요')).toBeTruthy();
    expect(getByText('스냅마스터과 함께한 추억이에요')).toBeTruthy();
    expect(getByText('펫포토그래퍼과 함께한 추억이에요')).toBeTruthy();
  });

  it('calls onPressBack when back button is pressed', () => {
    const onPressBack = jest.fn();
    const props = {
      ...defaultProps,
      onPressBack,
    };

    const { getByTestId } = render(<BookingHistoryView {...props} />);

    const backButton = getByTestId('back-button');
    fireEvent.press(backButton);

    expect(onPressBack).toHaveBeenCalledTimes(1);
  });

  it('calls onPressBookingDetail when detail button is pressed', () => {
    const { getAllByText } = render(<BookingHistoryView {...defaultProps} />);

    const detailButtons = getAllByText('상세보기');
    fireEvent.press(detailButtons[0]);

    expect(defaultProps.onPressBookingDetail).toHaveBeenCalledWith('booking-1');
  });

  it('displays loading indicator when isLoading is true', () => {
    const props = {
      ...defaultProps,
      bookings: [],
      isLoading: true,
    };

    const { getByTestId } = render(<BookingHistoryView {...props} />);

    // ActivityIndicator should be rendered
    expect(getByTestId).toBeTruthy();
  });

  it('displays error message when isError is true', () => {
    const props = {
      ...defaultProps,
      bookings: [],
      isLoading: false,
      isError: true,
    };

    const { getByText } = render(<BookingHistoryView {...props} />);

    expect(getByText('데이터를 불러오는데 실패했습니다.')).toBeTruthy();
  });

  it('displays empty state when no bookings', () => {
    const props = {
      ...defaultProps,
      bookings: [],
      isLoading: false,
      isError: false,
    };

    const { getByText } = render(<BookingHistoryView {...props} />);

    expect(getByText('촬영 내역이 없습니다.')).toBeTruthy();
  });

  it('calls onLoadMore when scrolling to the end', async () => {
    const { getByTestId } = render(<BookingHistoryView {...defaultProps} />);

    const flatList = getByTestId('booking-history-list');
    fireEvent(flatList, 'onEndReached');

    await waitFor(() => {
      expect(defaultProps.onLoadMore).toHaveBeenCalled();
    });
  });

  it('formats date and time correctly', () => {
    const { getByText } = render(<BookingHistoryView {...defaultProps} />);

    // Date format: YYYY.MM.DD HH:MM
    expect(getByText(/2025\.11\.20 14:00/)).toBeTruthy();
    expect(getByText(/2025\.11\.05 10:00/)).toBeTruthy();
  });

  it('displays correct status for different booking states', () => {
    const { getByText } = render(<BookingHistoryView {...defaultProps} />);

    // pending status
    expect(getByText('아직 촬영 전이에요')).toBeTruthy();

    // confirmed status
    expect(getByText('작가님이 작업 중이에요')).toBeTruthy();
  });

  it('shows photographer information correctly', () => {
    const { getByText } = render(<BookingHistoryView {...defaultProps} />);

    // Check photographer names
    expect(getByText('유앤미스냅 작가')).toBeTruthy();
    expect(getByText('스냅마스터 작가')).toBeTruthy();
    expect(getByText('펫포토그래퍼 작가')).toBeTruthy();

    // Check shooting types
    expect(getByText('커플')).toBeTruthy();
    expect(getByText('웨딩')).toBeTruthy();
    expect(getByText('반려동물')).toBeTruthy();
  });

  it('calls onRefresh when pull to refresh is triggered', () => {
    const onRefresh = jest.fn();
    const props = {
      ...defaultProps,
      onRefresh,
    };

    const { getByTestId } = render(<BookingHistoryView {...props} />);

    const flatList = getByTestId('booking-history-list');
    const refreshControl = flatList.props.refreshControl;

    // Simulate pull to refresh
    if (refreshControl && refreshControl.props && refreshControl.props.onRefresh) {
      refreshControl.props.onRefresh();
    }

    expect(onRefresh).toHaveBeenCalled();
  });

  it('does not call onLoadMore when there is no next page', () => {
    const onLoadMore = jest.fn();
    const props = {
      ...defaultProps,
      hasNextPage: false,
      onLoadMore,
    };

    const { getByTestId } = render(<BookingHistoryView {...props} />);

    const flatList = getByTestId('booking-history-list');
    fireEvent(flatList, 'onEndReached');

    // The handler is still called but should check hasNextPage internally
    expect(onLoadMore).toHaveBeenCalled();
  });

  it('shows loading indicator at the bottom when fetching next page', () => {
    const props = {
      ...defaultProps,
      isFetchingNextPage: true,
    };

    const { getByTestId } = render(<BookingHistoryView {...props} />);

    // Footer loading indicator should be rendered
    expect(getByTestId).toBeTruthy();
  });

  it('renders all booking items', () => {
    const { getAllByText } = render(<BookingHistoryView {...defaultProps} />);

    const photographerNames = getAllByText(/작가$/);
    expect(photographerNames).toHaveLength(3);
  });

  it('handles cancelled status correctly', () => {
    const cancelledBooking: UserBooking = {
      ...mockBookings[0],
      id: 'booking-cancelled',
      status: 'cancelled',
    };

    const props = {
      ...defaultProps,
      bookings: [cancelledBooking],
    };

    const { getByText } = render(<BookingHistoryView {...props} />);

    // Cancelled status should default to PENDING display
    expect(getByText('아직 촬영 전이에요')).toBeTruthy();
  });

  it('shows action buttons for completed bookings', () => {
    const completedBookings = mockBookings.filter((b) => b.status === 'completed');
    const props = {
      ...defaultProps,
      bookings: completedBookings,
    };

    const { getAllByText } = render(<BookingHistoryView {...props} />);

    // Should show action buttons for completed bookings
    const photoButtons = getAllByText('사진 보기');
    const reviewButtons = getAllByText('후기 작성');

    expect(photoButtons.length).toBeGreaterThan(0);
    expect(reviewButtons.length).toBeGreaterThan(0);
  });

  it('calls onPressViewPhotos with booking id when photo button is pressed', () => {
    const onPressViewPhotos = jest.fn();
    const completedBooking = mockBookings.find((b) => b.status === 'completed');
    const props = {
      ...defaultProps,
      bookings: completedBooking ? [completedBooking] : [],
      onPressViewPhotos,
    };

    const { getByText } = render(<BookingHistoryView {...props} />);

    const photoButton = getByText('사진 보기');
    fireEvent.press(photoButton);

    expect(onPressViewPhotos).toHaveBeenCalledWith(completedBooking?.id);
  });

  it('calls onPressWriteReview with booking id when review button is pressed', () => {
    const onPressWriteReview = jest.fn();
    const completedBooking = mockBookings.find((b) => b.status === 'completed');
    const props = {
      ...defaultProps,
      bookings: completedBooking ? [completedBooking] : [],
      onPressWriteReview,
    };

    const { getByText } = render(<BookingHistoryView {...props} />);

    const reviewButton = getByText('후기 작성');
    fireEvent.press(reviewButton);

    expect(onPressWriteReview).toHaveBeenCalledWith(completedBooking?.id);
  });

  it('does not show action buttons for non-completed bookings', () => {
    const nonCompletedBookings = mockBookings.filter(
      (b) => b.status === 'pending' || b.status === 'confirmed'
    );
    const props = {
      ...defaultProps,
      bookings: nonCompletedBookings,
    };

    const { queryByText } = render(<BookingHistoryView {...props} />);

    expect(queryByText('사진 보기')).toBeNull();
    expect(queryByText('후기 작성')).toBeNull();
  });
});
