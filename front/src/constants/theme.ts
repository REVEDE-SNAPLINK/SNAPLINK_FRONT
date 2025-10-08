import { Platform } from 'react-native';
import { scale as s, verticalScale as vs, moderateScale as ms } from 'react-native-size-matters';

export const colors = {
  // Brand
  primary: '#54C1A1',
  secondary: '#30B090',
  tertiary: '#333D49',

  // Surfaces
  background: '#FFFFFF',
  formBackground: '#F4F4F4',
  inputBackground: '#EAEAEA',
  selected: '#ECECEC',
  disabled: '#A4A4A4',

  // Text
  textPrimary: '#000000',
  textSecondary: '#646161',

  // Placeholders
  placeholder: '#767676',
  placeholderDim: '#545454',

  // etc
  yellow: '#FFB23F',
  red: '#E84E4E',
  shadow: 'rgba(0, 0, 0, 0.08)',
}

const typography = {
  size: {
    xs: ms(10),
    sm: ms(12),
    md: ms(14),
    lg: ms(16),
    xl: ms(22),
    xxl: ms(40),
  },
  lineHeight: {
    xs: ms(14),
    sm: ms(16),
    md: ms(20),
    lg: ms(22),
    xl: ms(28),
    xxl: ms(48),
  },
  byWeightNumber: {
    100: 'Pretendard-Thin',
    200: 'Pretendard-ExtraLight',
    300: 'Pretendard-Light',
    400: 'Pretendard-Regular',
    500: 'Pretendard-Medium',
    600: 'Pretendard-SemiBold',
    700: 'Pretendard-Bold',
    800: 'Pretendard-ExtraBold',
    900: 'Pretendard-Black',
  } as const,
}

export const boxShadow = {
  default: {
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3, // Android equivalent
  },
  // Platform 헬퍼 (iOS / Android 대응)
  get: (custom?: Partial<{ width: number; height: number; blur: number; opacity: number }>) => {
    const { width = 3, height = 3, blur = 8, opacity = 0.08 } = custom || {};
    return Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 1)',
        shadowOffset: { width, height },
        shadowOpacity: opacity,
        shadowRadius: blur,
      },
      android: {
        elevation: Math.round(blur / 2),
      },
    });
  },
};

const spacing = {
  xs: s(4),
  sm: s(8),
  md: s(16),
  lg: s(24),
  xl: s(32),
};

const radius = {
  sm: s(6),
  md: s(10),
  lg: s(16),
};

export const theme = {
  colors,
  typography,
  spacing,
  radius,

  // ✅ 가로 방향(Width 기반) 비율 조정
  // - 예: 버튼의 가로 길이, 좌우 마진, 텍스트의 가로 간격 등
  // - 기준 디바이스(예: iPhone X, width 375) 대비 비율로 크기를 자동 조정
  scale: s,

  // ✅ 세로 방향(Height 기반) 비율 조정
  // - 예: 이미지 높이, 상하 마진, 세로 패딩 등
  // - 화면 높이에 따라 비율로 크기를 조정
  verticalScale: vs,

  // ✅ 중간 비율 조정 (scale과의 절충)
  // - 예: 폰트 크기, 아이콘 크기 등 "너무 커지거나 작아지면 안 되는" 요소
  // - 두 축의 비율 차이를 완화해 자연스러운 스케일링
  moderateScale: ms,
}

export type Theme = typeof theme;