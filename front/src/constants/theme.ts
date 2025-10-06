import { Platform } from 'react-native';

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
  fontFamily: {
    100: 'Pretendard-Thin',
    200: 'Pretendard-ExtraLight',
    300: 'Pretendard-Light',
    400: 'Pretendard-Regular',
    500: 'Pretendard-Medium',
    600: 'Pretendard-Bold',
    700: 'Pretendard-SemiBold',
    800: 'Pretendard-ExtraLight',
    900: 'Pretendard-Black',
  },
  size: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 22,
  }
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

export const theme = {
  colors,
  typography
}

export type Theme = typeof theme;