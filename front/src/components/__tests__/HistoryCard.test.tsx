import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HistoryCard from '../HistoryCard';

describe('HistoryCard Component', () => {
  const defaultProps = {
    onPress: jest.fn(),
    status: 'PENDING' as const,
    nickname: '유앤미스냅',
    name: '유앤미스냅 작가',
    type: '커플',
    datetime: '2025.11.20 14:00',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with all props', () => {
    const { getByText } = render(<HistoryCard {...defaultProps} />);

    expect(getByText('유앤미스냅과 함께한 추억이에요')).toBeTruthy();
    expect(getByText('유앤미스냅 작가')).toBeTruthy();
    expect(getByText('커플')).toBeTruthy();
    expect(getByText('2025.11.20 14:00')).toBeTruthy();
  });

  it('calls onPress when detail button is pressed', () => {
    const { getByText } = render(<HistoryCard {...defaultProps} />);

    const detailButton = getByText('상세보기');
    fireEvent.press(detailButton);

    expect(defaultProps.onPress).toHaveBeenCalledTimes(1);
  });

  it('displays correct status message for PENDING status', () => {
    const props = {
      ...defaultProps,
      status: 'PENDING' as const,
    };

    const { getByText } = render(<HistoryCard {...props} />);

    expect(getByText('아직 촬영 전이에요')).toBeTruthy();
  });

  it('displays correct status message for CONFIRMED status', () => {
    const props = {
      ...defaultProps,
      status: 'CONFIRMED' as const,
    };

    const { getByText } = render(<HistoryCard {...props} />);

    expect(getByText('작가님이 작업 중이에요')).toBeTruthy();
  });

  it('displays action buttons for COMPLETED status', () => {
    const onPressShowPhoto = jest.fn();
    const onPressWriteReview = jest.fn();

    const props = {
      ...defaultProps,
      status: 'COMPLETED' as const,
      onPressShowPhoto,
      onPressWriteReview,
    };

    const { getByText } = render(<HistoryCard {...props} />);

    expect(getByText('사진 보기')).toBeTruthy();
    expect(getByText('후기 작성')).toBeTruthy();
  });

  it('calls onPressShowPhoto when photo button is pressed', () => {
    const onPressShowPhoto = jest.fn();

    const props = {
      ...defaultProps,
      status: 'COMPLETED' as const,
      onPressShowPhoto,
    };

    const { getByText } = render(<HistoryCard {...props} />);

    const photoButton = getByText('사진 보기');
    fireEvent.press(photoButton);

    expect(onPressShowPhoto).toHaveBeenCalledTimes(1);
  });

  it('calls onPressWriteReview when review button is pressed', () => {
    const onPressWriteReview = jest.fn();

    const props = {
      ...defaultProps,
      status: 'COMPLETED' as const,
      onPressWriteReview,
    };

    const { getByText } = render(<HistoryCard {...props} />);

    const reviewButton = getByText('후기 작성');
    fireEvent.press(reviewButton);

    expect(onPressWriteReview).toHaveBeenCalledTimes(1);
  });

  it('does not display action buttons for non-COMPLETED status', () => {
    const props = {
      ...defaultProps,
      status: 'PENDING' as const,
    };

    const { queryByText } = render(<HistoryCard {...props} />);

    expect(queryByText('사진 보기')).toBeNull();
    expect(queryByText('후기 작성')).toBeNull();
  });

  it('displays field labels correctly', () => {
    const { getByText } = render(<HistoryCard {...defaultProps} />);

    expect(getByText('작가명')).toBeTruthy();
    expect(getByText('촬영 항목')).toBeTruthy();
    expect(getByText('촬영 일시')).toBeTruthy();
  });

  it('renders with different photographer nicknames', () => {
    const props = {
      ...defaultProps,
      nickname: '스냅마스터',
    };

    const { getByText } = render(<HistoryCard {...props} />);

    expect(getByText('스냅마스터과 함께한 추억이에요')).toBeTruthy();
  });

  it('renders with different shooting types', () => {
    const props = {
      ...defaultProps,
      type: '웨딩',
    };

    const { getByText } = render(<HistoryCard {...props} />);

    expect(getByText('웨딩')).toBeTruthy();
  });

  it('shows only review button when onPressShowPhoto is undefined', () => {
    const onPressWriteReview = jest.fn();

    const props = {
      ...defaultProps,
      status: 'COMPLETED' as const,
      onPressWriteReview,
    };

    const { queryByText, getByText } = render(<HistoryCard {...props} />);

    expect(queryByText('사진 보기')).toBeNull();
    expect(getByText('후기 작성')).toBeTruthy();
  });

  it('shows only photo button when onPressWriteReview is undefined', () => {
    const onPressShowPhoto = jest.fn();

    const props = {
      ...defaultProps,
      status: 'COMPLETED' as const,
      onPressShowPhoto,
    };

    const { queryByText, getByText } = render(<HistoryCard {...props} />);

    expect(getByText('사진 보기')).toBeTruthy();
    expect(queryByText('후기 작성')).toBeNull();
  });

  it('renders complete card structure', () => {
    const { getByText } = render(<HistoryCard {...defaultProps} />);

    expect(getByText('유앤미스냅과 함께한 추억이에요')).toBeTruthy();
    expect(getByText('유앤미스냅 작가')).toBeTruthy();
    expect(getByText('커플')).toBeTruthy();
    expect(getByText('2025.11.20 14:00')).toBeTruthy();
  });
});
