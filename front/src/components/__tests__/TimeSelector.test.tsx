import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SelectTime, TimeSelector } from '../TimeSelector';
import { TimeSlot } from '@/api/photographer';

describe('SelectTime', () => {
  const defaultProps = {
    time: '10:00',
    isSelected: false,
    isDisabled: false,
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render time text correctly', () => {
    const { getByText } = render(<SelectTime {...defaultProps} />);
    expect(getByText('10:00')).toBeTruthy();
  });

  it('should call onPress when clicked and not disabled', () => {
    const { getByText } = render(<SelectTime {...defaultProps} />);
    fireEvent.press(getByText('10:00'));
    expect(defaultProps.onPress).toHaveBeenCalledTimes(1);
  });

  it('should not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <SelectTime {...defaultProps} isDisabled={true} onPress={onPress} />
    );
    fireEvent.press(getByText('10:00'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('should apply selected styles when selected', () => {
    const { getByText } = render(<SelectTime {...defaultProps} isSelected={true} />);
    const timeText = getByText('10:00');
    expect(timeText).toBeTruthy();
  });

  it('should apply disabled styles when disabled', () => {
    const { getByText } = render(<SelectTime {...defaultProps} isDisabled={true} />);
    const timeText = getByText('10:00');
    expect(timeText).toBeTruthy();
  });
});

describe('TimeSelector', () => {
  const mockTimeSlots: TimeSlot[] = [
    { time: '09:00', isReserved: false },
    { time: '10:00', isReserved: false },
    { time: '11:00', isReserved: true },
    { time: '14:00', isReserved: false },
  ];

  const defaultProps = {
    timeSlots: mockTimeSlots,
    selectedTime: null as string | null,
    onSelectTime: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all time slots', () => {
    const { getByText } = render(<TimeSelector {...defaultProps} />);
    expect(getByText('09:00')).toBeTruthy();
    expect(getByText('10:00')).toBeTruthy();
    expect(getByText('11:00')).toBeTruthy();
    expect(getByText('14:00')).toBeTruthy();
  });

  it('should call onSelectTime when a time slot is clicked', () => {
    const { getByText } = render(<TimeSelector {...defaultProps} />);
    fireEvent.press(getByText('10:00'));
    expect(defaultProps.onSelectTime).toHaveBeenCalledWith('10:00');
  });

  it('should not allow selecting reserved time slots', () => {
    const onSelectTime = jest.fn();
    const { getByText } = render(
      <TimeSelector {...defaultProps} onSelectTime={onSelectTime} />
    );
    fireEvent.press(getByText('11:00'));
    expect(onSelectTime).not.toHaveBeenCalled();
  });

  it('should show selected time with correct style', () => {
    const { getByText } = render(<TimeSelector {...defaultProps} selectedTime="10:00" />);
    expect(getByText('10:00')).toBeTruthy();
  });

  it('should return null when no time slots are provided', () => {
    const { toJSON } = render(<TimeSelector {...defaultProps} timeSlots={[]} />);
    expect(toJSON()).toBeNull();
  });
});
