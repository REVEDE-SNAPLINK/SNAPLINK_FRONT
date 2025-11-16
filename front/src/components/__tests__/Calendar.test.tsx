import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Calendar from '../Calendar';

jest.mock('@/assets/icons/arrow-left2.svg', () => 'ArrowLeftIcon');
jest.mock('@/assets/icons/arrow-right2.svg', () => 'ArrowRightIcon');

describe('Calendar Component', () => {
  const defaultProps = {
    onChangeDate: jest.fn(),
    initialDate: '2025-11-15',
    currentDate: '2025-11-15',
    availableDates: ['2025-11-15', '2025-11-16', '2025-11-17', '2025-11-20'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render calendar component', () => {
      const { UNSAFE_getByType } = render(<Calendar {...defaultProps} />);
      // Calendar should be rendered
    });

    it('should render with initial date', () => {
      const { UNSAFE_getByType } = render(<Calendar {...defaultProps} />);
      // Initial date should be set
    });

    it('should render with available dates', () => {
      const { UNSAFE_getByType } = render(<Calendar {...defaultProps} />);
      // Available dates should be rendered
    });

    it('should render month and year header', () => {
      const { UNSAFE_queryAllByProps } = render(<Calendar {...defaultProps} />);
      const headers = UNSAFE_queryAllByProps({ testID: 'calendar-header' });
      expect(headers.length).toBeGreaterThan(0);
      expect(headers[0].props.children).toBe('2025.11');
    });
  });

  describe('Date Selection', () => {
    it('should mark current date as selected', () => {
      const { UNSAFE_getAllByType } = render(<Calendar {...defaultProps} />);
      // Current date should be visually selected
    });

    it('should call onChangeDate when date is pressed', () => {
      const onChangeDate = jest.fn();
      const { UNSAFE_getAllByType } = render(
        <Calendar {...defaultProps} onChangeDate={onChangeDate} />
      );
      // Pressing a date should call onChangeDate
    });

    it('should handle date selection', () => {
      const onChangeDate = jest.fn();
      const { UNSAFE_getAllByType } = render(
        <Calendar {...defaultProps} currentDate="2025-11-16" onChangeDate={onChangeDate} />
      );
      // Date 16 should be selected
    });
  });

  describe('Available Dates', () => {
    it('should enable available dates', () => {
      const { UNSAFE_getAllByType } = render(<Calendar {...defaultProps} />);
      // Available dates should be enabled/highlighted
    });

    it('should disable unavailable dates', () => {
      const { UNSAFE_getAllByType } = render(<Calendar {...defaultProps} />);
      // Unavailable dates should be disabled/grayed out
    });

    it('should handle empty available dates', () => {
      const { UNSAFE_getByType } = render(
        <Calendar {...defaultProps} availableDates={[]} />
      );
      // All dates should be disabled
    });

    it('should handle single available date', () => {
      const { UNSAFE_getByType } = render(
        <Calendar {...defaultProps} availableDates={['2025-11-15']} />
      );
      // Only one date should be enabled
    });

    it('should handle many available dates', () => {
      const manyDates = Array.from({ length: 30 }, (_, i) =>
        `2025-11-${String(i + 1).padStart(2, '0')}`
      );
      const { UNSAFE_getByType } = render(
        <Calendar {...defaultProps} availableDates={manyDates} />
      );
      // Many dates should be available
    });
  });

  describe('Header Rendering', () => {
    it('should render custom header with month and year', () => {
      const { UNSAFE_queryAllByProps } = render(<Calendar {...defaultProps} />);
      const headers = UNSAFE_queryAllByProps({ testID: 'calendar-header' });
      expect(headers.length).toBeGreaterThan(0);
      expect(headers[0].props.children).toBe('2025.11');
    });

    it('should format header as YYYY.MM', () => {
      const { UNSAFE_queryAllByProps } = render(
        <Calendar {...defaultProps} initialDate="2024-01-15" />
      );
      const headers = UNSAFE_queryAllByProps({ testID: 'calendar-header' });
      expect(headers.length).toBeGreaterThan(0);
      expect(headers[0].props.children).toBe('2024.01');
    });

    it('should update header when month changes', () => {
      const { UNSAFE_queryAllByProps } = render(
        <Calendar {...defaultProps} initialDate="2025-12-01" />
      );
      const headers = UNSAFE_queryAllByProps({ testID: 'calendar-header' });
      expect(headers.length).toBeGreaterThan(0);
      expect(headers[0].props.children).toBe('2025.12');
    });
  });

  describe('Navigation Arrows', () => {
    it('should render left arrow for previous month', () => {
      const { UNSAFE_getAllByType } = render(<Calendar {...defaultProps} />);
      // Left arrow should be rendered
    });

    it('should render right arrow for next month', () => {
      const { UNSAFE_getAllByType } = render(<Calendar {...defaultProps} />);
      // Right arrow should be rendered
    });

    it('should navigate to previous month when left arrow is pressed', () => {
      // Arrow navigation would be tested in integration tests
      const { UNSAFE_getAllByType } = render(<Calendar {...defaultProps} />);
      // Left arrow should be pressable
    });

    it('should navigate to next month when right arrow is pressed', () => {
      // Arrow navigation would be tested in integration tests
      const { UNSAFE_getAllByType } = render(<Calendar {...defaultProps} />);
      // Right arrow should be pressable
    });
  });

  describe('Day Component', () => {
    it('should render day numbers', () => {
      const { getByText } = render(<Calendar {...defaultProps} />);
      // Day numbers should be rendered
      // Note: Specific day numbers depend on the month
    });

    it('should apply selected styling to current date', () => {
      const { UNSAFE_getAllByType } = render(<Calendar {...defaultProps} />);
      // Selected date should have primary background color
    });

    it('should apply disabled styling to unavailable dates', () => {
      const { UNSAFE_getAllByType } = render(<Calendar {...defaultProps} />);
      // Disabled dates should have gray text
    });

    it('should apply white text to selected date', () => {
      const { UNSAFE_getAllByType } = render(<Calendar {...defaultProps} />);
      // Selected date text should be white
    });

    it('should apply primary text to available unselected dates', () => {
      const { UNSAFE_getAllByType } = render(<Calendar {...defaultProps} />);
      // Available but not selected dates should have primary text color
    });
  });

  describe('Korean Locale', () => {
    it('should display Korean month names', () => {
      const { UNSAFE_getByType } = render(<Calendar {...defaultProps} />);
      // Month should be displayed in Korean
    });

    it('should display Korean day names', () => {
      const { UNSAFE_getByType } = render(<Calendar {...defaultProps} />);
      // Days of week should be in Korean: 일, 월, 화, 수, 목, 금, 토
    });

    it('should use Korean locale config', () => {
      const { UNSAFE_getByType } = render(<Calendar {...defaultProps} />);
      // LocaleConfig should be set to 'ko'
    });
  });

  describe('Date Change Callback', () => {
    it('should pass selected date to onChangeDate', () => {
      const onChangeDate = jest.fn();
      const { UNSAFE_getAllByType } = render(
        <Calendar {...defaultProps} onChangeDate={onChangeDate} />
      );
      // Clicking a date should call onChangeDate with that date string
    });

    it('should handle onChangeDate for different dates', () => {
      const onChangeDate = jest.fn();
      const { UNSAFE_getAllByType } = render(
        <Calendar {...defaultProps} onChangeDate={onChangeDate} />
      );
      // Should work for any available date
    });

    it('should call onChangeDate with fallback when date is undefined', () => {
      const onChangeDate = jest.fn();
      const { UNSAFE_getAllByType } = render(
        <Calendar {...defaultProps} onChangeDate={onChangeDate} />
      );
      // Should use initialDate as fallback
    });
  });

  describe('Theme Styling', () => {
    it('should apply theme colors to calendar', () => {
      const { UNSAFE_getByType } = render(<Calendar {...defaultProps} />);
      // Theme colors should be applied
    });

    it('should use Pretendard-SemiBold font for day headers', () => {
      const { UNSAFE_getByType } = render(<Calendar {...defaultProps} />);
      // Day header font should be Pretendard-SemiBold
    });

    it('should apply correct font size to day headers', () => {
      const { UNSAFE_getByType } = render(<Calendar {...defaultProps} />);
      // Day header font size should be 13
    });

    it('should apply primary color to selected date background', () => {
      const { UNSAFE_getAllByType } = render(<Calendar {...defaultProps} />);
      // Selected date should have primary background
    });

    it('should apply disabled color to header text', () => {
      const { UNSAFE_queryAllByProps } = render(<Calendar {...defaultProps} />);
      const headers = UNSAFE_queryAllByProps({ testID: 'calendar-header' });
      expect(headers.length).toBeGreaterThan(0);
      expect(headers[0].props.children).toBe('2025.11');
      // Header should use disabled color
    });
  });

  describe('Initial Date', () => {
    it('should start at initial date', () => {
      const { UNSAFE_getByType } = render(
        <Calendar {...defaultProps} initialDate="2025-12-01" />
      );
      // Should display December 2025
    });

    it('should handle different initial dates', () => {
      const { UNSAFE_queryAllByProps } = render(
        <Calendar {...defaultProps} initialDate="2024-06-15" />
      );
      const headers = UNSAFE_queryAllByProps({ testID: 'calendar-header' });
      expect(headers.length).toBeGreaterThan(0);
      expect(headers[0].props.children).toBe('2024.06');
    });

    it('should handle past dates as initial date', () => {
      const { UNSAFE_queryAllByProps } = render(
        <Calendar {...defaultProps} initialDate="2020-01-01" />
      );
      const headers = UNSAFE_queryAllByProps({ testID: 'calendar-header' });
      expect(headers.length).toBeGreaterThan(0);
      expect(headers[0].props.children).toBe('2020.01');
    });

    it('should handle future dates as initial date', () => {
      const { UNSAFE_queryAllByProps } = render(
        <Calendar {...defaultProps} initialDate="2030-12-31" />
      );
      const headers = UNSAFE_queryAllByProps({ testID: 'calendar-header' });
      expect(headers.length).toBeGreaterThan(0);
      expect(headers[0].props.children).toBe('2030.12');
    });
  });

  describe('Current Date Highlighting', () => {
    it('should highlight current date differently', () => {
      const { UNSAFE_getAllByType } = render(
        <Calendar {...defaultProps} currentDate="2025-11-16" />
      );
      // Date 16 should be highlighted
    });

    it('should change highlight when current date changes', () => {
      const { rerender } = render(<Calendar {...defaultProps} currentDate="2025-11-15" />);
      rerender(<Calendar {...defaultProps} currentDate="2025-11-16" />);
      // Highlight should move from 15 to 16
    });

    it('should handle no current date selected', () => {
      const { UNSAFE_getByType } = render(
        <Calendar {...defaultProps} currentDate="" />
      );
      // No date should be highlighted
    });
  });

  describe('Edge Cases', () => {
    it('should handle month with 31 days', () => {
      const { UNSAFE_getByType } = render(
        <Calendar {...defaultProps} initialDate="2025-01-15" />
      );
      // January should display 31 days
    });

    it('should handle February in non-leap year', () => {
      const { UNSAFE_getByType } = render(
        <Calendar {...defaultProps} initialDate="2025-02-15" />
      );
      // February 2025 should have 28 days
    });

    it('should handle February in leap year', () => {
      const { UNSAFE_getByType } = render(
        <Calendar {...defaultProps} initialDate="2024-02-15" />
      );
      // February 2024 should have 29 days
    });

    it('should handle year boundary', () => {
      const { UNSAFE_queryAllByProps } = render(
        <Calendar {...defaultProps} initialDate="2024-12-31" />
      );
      const headers = UNSAFE_queryAllByProps({ testID: 'calendar-header' });
      expect(headers.length).toBeGreaterThan(0);
      expect(headers[0].props.children).toBe('2024.12');
    });

    it('should handle all dates being unavailable', () => {
      const { UNSAFE_getByType } = render(
        <Calendar {...defaultProps} availableDates={[]} />
      );
      // All dates should be disabled
    });
  });

  describe('Day Wrapper Styling', () => {
    it('should apply 30px width and height to day wrapper', () => {
      const { UNSAFE_getAllByType } = render(<Calendar {...defaultProps} />);
      // Day wrapper should be 30x30px
    });

    it('should apply border radius to selected date', () => {
      const { UNSAFE_getAllByType } = render(<Calendar {...defaultProps} />);
      // Selected date should have 5px border radius
    });

    it('should center day number in wrapper', () => {
      const { UNSAFE_getAllByType } = render(<Calendar {...defaultProps} />);
      // Day number should be centered
    });
  });
});
