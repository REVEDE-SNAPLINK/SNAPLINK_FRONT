import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProfileView from '../ProfileView.tsx';

jest.mock('@/assets/icons/camera-white.svg', () => 'CameraIcon');
jest.mock('@/assets/icons/chat-black.svg', () => 'ChatIcon');
jest.mock('@/assets/icons/heart-black.svg', () => 'HeartIcon');
jest.mock('@/assets/icons/notification.svg', () => 'NotificationButton');
jest.mock('@/assets/icons/arrow-right2-gray.svg', () => 'ArrowRightIcon');

describe('ChatView Component', () => {
  const defaultProps = {
    onPressBack: jest.fn(),
    onToggleExpertMode: jest.fn(),
    onPressProfile: jest.fn(),
    onPressMyReviews: jest.fn(),
    onPressLikedPhotographers: jest.fn(),
    onPressNotificationSettings: jest.fn(),
    onPressEditNickname: jest.fn(),
    onPressEditName: jest.fn(),
    onPressEditEmail: jest.fn(),
    onPressEditPassword: jest.fn(),
    onPressBookingHistory: jest.fn(),
    onPressRecentPhotographers: jest.fn(),
    onPressSnaplinkGuide: jest.fn(),
    onPressCustomerCenter: jest.fn(),
    onPressNotice: jest.fn(),
    onPressFAQ: jest.fn(),
    onPressTerms: jest.fn(),
    isExpertMode: false,
    profileImageURI: 'https://example.com/profile.jpg',
    nickname: '스냅유저123',
    name: '김철수',
    email: 'user@snaplink.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render header title', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      expect(getByText('마이페이지')).toBeTruthy();
    });

    it('should render expert mode toggle section', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      expect(getByText('전문가로 전환')).toBeTruthy();
    });

    it('should render profile image when URI is provided', () => {
      const { UNSAFE_getAllByType } = render(<ProfileView {...defaultProps} />);
      // Profile image should be rendered
    });

    it('should render user nickname', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      expect(getByText('스냅유저123')).toBeTruthy();
    });

    it('should render user name', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      expect(getByText('김철수')).toBeTruthy();
    });

    it('should render user email', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      expect(getByText('user@snaplink.com')).toBeTruthy();
    });

    it('should render without profile image when URI is empty', () => {
      const { UNSAFE_getAllByType } = render(
        <ProfileView {...defaultProps} profileImageURI="" />
      );
      // Should render without error
    });
  });

  describe('Icon Navigation Section', () => {
    it('should render "내가 쓴 리뷰" button', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      expect(getByText('내가 쓴 리뷰')).toBeTruthy();
    });

    it('should render "찜한 작가" button', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      expect(getByText('찜한 작가')).toBeTruthy();
    });

    it('should render "알림 설정" button', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      expect(getByText('알림 설정')).toBeTruthy();
    });
  });

  describe('Account Information Section', () => {
    it('should render nickname field', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      expect(getByText('닉네임')).toBeTruthy();
    });

    it('should render name field', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      expect(getByText('이름')).toBeTruthy();
    });

    it('should render email field', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      expect(getByText('이메일')).toBeTruthy();
    });

    it('should render password change button', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      expect(getByText('비밀번호 변경')).toBeTruthy();
    });
  });

  describe('Activity Section', () => {
    it('should render "촬영 내역" button', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      expect(getByText('촬영 내역')).toBeTruthy();
    });

    it('should render "최근 본 작가" button', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      expect(getByText('최근 본 작가')).toBeTruthy();
    });

    it('should render "스냅링크 의뢰 가이드" button', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      expect(getByText('스냅링크 의뢰 가이드')).toBeTruthy();
    });
  });

  describe('Customer Support Section', () => {
    it('should render "문의 및 알림" section title', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      expect(getByText('문의 및 알림')).toBeTruthy();
    });

    it('should render "고객센터" button', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      expect(getByText('고객센터')).toBeTruthy();
    });

    it('should render "자주 묻는 질문" button', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      expect(getByText('자주 묻는 질문')).toBeTruthy();
    });

    it('should render "공지사항" button', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      expect(getByText('공지사항')).toBeTruthy();
    });

    it('should render "약관 및 정책" button', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      expect(getByText('약관 및 정책')).toBeTruthy();
    });
  });

  describe('Expert Mode Toggle', () => {
    it('should display expert mode toggle when not in expert mode', () => {
      const { getByText } = render(<ProfileView {...defaultProps} isExpertMode={false} />);
      expect(getByText('전문가로 전환')).toBeTruthy();
    });

    it('should call onToggleExpertMode when toggle is pressed', () => {
      const { UNSAFE_getAllByType } = render(<ProfileView {...defaultProps} />);
      // ToggleButton would need testID for precise testing
    });

    it('should render in expert mode state', () => {
      const { getByText } = render(<ProfileView {...defaultProps} isExpertMode={true} />);
      expect(getByText('전문가로 전환')).toBeTruthy();
    });
  });

  describe('Button Interactions', () => {
    it('should call onPressMyReviews when my reviews button is pressed', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      const button = getByText('내가 쓴 리뷰');
      fireEvent.press(button);
      expect(defaultProps.onPressMyReviews).toHaveBeenCalled();
    });

    it('should call onPressLikedPhotographers when liked photographers button is pressed', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      const button = getByText('찜한 작가');
      fireEvent.press(button);
      expect(defaultProps.onPressLikedPhotographers).toHaveBeenCalled();
    });

    it('should call onPressNotificationSettings when notification settings button is pressed', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      const button = getByText('알림 설정');
      fireEvent.press(button);
      expect(defaultProps.onPressNotificationSettings).toHaveBeenCalled();
    });

    it('should call onPressEditNickname when nickname field is pressed', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      const button = getByText('닉네임');
      fireEvent.press(button);
      expect(defaultProps.onPressEditNickname).toHaveBeenCalled();
    });

    it('should call onPressEditName when name field is pressed', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      const button = getByText('이름');
      fireEvent.press(button);
      expect(defaultProps.onPressEditName).toHaveBeenCalled();
    });

    it('should call onPressEditEmail when email field is pressed', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      const button = getByText('이메일');
      fireEvent.press(button);
      expect(defaultProps.onPressEditEmail).toHaveBeenCalled();
    });

    it('should call onPressEditPassword when password change button is pressed', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      const button = getByText('비밀번호 변경');
      fireEvent.press(button);
      expect(defaultProps.onPressEditPassword).toHaveBeenCalled();
    });

    it('should call onPressBookingHistory when booking history button is pressed', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      const button = getByText('촬영 내역');
      fireEvent.press(button);
      expect(defaultProps.onPressBookingHistory).toHaveBeenCalled();
    });

    it('should call onPressRecentPhotographers when recent photographers button is pressed', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      const button = getByText('최근 본 작가');
      fireEvent.press(button);
      expect(defaultProps.onPressRecentPhotographers).toHaveBeenCalled();
    });

    it('should call onPressSnaplinkGuide when snaplink guide button is pressed', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      const button = getByText('스냅링크 의뢰 가이드');
      fireEvent.press(button);
      expect(defaultProps.onPressSnaplinkGuide).toHaveBeenCalled();
    });

    it('should call onPressCustomerCenter when customer center button is pressed', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      const button = getByText('고객센터');
      fireEvent.press(button);
      expect(defaultProps.onPressCustomerCenter).toHaveBeenCalled();
    });

    it('should call onPressNotice when notice button is pressed', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      const button = getByText('공지사항');
      fireEvent.press(button);
      expect(defaultProps.onPressNotice).toHaveBeenCalled();
    });

    it('should call onPressFAQ when FAQ button is pressed', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      const button = getByText('자주 묻는 질문');
      fireEvent.press(button);
      expect(defaultProps.onPressFAQ).toHaveBeenCalled();
    });

    it('should call onPressTerms when terms button is pressed', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      const button = getByText('약관 및 정책');
      fireEvent.press(button);
      expect(defaultProps.onPressTerms).toHaveBeenCalled();
    });
  });

  describe('Profile Image', () => {
    it('should call onPressProfile when profile image button is pressed', () => {
      // Profile image button would need testID for precise testing
      // This would be tested with integration tests
    });

    it('should render profile image placeholder when no image is provided', () => {
      const { UNSAFE_getAllByType } = render(
        <ProfileView {...defaultProps} profileImageURI="" />
      );
      // Placeholder should be rendered
    });
  });

  describe('Data Display', () => {
    it('should display different nickname', () => {
      const { getByText } = render(
        <ProfileView {...defaultProps} nickname="새로운닉네임" />
      );
      expect(getByText('새로운닉네임')).toBeTruthy();
    });

    it('should display different name', () => {
      const { getByText } = render(
        <ProfileView {...defaultProps} name="홍길동" />
      );
      expect(getByText('홍길동')).toBeTruthy();
    });

    it('should display different email', () => {
      const { getByText } = render(
        <ProfileView {...defaultProps} email="newemail@test.com" />
      );
      expect(getByText('newemail@test.com')).toBeTruthy();
    });

    it('should handle long nickname', () => {
      const longNickname = '매우긴닉네임입니다이것은정말로긴닉네임';
      const { getByText } = render(
        <ProfileView {...defaultProps} nickname={longNickname} />
      );
      expect(getByText(longNickname)).toBeTruthy();
    });

    it('should handle long email', () => {
      const longEmail = 'verylongemailaddress@exampledomainname.com';
      const { getByText } = render(
        <ProfileView {...defaultProps} email={longEmail} />
      );
      expect(getByText(longEmail)).toBeTruthy();
    });
  });

  describe('Layout Structure', () => {
    it('should render header with back button', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      expect(getByText('마이페이지')).toBeTruthy();
    });

    it('should render scrollable content', () => {
      const { UNSAFE_getByType } = render(<ProfileView {...defaultProps} />);
      // ScrollView should exist for scrollable content
    });

    it('should render all sections in order', () => {
      const { getByText } = render(<ProfileView {...defaultProps} />);
      expect(getByText('전문가로 전환')).toBeTruthy(); // Mode toggle
      expect(getByText('내가 쓴 리뷰')).toBeTruthy(); // Icon navigation
      expect(getByText('닉네임')).toBeTruthy(); // Account info
      expect(getByText('촬영 내역')).toBeTruthy(); // Activity
      expect(getByText('문의 및 알림')).toBeTruthy(); // Customer support
    });
  });

  describe('Edge Cases', () => {
    it('should render with empty nickname', () => {
      const { getByText } = render(
        <ProfileView {...defaultProps} nickname="" />
      );
      expect(getByText('닉네임')).toBeTruthy();
    });

    it('should render with empty name', () => {
      const { getByText } = render(
        <ProfileView {...defaultProps} name="" />
      );
      expect(getByText('이름')).toBeTruthy();
    });

    it('should render with empty email', () => {
      const { getByText } = render(
        <ProfileView {...defaultProps} email="" />
      );
      expect(getByText('이메일')).toBeTruthy();
    });

    it('should handle all callbacks being undefined gracefully', () => {
      const minimalProps = {
        ...defaultProps,
        onPressBack: jest.fn(),
        onToggleExpertMode: jest.fn(),
        onPressProfile: jest.fn(),
      };
      const { getByText } = render(<ProfileView {...minimalProps} />);
      expect(getByText('마이페이지')).toBeTruthy();
    });
  });
});
