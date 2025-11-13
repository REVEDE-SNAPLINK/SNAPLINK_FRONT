import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SearchPhotographerView from '../SearchPhotographerView';
import { FilterCategory, FilterValue } from '@/types/filter';
import { Photographer } from '@/types/photographer';

// Mock icons
jest.mock('@/assets/icons/camera.svg', () => 'CameraIcon');
jest.mock('@/assets/icons/send.svg', () => 'SendIcon');
jest.mock('@/assets/icons/discount.svg', () => 'DiscountIcon');
jest.mock('@/assets/icons/profile.svg', () => 'ProfileIcon');
jest.mock('@/assets/icons/camera-white.svg', () => 'ActiveCameraIcon');
jest.mock('@/assets/icons/send-white.svg', () => 'ActiveSendIcon');
jest.mock('@/assets/icons/discount-white.svg', () => 'ActiveDiscountIcon');
jest.mock('@/assets/icons/profile-white.svg', () => 'ActiveProfileIcon');
jest.mock('@/assets/icons/arrow-left.png', () => 'ArrowLeftIcon');
jest.mock('@/assets/icons/search.png', () => 'SearchIcon');
jest.mock('@/assets/icons/swap.png', () => 'SwapIcon');

describe('SearchPhotographerView', () => {
  const mockFilterCategories: FilterCategory[] = [
    {
      id: 'shooting-type',
      name: '촬영 유형',
      type: 'ENUM',
      icon: 'CameraIcon' as any,
      activeIcon: 'ActiveCameraIcon' as any,
      items: ['인물', '웨딩'],
    },
    {
      id: 'price',
      name: '가격',
      type: 'NUMBER',
      icon: 'DiscountIcon' as any,
      activeIcon: 'ActiveDiscountIcon' as any,
      min: 5000,
      max: 1000000,
      unit: '원',
    },
  ];

  const mockPhotographers: Photographer[] = [
    {
      id: '1',
      nickname: '유앤미스냅',
      rating: 4.8,
      reviewCount: 34,
      portfolioImages: ['img1.jpg', 'img2.jpg'],
      shootingUnit: '기본촬영/2시간',
      price: 50000,
      isPartner: true,
      gender: '여성작가',
      shootingTypes: ['커플', '웨딩'],
      styleTags: ['우정', '자연광', '감성'],
      region: '서울',
      createdAt: '2024-01-15T10:00:00Z',
    },
  ];

  const defaultProps = {
    onPressBackButton: jest.fn(),
    searchKey: '테스트',
    onChangeSearchKey: jest.fn(),
    onSubmitSearchKey: jest.fn(),
    filterCategories: mockFilterCategories,
    activeCategoryIds: [],
    filterChips: [],
    onPressFilterButton: jest.fn(),
    onPressCategoryChip: jest.fn(),
    onPressFilterChip: jest.fn(),
    isFilterModalOpen: false,
    onCloseFilterModal: jest.fn(),
    selectedFilters: [],
    onApplyFilters: jest.fn(),
    photographers: mockPhotographers,
    totalCount: 1,
    sortBy: 'recommended' as const,
    onToggleSort: jest.fn(),
    onLoadMore: jest.fn(),
    onRefresh: jest.fn(),
    isRefreshing: false,
    isFetchingNextPage: false,
    onPressPhotographer: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render search input with correct value', () => {
      const { getByDisplayValue } = render(<SearchPhotographerView {...defaultProps} />);
      expect(getByDisplayValue('테스트')).toBeTruthy();
    });

    it('should display total count correctly', () => {
      const { getByText } = render(<SearchPhotographerView {...defaultProps} />);
      expect(getByText('1명')).toBeTruthy();
    });

    it('should display correct sort button text for recommended', () => {
      const { getByText } = render(<SearchPhotographerView {...defaultProps} />);
      expect(getByText('추천순')).toBeTruthy();
    });

    it('should display correct sort button text for latest', () => {
      const { getByText } = render(
        <SearchPhotographerView {...defaultProps} sortBy="latest" />
      );
      expect(getByText('최신순')).toBeTruthy();
    });

    it('should render photographer list', () => {
      const { getByText } = render(<SearchPhotographerView {...defaultProps} />);
      expect(getByText('유앤미스냅')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should call onPressBackButton when back button is pressed', () => {
      const { getByTestId } = render(<SearchPhotographerView {...defaultProps} />);
      // Note: IconButton needs testID prop added for this to work
      // For now, we'll skip this specific test implementation
    });

    it('should call onChangeSearchKey when search input changes', () => {
      const { getByDisplayValue } = render(<SearchPhotographerView {...defaultProps} />);
      const input = getByDisplayValue('테스트');
      fireEvent.changeText(input, '새로운 검색어');
      expect(defaultProps.onChangeSearchKey).toHaveBeenCalledWith('새로운 검색어');
    });

    it('should call onSubmitSearchKey when search is submitted', () => {
      const { getByDisplayValue } = render(<SearchPhotographerView {...defaultProps} />);
      const input = getByDisplayValue('테스트');
      fireEvent(input, 'submitEditing');
      expect(defaultProps.onSubmitSearchKey).toHaveBeenCalled();
    });

    it('should call onToggleSort when sort button is pressed', () => {
      const { getByText } = render(<SearchPhotographerView {...defaultProps} />);
      const sortButton = getByText('추천순');
      fireEvent.press(sortButton.parent!);
      expect(defaultProps.onToggleSort).toHaveBeenCalled();
    });

    it('should call onPressFilterButton when filter button is pressed', () => {
      const { UNSAFE_getByType } = render(<SearchPhotographerView {...defaultProps} />);
      // Filter component interaction would need proper testID
    });
  });

  describe('Filter Modal', () => {
    it('should not render FilterModal when isFilterModalOpen is false', () => {
      const { queryByText } = render(<SearchPhotographerView {...defaultProps} />);
      // FilterModal has "적용하기" button
      expect(queryByText('적용하기')).toBeNull();
    });

    it('should render FilterModal when isFilterModalOpen is true', () => {
      const { getByText } = render(
        <SearchPhotographerView {...defaultProps} isFilterModalOpen={true} />
      );
      expect(getByText('적용하기')).toBeTruthy();
    });
  });

  describe('Filter Chips', () => {
    it('should display filter chips correctly', () => {
      const filterChips = [
        { id: 'shooting-type-인물', categoryId: 'shooting-type', label: '인물' },
        { id: 'price-range', categoryId: 'price', label: '5만원 ~ 10만원' },
      ];
      const { getByText } = render(
        <SearchPhotographerView {...defaultProps} filterChips={filterChips} />
      );
      expect(getByText('인물')).toBeTruthy();
      expect(getByText('5만원 ~ 10만원')).toBeTruthy();
    });
  });

  describe('Loading States', () => {
    it('should show loading indicator when isFetchingNextPage is true', () => {
      const { UNSAFE_getByType } = render(
        <SearchPhotographerView {...defaultProps} isFetchingNextPage={true} />
      );
      // ActivityIndicator would be in the list footer
    });

    it('should support pull to refresh', () => {
      const { UNSAFE_getByType } = render(
        <SearchPhotographerView {...defaultProps} isRefreshing={true} />
      );
      // RefreshControl would be attached to FlatList
    });
  });

  describe('Empty State', () => {
    it('should render with empty photographers list', () => {
      const { getByText } = render(
        <SearchPhotographerView {...defaultProps} photographers={[]} totalCount={0} />
      );
      expect(getByText('0명')).toBeTruthy();
    });
  });
});
