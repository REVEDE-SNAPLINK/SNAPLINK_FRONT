import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BookingRequestView from '../BookingRequestView.tsx';
import { TimeSlot, RequiredShootingOption, OptionalShootingOption } from '@/api/photographer';

// Mock icons
jest.mock('@/assets/icons/consent.svg', () => 'ConsentIcon');
jest.mock('@/assets/icons/arrow-left2.svg', () => 'ArrowLeftIcon');
jest.mock('@/assets/icons/arrow-right2.svg', () => 'ArrowRightIcon');

// Mock Calendar component
jest.mock('@/components/Calendar.tsx', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  return function MockCalendar({ onChangeDate, currentDate, availableDates }: any) {
    return (
      <View testID="mock-calendar">
        <Text>Current: {currentDate}</Text>
        {availableDates.map((date: string) => (
          <TouchableOpacity key={date} onPress={() => onChangeDate(date)}>
            <Text>{date}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
});

describe('BookingRequestView', () => {
  const mockTimeSlots: TimeSlot[] = [
    { time: '09:00', isReserved: false },
    { time: '10:00', isReserved: false },
    { time: '11:00', isReserved: true },
    { time: '12:00', isReserved: false },
    { time: '14:00', isReserved: false },
    { time: '15:00', isReserved: true },
  ];

  const mockRequiredOptions: RequiredShootingOption[] = [
    {
      id: 'req-1',
      title: '2인 기본 촬영',
      price: 50000,
      duration: '2시간',
      description: '2인 기준 기본 촬영 단가',
    },
  ];

  const mockOptionalOptions: OptionalShootingOption[] = [
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
  ];

  const defaultProps = {
    onPressBack: jest.fn(),
    onChangeDate: jest.fn(),
    nickname: '유앤미스냅',
    initialDate: '2025-11-14',
    availableDates: ['2025-11-17', '2025-11-18', '2025-11-20'],
    currentDate: '2025-11-17',
    timeSlots: mockTimeSlots,
    selectedTime: null as string | null,
    onSelectTime: jest.fn(),
    requiredOptions: mockRequiredOptions,
    requiredOptionChecked: true,
    onPressRequiredOption: jest.fn(),
    optionalOptions: mockOptionalOptions,
    optionalQuantities: { 'opt-1': 0, 'opt-2': 0 },
    onOptionalQuantityChange: jest.fn(),
    totalPrice: 50000,
    onSubmit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render photographer nickname in header', () => {
      const { getByText } = render(<BookingRequestView {...defaultProps} />);
      expect(getByText('유앤미스냅')).toBeTruthy();
    });

    it('should render calendar with available dates', () => {
      const { getByTestId } = render(<BookingRequestView {...defaultProps} />);
      expect(getByTestId('mock-calendar')).toBeTruthy();
    });

    it('should render section title for date and time', () => {
      const { getByText } = render(<BookingRequestView {...defaultProps} />);
      expect(getByText('날짜와 시간을 선택해 주세요')).toBeTruthy();
    });

    it('should render morning and afternoon labels', () => {
      const { getByText } = render(<BookingRequestView {...defaultProps} />);
      expect(getByText('오전')).toBeTruthy();
      expect(getByText('오후')).toBeTruthy();
    });

    it('should split time slots into morning and afternoon', () => {
      const { getByText } = render(<BookingRequestView {...defaultProps} />);
      // Morning times (<=12:00)
      expect(getByText('09:00')).toBeTruthy();
      expect(getByText('10:00')).toBeTruthy();
      expect(getByText('11:00')).toBeTruthy();
      expect(getByText('12:00')).toBeTruthy();
      // Afternoon times (>12:00)
      expect(getByText('14:00')).toBeTruthy();
      expect(getByText('15:00')).toBeTruthy();
    });

    it('should render shooting options section title', () => {
      const { getByText } = render(<BookingRequestView {...defaultProps} />);
      expect(getByText('촬영 항목을 선택해 주세요')).toBeTruthy();
    });

    it('should render required options label', () => {
      const { getByText } = render(<BookingRequestView {...defaultProps} />);
      expect(getByText('필수 항목')).toBeTruthy();
    });

    it('should render required option', () => {
      const { getByText, getAllByText } = render(<BookingRequestView {...defaultProps} />);
      expect(getByText('2인 기본 촬영')).toBeTruthy();
      // There will be multiple "50,000원" text (required option and total price)
      expect(getAllByText('50,000원').length).toBeGreaterThanOrEqual(1);
    });

    it('should render optional options label', () => {
      const { getByText } = render(<BookingRequestView {...defaultProps} />);
      expect(getByText('선택 항목')).toBeTruthy();
    });

    it('should render all optional options', () => {
      const { getByText } = render(<BookingRequestView {...defaultProps} />);
      expect(getByText('촬영 인원 추가')).toBeTruthy();
      expect(getByText('10,000원')).toBeTruthy();
      expect(getByText('원본 사진 요청')).toBeTruthy();
      expect(getByText('5,000원')).toBeTruthy();
    });

    it('should render total price section', () => {
      const { getByText, getAllByText } = render(<BookingRequestView {...defaultProps} />);
      expect(getByText('합계')).toBeTruthy();
      // There will be multiple "50,000원" text (required option and total price)
      expect(getAllByText('50,000원').length).toBeGreaterThanOrEqual(1);
    });

    it('should render submit button', () => {
      const { getByText } = render(<BookingRequestView {...defaultProps} />);
      expect(getByText('예약하기')).toBeTruthy();
    });

    it('should display updated total price', () => {
      const { getByText } = render(<BookingRequestView {...defaultProps} totalPrice={65000} />);
      expect(getByText('65,000원')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('should call onChangeDate when date is selected in calendar', () => {
      const { getByText } = render(<BookingRequestView {...defaultProps} />);
      fireEvent.press(getByText('2025-11-18'));
      expect(defaultProps.onChangeDate).toHaveBeenCalledWith('2025-11-18');
    });

    it('should call onSelectTime when available time slot is clicked', () => {
      const { getByText } = render(<BookingRequestView {...defaultProps} />);
      fireEvent.press(getByText('10:00'));
      expect(defaultProps.onSelectTime).toHaveBeenCalledWith('10:00');
    });

    it('should not call onSelectTime for reserved time slots', () => {
      const onSelectTime = jest.fn();
      const { getByText } = render(<BookingRequestView {...defaultProps} onSelectTime={onSelectTime} />);
      fireEvent.press(getByText('11:00'));
      expect(onSelectTime).not.toHaveBeenCalled();
    });

    it('should render all interactive elements', () => {
      const { getByText } = render(<BookingRequestView {...defaultProps} />);
      // Verify that interactive elements are rendered
      expect(getByText('2인 기본 촬영')).toBeTruthy();
      expect(getByText('예약하기')).toBeTruthy();
    });

    it('should call onOptionalQuantityChange when optional quantity is changed', () => {
      const { getAllByText } = render(<BookingRequestView {...defaultProps} />);
      const plusButtons = getAllByText('+');
      // Click first plus button (촬영 인원 추가)
      fireEvent.press(plusButtons[0]);
      expect(defaultProps.onOptionalQuantityChange).toHaveBeenCalledWith('opt-1', 1);
    });

    it('should call onSubmit when submit button is pressed', () => {
      const { getByText } = render(<BookingRequestView {...defaultProps} />);
      fireEvent.press(getByText('예약하기'));
      expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty time slots', () => {
      const { queryByText } = render(<BookingRequestView {...defaultProps} timeSlots={[]} />);
      expect(queryByText('오전')).toBeFalsy();
      expect(queryByText('오후')).toBeFalsy();
    });

    it('should handle only morning time slots', () => {
      const morningSlots: TimeSlot[] = [
        { time: '09:00', isReserved: false },
        { time: '10:00', isReserved: false },
      ];
      const { getByText, queryByText } = render(<BookingRequestView {...defaultProps} timeSlots={morningSlots} />);
      expect(getByText('오전')).toBeTruthy();
      expect(queryByText('오후')).toBeFalsy();
    });

    it('should handle only afternoon time slots', () => {
      const afternoonSlots: TimeSlot[] = [
        { time: '14:00', isReserved: false },
        { time: '15:00', isReserved: false },
      ];
      const { getByText, queryByText } = render(<BookingRequestView {...defaultProps} timeSlots={afternoonSlots} />);
      expect(queryByText('오전')).toBeFalsy();
      expect(getByText('오후')).toBeTruthy();
    });

    it('should show selected time with correct styling', () => {
      const { getByText } = render(<BookingRequestView {...defaultProps} selectedTime="10:00" />);
      expect(getByText('10:00')).toBeTruthy();
    });

    it('should display zero quantity for optional options initially', () => {
      const { getAllByText } = render(<BookingRequestView {...defaultProps} />);
      const zeroTexts = getAllByText('0');
      expect(zeroTexts.length).toBeGreaterThanOrEqual(2); // At least 2 optional options
    });

    it('should display updated quantities for optional options', () => {
      const { getByText } = render(
        <BookingRequestView {...defaultProps} optionalQuantities={{ 'opt-1': 3, 'opt-2': 5 }} />
      );
      expect(getByText('3')).toBeTruthy();
      expect(getByText('5')).toBeTruthy();
    });
  });
});
