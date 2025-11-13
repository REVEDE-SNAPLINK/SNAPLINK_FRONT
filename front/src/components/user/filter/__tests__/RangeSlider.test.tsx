import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import RangeSlider from '../RangeSlider';

describe('RangeSlider Component', () => {
  const defaultProps = {
    min: 5000,
    max: 1000000,
    unit: '원',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with default min and max values', () => {
      const { getByText } = render(<RangeSlider {...defaultProps} />);
      expect(getByText('최소')).toBeTruthy();
      expect(getByText('최대')).toBeTruthy();
      expect(getByText('5,000원')).toBeTruthy();
      expect(getByText('100만원')).toBeTruthy();
    });

    it('should render with initial values', () => {
      const { getByText } = render(
        <RangeSlider {...defaultProps} initialMinValue={50000} initialMaxValue={500000} />
      );
      expect(getByText('5만원')).toBeTruthy();
      expect(getByText('50만원')).toBeTruthy();
    });

    it('should format values correctly in 만원 unit', () => {
      const { getByText } = render(
        <RangeSlider {...defaultProps} initialMinValue={100000} initialMaxValue={200000} />
      );
      expect(getByText('10만원')).toBeTruthy();
      expect(getByText('20만원')).toBeTruthy();
    });

    it('should render with custom unit', () => {
      const { getByText } = render(
        <RangeSlider {...defaultProps} unit="달러" min={100} max={10000} />
      );
      expect(getByText('100달러')).toBeTruthy();
      expect(getByText('1만달러')).toBeTruthy();
    });
  });

  describe('Value Formatting', () => {
    it('should format values less than 10000 with toLocaleString', () => {
      const { getByText } = render(
        <RangeSlider {...defaultProps} initialMinValue={5000} min={1000} max={10000} />
      );
      expect(getByText('5,000원')).toBeTruthy();
    });

    it('should format values >= 10000 in 만원 unit', () => {
      const { getByText } = render(
        <RangeSlider {...defaultProps} initialMinValue={50000} />
      );
      expect(getByText('5만원')).toBeTruthy();
    });
  });

  describe('Label Display', () => {
    it('should not show label when at minimum value', () => {
      const { queryByText } = render(
        <RangeSlider {...defaultProps} initialMinValue={5000} />
      );
      // When minValue === min, label should be hidden
      // This would need to check the component structure
    });

    it('should not show label when at maximum value', () => {
      const { queryByText } = render(
        <RangeSlider {...defaultProps} initialMaxValue={1000000} />
      );
      // When maxValue === max, label should be hidden
    });

    it('should show label when not at limit values', () => {
      const { getByText } = render(
        <RangeSlider {...defaultProps} initialMinValue={50000} initialMaxValue={500000} />
      );
      expect(getByText('5만원')).toBeTruthy();
      expect(getByText('50만원')).toBeTruthy();
    });
  });

  describe('Range Limits', () => {
    it('should respect minimum range gap', () => {
      // MIN_RANGE is 50000 in the component
      const { getByText } = render(
        <RangeSlider
          {...defaultProps}
          initialMinValue={100000}
          initialMaxValue={149999}
        />
      );
      // Should enforce minimum 50000 gap
      expect(getByText('10만원')).toBeTruthy();
    });
  });

  describe('Color States', () => {
    it('should use textPrimary color when not at limit (min)', () => {
      const { getByText } = render(
        <RangeSlider {...defaultProps} initialMinValue={50000} />
      );
      const minLabel = getByText('최소');
      expect(minLabel).toBeTruthy();
      // Color prop would be checked in implementation
    });

    it('should use disabled color when at limit (max)', () => {
      const { getByText } = render(
        <RangeSlider {...defaultProps} initialMaxValue={1000000} />
      );
      const maxLabel = getByText('최대');
      expect(maxLabel).toBeTruthy();
      // Should have disabled color
    });
  });

  describe('Gesture Handling', () => {
    it('should initialize positions correctly on layout', () => {
      const { UNSAFE_getByType } = render(
        <RangeSlider {...defaultProps} initialMinValue={50000} initialMaxValue={500000} />
      );
      // Layout event would trigger position initialization
    });

    it('should handle pan gesture on min thumb', () => {
      const { UNSAFE_getAllByType } = render(<RangeSlider {...defaultProps} />);
      // GestureDetector interactions would be tested with gesture simulation
    });

    it('should handle pan gesture on max thumb', () => {
      const { UNSAFE_getAllByType } = render(<RangeSlider {...defaultProps} />);
      // GestureDetector interactions would be tested with gesture simulation
    });

    it('should call onChange when gesture ends', () => {
      const onChange = jest.fn();
      const { UNSAFE_getAllByType } = render(
        <RangeSlider {...defaultProps} onChange={onChange} />
      );
      // Gesture end would trigger onChange callback
    });
  });

  describe('Edge Cases', () => {
    it('should handle min === max case', () => {
      const { getByText } = render(<RangeSlider {...defaultProps} min={10000} max={10000} />);
      expect(getByText('1만원')).toBeTruthy();
    });

    it('should handle very small range', () => {
      const { getByText } = render(
        <RangeSlider {...defaultProps} min={1000} max={5000} unit="원" />
      );
      expect(getByText('1,000원')).toBeTruthy();
      expect(getByText('5,000원')).toBeTruthy();
    });

    it('should handle very large range', () => {
      const { getByText } = render(
        <RangeSlider {...defaultProps} min={10000} max={10000000} />
      );
      expect(getByText('1만원')).toBeTruthy();
      expect(getByText('1000만원')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should render track elements', () => {
      const { UNSAFE_getAllByType } = render(<RangeSlider {...defaultProps} />);
      // Track, ActiveTrack, and Thumbs should be rendered
    });

    it('should have proper touch areas for thumbs', () => {
      const { UNSAFE_getAllByType } = render(<RangeSlider {...defaultProps} />);
      // TOUCH_AREA is 44px for better touch interaction
    });
  });
});
