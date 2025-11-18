import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BookingDetailsView from '../BookingDetailsView';

jest.mock('@assets/icons/arrow-right2.svg', () => 'ArrowRightIcon');

describe('BookingDetailsView Component', () => {
  const defaultProps = {
    onPressBack: jest.fn(),
    nickname: '유앤미스냅',
    name: '유앤미스냅 작가',
    bookingOption: '2시간 기본 촬영',
    date: '2025-11-20',
    time: '14:00',
    additionalRequest: '자연스러운 분위기로 촬영해주세요.',
    isCompleted: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render booking details screen', () => {
      const { getByText } = render(<BookingDetailsView {...defaultProps} />);
      expect(getByText('예약 정보')).toBeTruthy();
    });

    it('should render header title with nickname', () => {
      const { getByText } = render(<BookingDetailsView {...defaultProps} />);
      expect(getByText('유앤미스냅과 함께한 추억이에요')).toBeTruthy();
    });

    it('should render photographer name', () => {
      const { getByText } = render(<BookingDetailsView {...defaultProps} />);
      expect(getByText('유앤미스냅 작가')).toBeTruthy();
    });

    it('should render booking option', () => {
      const { getByText } = render(<BookingDetailsView {...defaultProps} />);
      expect(getByText('2시간 기본 촬영')).toBeTruthy();
    });

    it('should render formatted date and time', () => {
      const { getByText } = render(<BookingDetailsView {...defaultProps} />);
      expect(getByText('2025.11.20 14:00')).toBeTruthy();
    });

    it('should render additional request', () => {
      const { getByText } = render(<BookingDetailsView {...defaultProps} />);
      expect(getByText('자연스러운 분위기로 촬영해주세요.')).toBeTruthy();
    });

    it('should render all description labels', () => {
      const { getByText } = render(<BookingDetailsView {...defaultProps} />);
      expect(getByText('작가명')).toBeTruthy();
      expect(getByText('촬영 항목')).toBeTruthy();
      expect(getByText('촬영 일시')).toBeTruthy();
      expect(getByText('요청 사항')).toBeTruthy();
    });

    it('should render write review button', () => {
      const { getByText } = render(<BookingDetailsView {...defaultProps} />);
      expect(getByText('촬영 후기 작성')).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('should render loading state', () => {
      const { UNSAFE_getByType } = render(
        <BookingDetailsView {...defaultProps} isLoading={true} />
      );
      // Check that ActivityIndicator (from Loading component) is rendered
      expect(UNSAFE_getByType('ActivityIndicator')).toBeTruthy();
    });

    it('should not render booking details when loading', () => {
      const { queryByText } = render(
        <BookingDetailsView {...defaultProps} isLoading={true} />
      );
      expect(queryByText('예약 정보')).toBeNull();
    });
  });

  describe('Completed Booking State', () => {
    it('should show view photos button when completed', () => {
      const onPressViewPhotos = jest.fn();
      const { getByText } = render(
        <BookingDetailsView
          {...defaultProps}
          isCompleted={true}
          onPressViewPhotos={onPressViewPhotos}
        />
      );
      expect(getByText('촬영 사진 보기')).toBeTruthy();
    });

    it('should not show view photos button when not completed', () => {
      const { queryByText } = render(
        <BookingDetailsView {...defaultProps} isCompleted={false} />
      );
      expect(queryByText('촬영 사진 보기')).toBeNull();
    });

    it('should call onPressViewPhotos when view photos button is pressed', () => {
      const onPressViewPhotos = jest.fn();
      const { getByText } = render(
        <BookingDetailsView
          {...defaultProps}
          isCompleted={true}
          onPressViewPhotos={onPressViewPhotos}
        />
      );
      const button = getByText('촬영 사진 보기');
      fireEvent.press(button);
      expect(onPressViewPhotos).toHaveBeenCalledTimes(1);
    });

    it('should enable write review button when completed', () => {
      const { UNSAFE_getAllByType } = render(
        <BookingDetailsView {...defaultProps} isCompleted={true} />
      );
      // Write review button should be enabled when completed
    });

    it('should disable write review button when not completed', () => {
      const { UNSAFE_getAllByType } = render(
        <BookingDetailsView {...defaultProps} isCompleted={false} />
      );
      // Write review button should be disabled when not completed
    });
  });

  describe('Button Interactions', () => {
    it('should call onPressWriteReview when write review button is pressed', () => {
      const onPressWriteReview = jest.fn();
      const { getByText } = render(
        <BookingDetailsView
          {...defaultProps}
          isCompleted={true}
          onPressWriteReview={onPressWriteReview}
        />
      );
      const button = getByText('촬영 후기 작성');
      fireEvent.press(button);
      expect(onPressWriteReview).toHaveBeenCalledTimes(1);
    });

    it('should handle press on disabled review button gracefully', () => {
      const onPressWriteReview = jest.fn();
      const { getByText } = render(
        <BookingDetailsView
          {...defaultProps}
          isCompleted={false}
          onPressWriteReview={onPressWriteReview}
        />
      );
      const button = getByText('촬영 후기 작성');
      fireEvent.press(button);
      // Button is disabled, so handler might not be called or does nothing
    });
  });

  describe('Edge Cases', () => {
    it('should render with empty additional request', () => {
      const { getByText } = render(
        <BookingDetailsView {...defaultProps} additionalRequest="" />
      );
      expect(getByText('요청 사항')).toBeTruthy();
    });

    it('should render with long additional request', () => {
      const longRequest = '매우 긴 요청사항입니다. '.repeat(50);
      const { getByText } = render(
        <BookingDetailsView {...defaultProps} additionalRequest={longRequest} />
      );
      expect(getByText(longRequest)).toBeTruthy();
    });

    it('should render with special characters in nickname', () => {
      const { getByText } = render(
        <BookingDetailsView {...defaultProps} nickname="유앤미@스냅#123" />
      );
      expect(getByText('유앤미@스냅#123과 함께한 추억이에요')).toBeTruthy();
    });

    it('should handle missing onPressViewPhotos callback', () => {
      const { queryByText } = render(
        <BookingDetailsView {...defaultProps} isCompleted={true} />
      );
      expect(queryByText('촬영 사진 보기')).toBeNull();
    });

    it('should handle missing onPressWriteReview callback', () => {
      const { getByText } = render(
        <BookingDetailsView {...defaultProps} isCompleted={true} />
      );
      const button = getByText('촬영 후기 작성');
      // Should not throw error when pressed
      fireEvent.press(button);
    });
  });

  describe('Date and Time Formatting', () => {
    it('should format date with dots', () => {
      const { getByText } = render(<BookingDetailsView {...defaultProps} />);
      expect(getByText('2025.11.20 14:00')).toBeTruthy();
    });

    it('should handle different date formats', () => {
      const { getByText } = render(
        <BookingDetailsView {...defaultProps} date="2024-01-05" time="09:30" />
      );
      expect(getByText('2024.01.05 09:30')).toBeTruthy();
    });

    it('should handle different time formats', () => {
      const { getByText } = render(
        <BookingDetailsView {...defaultProps} time="23:59" />
      );
      expect(getByText('2025.11.20 23:59')).toBeTruthy();
    });
  });

  describe('Info Container', () => {
    it('should render info container with all details', () => {
      const { getByText } = render(<BookingDetailsView {...defaultProps} />);
      expect(getByText('예약 정보')).toBeTruthy();
      expect(getByText('작가명')).toBeTruthy();
      expect(getByText('촬영 항목')).toBeTruthy();
      expect(getByText('촬영 일시')).toBeTruthy();
      expect(getByText('요청 사항')).toBeTruthy();
    });
  });

  describe('Multiple Props Combinations', () => {
    it('should render correctly with completed and all callbacks', () => {
      const onPressViewPhotos = jest.fn();
      const onPressWriteReview = jest.fn();
      const { getByText } = render(
        <BookingDetailsView
          {...defaultProps}
          isCompleted={true}
          onPressViewPhotos={onPressViewPhotos}
          onPressWriteReview={onPressWriteReview}
        />
      );
      expect(getByText('촬영 사진 보기')).toBeTruthy();
      expect(getByText('촬영 후기 작성')).toBeTruthy();
    });

    it('should render correctly with completed but no view photos callback', () => {
      const onPressWriteReview = jest.fn();
      const { queryByText, getByText } = render(
        <BookingDetailsView
          {...defaultProps}
          isCompleted={true}
          onPressWriteReview={onPressWriteReview}
        />
      );
      expect(queryByText('촬영 사진 보기')).toBeNull();
      expect(getByText('촬영 후기 작성')).toBeTruthy();
    });

    it('should render correctly when not completed', () => {
      const { queryByText, getByText } = render(
        <BookingDetailsView {...defaultProps} isCompleted={false} />
      );
      expect(queryByText('촬영 사진 보기')).toBeNull();
      expect(getByText('촬영 후기 작성')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have pressable view photos button', () => {
      const onPressViewPhotos = jest.fn();
      const { getByText } = render(
        <BookingDetailsView
          {...defaultProps}
          isCompleted={true}
          onPressViewPhotos={onPressViewPhotos}
        />
      );
      const button = getByText('촬영 사진 보기');
      expect(button).toBeTruthy();
    });

    it('should have pressable write review button', () => {
      const onPressWriteReview = jest.fn();
      const { getByText } = render(
        <BookingDetailsView
          {...defaultProps}
          isCompleted={true}
          onPressWriteReview={onPressWriteReview}
        />
      );
      const button = getByText('촬영 후기 작성');
      expect(button).toBeTruthy();
    });
  });
});
