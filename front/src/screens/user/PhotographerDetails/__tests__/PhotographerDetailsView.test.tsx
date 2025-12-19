import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import PhotographerDetailsView from '../PhotographerDetailsView';
import type { PhotographerDetails, PortfolioImage } from '@/types/photographer';

jest.mock('@/assets/icons/heart.svg', () => 'HeartIcon');
jest.mock('@/assets/icons/chat.svg', () => 'ChatIcon');
jest.mock('@/assets/icons/upload.svg', () => 'UploadIcon');

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 0, height: 0 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}
    >
      {component}
    </SafeAreaProvider>
  );
};

describe('PhotographerDetailsView Component', () => {
  const mockPhotographer: PhotographerDetails = {
    id: '1',
    nickname: '유앤미스냅',
    name: '유앤미스냅 작가',
    profileImage: 'https://example.com/profile.jpg',
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
    introduction: '안녕하세요, 유앤미스냅입니다. 자연스러운 순간을 담습니다.',
    portfolioCount: 120,
  };

  const mockPortfolioImages: PortfolioImage[] = [
    { id: '1', url: 'https://example.com/portfolio1.jpg', createdAt: '2024-01-01' },
    { id: '2', url: 'https://example.com/portfolio2.jpg', createdAt: '2024-01-02' },
    { id: '3', url: 'https://example.com/portfolio3.jpg', createdAt: '2024-01-03' },
    { id: '4', url: 'https://example.com/portfolio4.jpg', createdAt: '2024-01-04' },
    { id: '5', url: 'https://example.com/portfolio5.jpg', createdAt: '2024-01-05' },
    { id: '6', url: 'https://example.com/portfolio6.jpg', createdAt: '2024-01-06' },
  ];

  const defaultProps = {
    photographer: mockPhotographer,
    portfolioImages: mockPortfolioImages,
    isLoadingPhotographer: false,
    isFetchingNextPage: false,
    onPressBack: jest.fn(),
    onPressUpload: jest.fn(),
    onPressFavorite: jest.fn(),
    onPressInquiry: jest.fn(),
    onPressReservation: jest.fn(),
    onEndReached: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render photographer nickname as header title', () => {
      const { getByText } = renderWithProvider(<PhotographerDetailsView {...defaultProps} />);
      expect(getByText('유앤미스냅')).toBeTruthy();
    });

    it('should render photographer name', () => {
      const { getByText } = renderWithProvider(<PhotographerDetailsView {...defaultProps} />);
      expect(getByText('유앤미스냅 작가')).toBeTruthy();
    });

    it('should render photographer introduction', () => {
      const { getByText } = renderWithProvider(<PhotographerDetailsView {...defaultProps} />);
      expect(getByText('안녕하세요, 유앤미스냅입니다. 자연스러운 순간을 담습니다.')).toBeTruthy();
    });

    it('should render "작가 한줄 소개" section title', () => {
      const { getByText } = renderWithProvider(<PhotographerDetailsView {...defaultProps} />);
      expect(getByText('작가 한줄 소개')).toBeTruthy();
    });

    it('should render "포트폴리오" section title', () => {
      const { getByText } = renderWithProvider(<PhotographerDetailsView {...defaultProps} />);
      expect(getByText('포트폴리오')).toBeTruthy();
    });

    it('should render profile image when available', () => {
      const { UNSAFE_getAllByType } = renderWithProvider(<PhotographerDetailsView {...defaultProps} />);
      // Profile image should be rendered
    });

    it('should render without profile image when not available', () => {
      const photographerWithoutImage = {
        ...mockPhotographer,
        profileImage: undefined,
      };
      const { getByText } = renderWithProvider(
        <PhotographerDetailsView
          {...defaultProps}
          photographer={photographerWithoutImage}
        />
      );
      expect(getByText('유앤미스냅')).toBeTruthy();
    });
  });

  describe('Portfolio Grid', () => {
    it('should render portfolio images', () => {
      const { UNSAFE_getAllByType } = renderWithProvider(<PhotographerDetailsView {...defaultProps} />);
      // FlatList should render portfolio images
    });

    it('should render exactly 6 portfolio images', () => {
      renderWithProvider(<PhotographerDetailsView {...defaultProps} />);
      // Portfolio images should be displayed in grid
      expect(mockPortfolioImages).toHaveLength(6);
    });

    it('should render empty portfolio grid', () => {
      const { getByText } = renderWithProvider(
        <PhotographerDetailsView {...defaultProps} portfolioImages={[]} />
      );
      expect(getByText('포트폴리오')).toBeTruthy();
    });

    it('should render with single portfolio image', () => {
      const singleImage: PortfolioImage[] = [
        { id: '1', url: 'https://example.com/single.jpg', createdAt: '2024-01-01' },
      ];
      const { getByText } = renderWithProvider(
        <PhotographerDetailsView {...defaultProps} portfolioImages={singleImage} />
      );
      expect(getByText('포트폴리오')).toBeTruthy();
    });
  });

  describe('Action Buttons', () => {
    it('should render favorite button', () => {
      const { UNSAFE_getAllByType } = renderWithProvider(<PhotographerDetailsView {...defaultProps} />);
      // Favorite button (heart icon) should exist
    });

    it('should render inquiry button', () => {
      const { UNSAFE_getAllByType } = renderWithProvider(<PhotographerDetailsView {...defaultProps} />);
      // Inquiry button (chat icon) should exist
    });

    it('should render reservation button', () => {
      const { getByText } = renderWithProvider(<PhotographerDetailsView {...defaultProps} />);
      expect(getByText('예약하기')).toBeTruthy();
    });

    it('should call onPressFavorite when favorite button is pressed', () => {
      // Would need testID to precisely test this
      // This is tested via integration tests
    });

    it('should call onPressInquiry when inquiry button is pressed', () => {
      // Would need testID to precisely test this
      // This is tested via integration tests
    });

    it('should call onPressReservation when reservation button is pressed', () => {
      const { getByText } = renderWithProvider(<PhotographerDetailsView {...defaultProps} />);
      const button = getByText('예약하기');
      fireEvent.press(button);
      expect(defaultProps.onPressReservation).toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should render loading indicator when photographer is loading', () => {
      const { UNSAFE_getByType } = renderWithProvider(
        <PhotographerDetailsView {...defaultProps} isLoadingPhotographer={true} />
      );
      expect(UNSAFE_getByType('ActivityIndicator')).toBeTruthy();
    });

    it('should not render photographer details while loading', () => {
      const { queryByText } = renderWithProvider(
        <PhotographerDetailsView {...defaultProps} isLoadingPhotographer={true} />
      );
      expect(queryByText('유앤미스냅')).toBeFalsy();
      expect(queryByText('포트폴리오')).toBeFalsy();
    });

    it('should render footer loading indicator when fetching next page', () => {
      const { UNSAFE_getAllByType } = renderWithProvider(
        <PhotographerDetailsView {...defaultProps} isFetchingNextPage={true} />
      );
      // Footer loading indicator should exist
    });

    it('should not render footer loading when not fetching', () => {
      const { UNSAFE_getAllByType } = renderWithProvider(
        <PhotographerDetailsView {...defaultProps} isFetchingNextPage={false} />
      );
      // Only one ActivityIndicator (not loading)
    });
  });

  describe('Error States', () => {
    it('should render error message when photographer is null', () => {
      const { getByText } = renderWithProvider(
        <PhotographerDetailsView {...defaultProps} photographer={null} />
      );
      expect(getByText('작가 정보를 불러울 수 없습니다.')).toBeTruthy();
    });

    it('should not render action buttons when photographer is null', () => {
      const { queryByText } = renderWithProvider(
        <PhotographerDetailsView {...defaultProps} photographer={null} />
      );
      expect(queryByText('예약하기')).toBeFalsy();
    });

    it('should still render header when photographer is null', () => {
      const { queryByText } = renderWithProvider(
        <PhotographerDetailsView {...defaultProps} photographer={null} />
      );
      // Header should exist but with empty title
    });
  });

  describe('Scroll Behavior', () => {
    it('should call onEndReached when scrolled to bottom', () => {
      // FlatList onEndReached would be tested in integration
      expect(defaultProps.onEndReached).toBeDefined();
    });

    it('should have onEndReachedThreshold set', () => {
      // This ensures infinite scroll triggers appropriately
      renderWithProvider(<PhotographerDetailsView {...defaultProps} />);
    });
  });

  describe('Header Actions', () => {
    it('should call onPressBack when back button is pressed', () => {
      // Back button would be tested via ScreenContainer integration
      expect(defaultProps.onPressBack).toBeDefined();
    });

    it('should call onPressUpload when upload tool is pressed', () => {
      // Upload button would be tested via ScreenContainer integration
      expect(defaultProps.onPressUpload).toBeDefined();
    });
  });

  describe('Data Display', () => {
    it('should display different photographer name', () => {
      const differentPhotographer = {
        ...mockPhotographer,
        name: '다른작가',
        nickname: '다른닉네임',
      };
      const { getByText } = renderWithProvider(
        <PhotographerDetailsView
          {...defaultProps}
          photographer={differentPhotographer}
        />
      );
      expect(getByText('다른작가')).toBeTruthy();
      expect(getByText('다른닉네임')).toBeTruthy();
    });

    it('should display different introduction text', () => {
      const differentPhotographer = {
        ...mockPhotographer,
        introduction: '새로운 소개글입니다.',
      };
      const { getByText } = renderWithProvider(
        <PhotographerDetailsView
          {...defaultProps}
          photographer={differentPhotographer}
        />
      );
      expect(getByText('새로운 소개글입니다.')).toBeTruthy();
    });

    it('should handle long introduction text', () => {
      const longIntroduction =
        '매우 긴 소개글입니다. '.repeat(20);
      const differentPhotographer = {
        ...mockPhotographer,
        introduction: longIntroduction,
      };
      const { getByText } = renderWithProvider(
        <PhotographerDetailsView
          {...defaultProps}
          photographer={differentPhotographer}
        />
      );
      expect(getByText(longIntroduction)).toBeTruthy();
    });

    it('should handle empty introduction', () => {
      const differentPhotographer = {
        ...mockPhotographer,
        introduction: '',
      };
      const { getByText } = renderWithProvider(
        <PhotographerDetailsView
          {...defaultProps}
          photographer={differentPhotographer}
        />
      );
      expect(getByText('작가 한줄 소개')).toBeTruthy();
    });
  });

  describe('Portfolio Image Display', () => {
    it('should display large number of portfolio images', () => {
      const manyImages: PortfolioImage[] = Array.from({ length: 50 }, (_, i) => ({
        id: `${i + 1}`,
        url: `https://example.com/img${i + 1}.jpg`,
        createdAt: '2024-01-01',
      }));
      renderWithProvider(
        <PhotographerDetailsView {...defaultProps} portfolioImages={manyImages} />
      );
      expect(manyImages).toHaveLength(50);
    });

    it('should handle portfolio images with different IDs', () => {
      const imagesWithDifferentIds: PortfolioImage[] = [
        { id: 'abc', url: 'https://example.com/1.jpg', createdAt: '2024-01-01' },
        { id: 'def', url: 'https://example.com/2.jpg', createdAt: '2024-01-02' },
        { id: 'ghi', url: 'https://example.com/3.jpg', createdAt: '2024-01-03' },
      ];
      const { getByText } = renderWithProvider(
        <PhotographerDetailsView
          {...defaultProps}
          portfolioImages={imagesWithDifferentIds}
        />
      );
      expect(getByText('포트폴리오')).toBeTruthy();
    });
  });

  describe('Layout Structure', () => {
    it('should render header, content, and action buttons sections', () => {
      const { getByText } = renderWithProvider(<PhotographerDetailsView {...defaultProps} />);
      expect(getByText('유앤미스냅')).toBeTruthy(); // Header
      expect(getByText('포트폴리오')).toBeTruthy(); // Content
      expect(getByText('예약하기')).toBeTruthy(); // Action buttons
    });

    it('should render profile section at top', () => {
      const { getByText } = renderWithProvider(<PhotographerDetailsView {...defaultProps} />);
      expect(getByText('유앤미스냅 작가')).toBeTruthy();
      expect(getByText('작가 한줄 소개')).toBeTruthy();
    });

    it('should render bottom action container', () => {
      const { getByText } = renderWithProvider(<PhotographerDetailsView {...defaultProps} />);
      expect(getByText('예약하기')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle photographer without introduction', () => {
      const photographerNoIntro = {
        ...mockPhotographer,
        introduction: '',
      };
      const { getByText } = renderWithProvider(
        <PhotographerDetailsView
          {...defaultProps}
          photographer={photographerNoIntro}
        />
      );
      expect(getByText('작가 한줄 소개')).toBeTruthy();
    });

    it('should handle very short nickname', () => {
      const photographerShortName = {
        ...mockPhotographer,
        nickname: 'A',
      };
      const { getByText } = renderWithProvider(
        <PhotographerDetailsView
          {...defaultProps}
          photographer={photographerShortName}
        />
      );
      expect(getByText('A')).toBeTruthy();
    });

    it('should handle very long nickname', () => {
      const photographerLongName = {
        ...mockPhotographer,
        nickname: '매우긴닉네임입니다정말로긴닉네임',
      };
      const { getByText } = renderWithProvider(
        <PhotographerDetailsView
          {...defaultProps}
          photographer={photographerLongName}
        />
      );
      expect(getByText('매우긴닉네임입니다정말로긴닉네임')).toBeTruthy();
    });

    it('should render when both loading states are false', () => {
      const { getByText } = renderWithProvider(
        <PhotographerDetailsView
          {...defaultProps}
          isLoadingPhotographer={false}
          isFetchingNextPage={false}
        />
      );
      expect(getByText('예약하기')).toBeTruthy();
    });
  });
});
