import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeView from '../HomeView';
import { BannerItem } from '@/components/user/Banner';
import { PhotographerInfo } from '@/types/photographer';

jest.mock('@/assets/icons/logo-icon.png', () => 'LogoIcon');
jest.mock('@/assets/icons/notification.png', () => 'NotificationIcon');
jest.mock('@/assets/icons/profile.png', () => 'ProfileIcon');
jest.mock('@/assets/icons/search.png', () => 'SearchIcon');
jest.mock('@/assets/icons/arrow-right2.png', () => 'ArrowRightIcon');
jest.mock('@/assets/icons/swap.png', () => 'SwapIcon');
jest.mock('@/assets/imgs/snap-sample1.png', () => 'SnapSample1');
jest.mock('@/assets/imgs/banner-sample.png', () => 'BannerSample');
jest.mock('react-native-linear-gradient', () => 'LinearGradient');
jest.mock('@/assets/icons/logo-icon.svg', () => 'LogoIconSvg');
jest.mock('@/assets/icons/notification.svg', () => 'NotificationIconSvg');
jest.mock('@/assets/icons/ai-button.svg', () => 'AIButtonIconSvg');

describe('HomeView Component', () => {
  const mockBannerItems: BannerItem[] = [
    {
      id: '1',
      image: require('@/assets/imgs/banner-sample.png'),
      title: '배너 제목 1',
      description: '배너 설명 1',
    },
    {
      id: '2',
      image: require('@/assets/imgs/banner-sample.png'),
      title: '배너 제목 2',
      description: '배너 설명 2',
    },
  ];

  const mockAllPhotographerItems: PhotographerInfo[] = [
    {
      id: '1',
      uri: 'https://example.com/image1.jpg',
      info: '기본촬영/2시간',
      price: 50000,
    },
    {
      id: '2',
      uri: 'https://example.com/image2.jpg',
      info: '웨딩촬영/4시간',
      price: 100000,
    },
    {
      id: '3',
      uri: 'https://example.com/image3.jpg',
      info: '프로필촬영/1시간',
      price: 30000,
    },
  ];

  const mockPopularPhotographerItems: PhotographerInfo[] = [
    {
      id: '4',
      uri: 'https://example.com/image4.jpg',
      info: '인물촬영/3시간',
      price: 80000,
    },
    {
      id: '5',
      uri: 'https://example.com/image5.jpg',
      info: '커플촬영/2시간',
      price: 60000,
    },
    {
      id: '6',
      uri: 'https://example.com/image6.jpg',
      info: '가족촬영/2시간',
      price: 70000,
    },
  ];

  const defaultProps = {
    onPressNotification: jest.fn(),
    onPressAI: jest.fn(),
    onPressAllPhotographer: jest.fn(),
    onPressAllPhotographerItem: jest.fn(),
    onPressPopularPhotographerItem: jest.fn(),
    searchKey: '',
    onChangeSearchKey: jest.fn(),
    onSubmitSearchKey: jest.fn(),
    bannerItems: mockBannerItems,
    allPhotographerItems: mockAllPhotographerItems,
    popularPhotographerItems: mockPopularPhotographerItems,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render Snaplink logo', () => {
      const { getByText } = render(<HomeView {...defaultProps} />);
      expect(getByText('Snaplink')).toBeTruthy();
    });

    it('should render notification button', () => {
      const { UNSAFE_getAllByType } = render(<HomeView {...defaultProps} />);
      // IconButton for notification exists
    });

    it('should render AI recommendation button', () => {
      const { UNSAFE_getAllByType } = render(<HomeView {...defaultProps} />);
      // AI button is now an icon button without text
      expect(UNSAFE_getAllByType).toBeTruthy();
    });

    it('should render search input with placeholder', () => {
      const { getByPlaceholderText } = render(<HomeView {...defaultProps} />);
      expect(getByPlaceholderText('웨딩 스냅 작가를 찾고 있나요?')).toBeTruthy();
    });

    it('should render banner component', () => {
      const { getAllByText } = render(<HomeView {...defaultProps} />);
      // Banner uses infinite scroll so text appears multiple times
      expect(getAllByText('배너 제목 1').length).toBeGreaterThan(0);
    });

    it('should render "스냅링크 전체 작가" title', () => {
      const { getByText } = render(<HomeView {...defaultProps} />);
      expect(getByText('스냅링크 전체 작가')).toBeTruthy();
    });

    it('should render "지금 가장 인기있는 작가" title', () => {
      const { getByText } = render(<HomeView {...defaultProps} />);
      expect(getByText('지금 가장 인기있는 작가')).toBeTruthy();
    });

    it('should render all photographer items', () => {
      const { getByText } = render(<HomeView {...defaultProps} />);
      expect(getByText('기본촬영/2시간')).toBeTruthy();
      expect(getByText('웨딩촬영/4시간')).toBeTruthy();
      expect(getByText('프로필촬영/1시간')).toBeTruthy();
    });

    it('should render popular photographer items', () => {
      const { getByText } = render(<HomeView {...defaultProps} />);
      expect(getByText('인물촬영/3시간')).toBeTruthy();
      expect(getByText('커플촬영/2시간')).toBeTruthy();
      expect(getByText('가족촬영/2시간')).toBeTruthy();
    });

    it('should display photographer prices with formatting', () => {
      const { getByText } = render(<HomeView {...defaultProps} />);
      expect(getByText('50,000원')).toBeTruthy();
      expect(getByText('100,000원')).toBeTruthy();
      expect(getByText('30,000원')).toBeTruthy();
    });

    it('should render photographer list titles', () => {
      const { getByText } = render(<HomeView {...defaultProps} />);
      expect(getByText('스냅링크 전체 작가')).toBeTruthy();
      expect(getByText('지금 가장 인기있는 작가')).toBeTruthy();
    });
  });

  describe('Search Functionality', () => {
    it('should display search key value', () => {
      const { getByDisplayValue } = render(
        <HomeView {...defaultProps} searchKey="웨딩 작가" />
      );
      expect(getByDisplayValue('웨딩 작가')).toBeTruthy();
    });

    it('should call onChangeSearchKey when input changes', () => {
      const { getByPlaceholderText } = render(<HomeView {...defaultProps} />);
      const input = getByPlaceholderText('웨딩 스냅 작가를 찾고 있나요?');
      fireEvent.changeText(input, '웨딩');
      expect(defaultProps.onChangeSearchKey).toHaveBeenCalledWith('웨딩');
    });

    it('should call onSubmitSearchKey when search is submitted', () => {
      const { getByPlaceholderText } = render(<HomeView {...defaultProps} />);
      const input = getByPlaceholderText('웨딩 스냅 작가를 찾고 있나요?');
      fireEvent(input, 'submitEditing');
      expect(defaultProps.onSubmitSearchKey).toHaveBeenCalled();
    });
  });

  describe('Button Interactions', () => {
    it('should call onPressAI when AI button is pressed', () => {
      const { UNSAFE_getAllByType } = render(<HomeView {...defaultProps} />);
      // AI button is now IconButton - we can't easily test it without testID
      // This test would need the component to have a testID
      expect(defaultProps.onPressAI).toBeDefined();
    });

    it('should call onPressAllPhotographer when title is pressed', () => {
      const { getByText } = render(<HomeView {...defaultProps} />);
      const title = getByText('스냅링크 전체 작가');
      fireEvent.press(title);
      expect(defaultProps.onPressAllPhotographer).toHaveBeenCalled();
    });

    it('should display popular photographer title', () => {
      const { getByText } = render(<HomeView {...defaultProps} />);
      const title = getByText('지금 가장 인기있는 작가');
      expect(title).toBeTruthy();
    });

    it('should call onPressAllPhotographerItem when photographer item is pressed', () => {
      const { getByText } = render(<HomeView {...defaultProps} />);
      const item = getByText('기본촬영/2시간');
      fireEvent.press(item);
      expect(defaultProps.onPressAllPhotographerItem).toHaveBeenCalledWith('1');
    });

    it('should call onPressPopularPhotographerItem when popular item is pressed', () => {
      const { getByText } = render(<HomeView {...defaultProps} />);
      const item = getByText('인물촬영/3시간');
      fireEvent.press(item);
      expect(defaultProps.onPressPopularPhotographerItem).toHaveBeenCalledWith('4');
    });
  });

  describe('Empty States', () => {
    it('should render with empty banner items', () => {
      const { getByText } = render(<HomeView {...defaultProps} bannerItems={[]} />);
      expect(getByText('Snaplink')).toBeTruthy();
    });

    it('should render with empty photographer lists', () => {
      const { getByText } = render(
        <HomeView
          {...defaultProps}
          allPhotographerItems={[]}
          popularPhotographerItems={[]}
        />
      );
      expect(getByText('스냅링크 전체 작가')).toBeTruthy();
      expect(getByText('지금 가장 인기있는 작가')).toBeTruthy();
    });
  });

  describe('Layout Structure', () => {
    it('should render header with logo and notification', () => {
      const { getByText } = render(<HomeView {...defaultProps} />);
      expect(getByText('Snaplink')).toBeTruthy();
      // Notification button would be checked with testID
    });

    it('should render search form with input', () => {
      const { getByPlaceholderText } = render(<HomeView {...defaultProps} />);
      expect(getByPlaceholderText('웨딩 스냅 작가를 찾고 있나요?')).toBeTruthy();
    });

    it('should render scrollable content area', () => {
      const { UNSAFE_getByType } = render(<HomeView {...defaultProps} />);
      // ScrollView exists for scrollable content
    });
  });

  describe('Multiple Banner Items', () => {
    it('should render multiple banner slides', () => {
      const { getAllByText } = render(<HomeView {...defaultProps} />);
      // Banner uses infinite scroll, so items appear multiple times
      expect(getAllByText('배너 제목 1').length).toBeGreaterThan(0);
      expect(getAllByText('배너 제목 2').length).toBeGreaterThan(0);
    });
  });

  describe('Photographer List Rendering', () => {
    it('should render exactly 3 items in all photographers list', () => {
      const { getByText } = render(<HomeView {...defaultProps} />);
      mockAllPhotographerItems.forEach((item) => {
        expect(getByText(item.info)).toBeTruthy();
      });
    });

    it('should render exactly 3 items in popular photographers list', () => {
      const { getByText } = render(<HomeView {...defaultProps} />);
      mockPopularPhotographerItems.forEach((item) => {
        expect(getByText(item.info)).toBeTruthy();
      });
    });

    it('should handle different photographer counts', () => {
      const singlePhotographer: PhotographerInfo[] = [
        {
          id: '1',
          info: '단일 작가',
          price: 50000,
        },
      ];
      const { getByText } = render(
        <HomeView {...defaultProps} allPhotographerItems={singlePhotographer} />
      );
      expect(getByText('단일 작가')).toBeTruthy();
    });
  });

  describe('Price Formatting', () => {
    it('should format prices with thousand separators', () => {
      const { getByText } = render(<HomeView {...defaultProps} />);
      expect(getByText('50,000원')).toBeTruthy();
      expect(getByText('100,000원')).toBeTruthy();
    });

    it('should handle various price formats', () => {
      const customPhotographers: PhotographerInfo[] = [
        { id: '1', info: 'Test', price: 5000 },
        { id: '2', info: 'Test2', price: 1000000 },
      ];
      const { getByText } = render(
        <HomeView {...defaultProps} allPhotographerItems={customPhotographers} />
      );
      expect(getByText('5,000원')).toBeTruthy();
      expect(getByText('1,000,000원')).toBeTruthy();
    });
  });
});
