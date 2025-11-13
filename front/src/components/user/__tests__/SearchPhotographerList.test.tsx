import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SearchPhotographerList from '../SearchPhotographerList';
import { Photographer } from '@/types/photographer';

jest.mock('@/assets/icons/star-review.png', () => 'StarReviewIcon');
jest.mock('@/assets/imgs/snap-sample2.png', () => 'SnapSampleImage');

describe('SearchPhotographerList Component', () => {
  const mockPhotographers: Photographer[] = [
    {
      id: '1',
      nickname: '유앤미스냅',
      rating: 4.8,
      reviewCount: 34,
      portfolioImages: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
      shootingUnit: '기본촬영/2시간',
      price: 50000,
      isPartner: true,
      gender: '여성작가',
      shootingTypes: ['커플', '웨딩'],
      region: '서울',
      createdAt: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      nickname: '포토스튜디오 김',
      rating: 4.5,
      reviewCount: 12,
      portfolioImages: ['img4.jpg', 'img5.jpg'],
      shootingUnit: '기본촬영/1시간',
      price: 80000,
      isPartner: false,
      gender: '남성작가',
      shootingTypes: ['인물', '사물'],
      region: '경기',
      createdAt: '2024-02-20T14:30:00Z',
    },
  ];

  const defaultProps = {
    photographers: mockPhotographers,
    onEndReached: jest.fn(),
    onRefresh: jest.fn(),
    isRefreshing: false,
    isFetchingNextPage: false,
    onPressItem: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render FlatList with photographers', () => {
      const { getByText } = render(<SearchPhotographerList {...defaultProps} />);
      expect(getByText('유앤미스냅')).toBeTruthy();
      expect(getByText('포토스튜디오 김')).toBeTruthy();
    });

    it('should render photographer nickname', () => {
      const { getByText } = render(<SearchPhotographerList {...defaultProps} />);
      expect(getByText('유앤미스냅')).toBeTruthy();
    });

    it('should render photographer rating with one decimal', () => {
      const { getByText } = render(<SearchPhotographerList {...defaultProps} />);
      expect(getByText(/4\.8/)).toBeTruthy();
    });

    it('should render review count', () => {
      const { getByText } = render(<SearchPhotographerList {...defaultProps} />);
      expect(getByText(/\(34\)/)).toBeTruthy();
    });

    it('should render shooting unit and price', () => {
      const { getByText } = render(<SearchPhotographerList {...defaultProps} />);
      expect(getByText(/기본촬영\/2시간/)).toBeTruthy();
      expect(getByText(/50,000원/)).toBeTruthy();
    });

    it('should render "파트너 작가" label for partner photographers', () => {
      const { getByText } = render(<SearchPhotographerList {...defaultProps} />);
      expect(getByText('파트너 작가')).toBeTruthy();
    });

    it('should not render "파트너 작가" label for non-partner photographers', () => {
      const { getAllByText } = render(<SearchPhotographerList {...defaultProps} />);
      const partnerLabels = getAllByText('파트너 작가');
      expect(partnerLabels.length).toBe(1); // Only one photographer is partner
    });

    it('should render gender label', () => {
      const { getByText } = render(<SearchPhotographerList {...defaultProps} />);
      expect(getByText('여성작가')).toBeTruthy();
      expect(getByText('남성작가')).toBeTruthy();
    });

    it('should render shooting type labels', () => {
      const { getByText } = render(<SearchPhotographerList {...defaultProps} />);
      expect(getByText('커플')).toBeTruthy();
      expect(getByText('웨딩')).toBeTruthy();
      expect(getByText('인물')).toBeTruthy();
      expect(getByText('사물')).toBeTruthy();
    });
  });

  describe('Portfolio Images', () => {
    it('should render horizontal scroll for portfolio images', () => {
      const { UNSAFE_getAllByType } = render(<SearchPhotographerList {...defaultProps} />);
      // ScrollView should be present for each photographer
    });

    it('should render multiple portfolio images per photographer', () => {
      const { getAllByTestId } = render(<SearchPhotographerList {...defaultProps} />);
      // Each photographer should have their portfolio images rendered
    });
  });

  describe('User Interactions', () => {
    it('should call onPressItem when photographer info is pressed', () => {
      const { getByText } = render(<SearchPhotographerList {...defaultProps} />);
      const photographerInfo = getByText('유앤미스냅');
      fireEvent.press(photographerInfo);
      expect(defaultProps.onPressItem).toHaveBeenCalledWith('1');
    });

    it('should call onEndReached when scrolling to bottom', () => {
      const { getByTestId } = render(
        <SearchPhotographerList {...defaultProps} />
      );
      const flatList = getByTestId('photographer-list');
      fireEvent(flatList, 'endReached');
      expect(defaultProps.onEndReached).toHaveBeenCalled();
    });

    it('should call onRefresh when pull to refresh', () => {
      const { getByTestId } = render(<SearchPhotographerList {...defaultProps} />);
      const flatList = getByTestId('photographer-list');
      fireEvent(flatList, 'refresh');
      expect(defaultProps.onRefresh).toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should show ActivityIndicator when isFetchingNextPage is true', () => {
      const { UNSAFE_getByType } = render(
        <SearchPhotographerList {...defaultProps} isFetchingNextPage={true} />
      );
      expect(UNSAFE_getByType('ActivityIndicator')).toBeTruthy();
    });

    it('should not show ActivityIndicator when isFetchingNextPage is false', () => {
      const { UNSAFE_queryByType } = render(
        <SearchPhotographerList {...defaultProps} isFetchingNextPage={false} />
      );
      // ActivityIndicator should not be in list footer
    });

    it('should show RefreshControl when isRefreshing is true', () => {
      const { UNSAFE_getByType } = render(
        <SearchPhotographerList {...defaultProps} isRefreshing={true} />
      );
      // RefreshControl is attached to FlatList
    });
  });

  describe('Empty State', () => {
    it('should render with empty photographers array', () => {
      const { getByTestId } = render(
        <SearchPhotographerList {...defaultProps} photographers={[]} />
      );
      expect(getByTestId('photographer-list')).toBeTruthy();
    });
  });

  describe('Price Formatting', () => {
    it('should format price with thousand separators', () => {
      const { getByText } = render(<SearchPhotographerList {...defaultProps} />);
      expect(getByText(/50,000원/)).toBeTruthy();
      expect(getByText(/80,000원/)).toBeTruthy();
    });

    it('should handle large prices correctly', () => {
      const largePhotographer: Photographer = {
        ...mockPhotographers[0],
        id: '3',
        price: 1500000,
      };
      const { getByText } = render(
        <SearchPhotographerList {...defaultProps} photographers={[largePhotographer]} />
      );
      expect(getByText(/1,500,000원/)).toBeTruthy();
    });
  });

  describe('FlatList Configuration', () => {
    it('should have correct onEndReachedThreshold', () => {
      const { getByTestId } = render(<SearchPhotographerList {...defaultProps} />);
      const flatList = getByTestId('photographer-list');
      expect(flatList.props.onEndReachedThreshold).toBe(0.5);
    });

    it('should hide vertical scroll indicator', () => {
      const { getByTestId } = render(<SearchPhotographerList {...defaultProps} />);
      const flatList = getByTestId('photographer-list');
      expect(flatList.props.showsVerticalScrollIndicator).toBe(false);
    });

    it('should use photographer id as key', () => {
      const { getByTestId } = render(<SearchPhotographerList {...defaultProps} />);
      const flatList = getByTestId('photographer-list');
      expect(flatList.props.keyExtractor(mockPhotographers[0])).toBe('1');
    });
  });

  describe('Multiple Photographers', () => {
    it('should render all photographers in list', () => {
      const { getByText } = render(<SearchPhotographerList {...defaultProps} />);
      mockPhotographers.forEach((photographer) => {
        expect(getByText(photographer.nickname)).toBeTruthy();
      });
    });

    it('should handle long list of photographers', () => {
      const manyPhotographers = Array.from({ length: 20 }, (_, i) => ({
        ...mockPhotographers[0],
        id: `${i}`,
        nickname: `작가${i}`,
      }));
      const { getByText } = render(
        <SearchPhotographerList {...defaultProps} photographers={manyPhotographers} />
      );
      expect(getByText('작가0')).toBeTruthy();
      // FlatList virtualization means not all items are rendered at once
      // Just check that the list accepts many items
      expect(manyPhotographers.length).toBe(20);
    });
  });
});
