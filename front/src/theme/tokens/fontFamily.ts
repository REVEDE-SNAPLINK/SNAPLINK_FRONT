/**
 * 폰트 패밀리 및 weight 정의
 * 숫자 또는 문자열 키로 접근 가능
 */
export const fontFamily = {
  // 숫자 기반 (CSS 표준)
  100: 'Pretendard-Thin',
  200: 'Pretendard-ExtraLight',
  300: 'Pretendard-Light',
  400: 'Pretendard-Regular',
  500: 'Pretendard-Medium',
  600: 'Pretendard-SemiBold',
  700: 'Pretendard-Bold',
  800: 'Pretendard-ExtraBold',
  900: 'Pretendard-Black',

  // 문자열 기반 (Figma 스타일)
  thin: 'Pretendard-Thin',
  extraLight: 'Pretendard-ExtraLight',
  light: 'Pretendard-Light',
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semiBold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
  extraBold: 'Pretendard-ExtraBold',
  black: 'Pretendard-Black',
} as const;

/**
 * FontWeight 문자열을 숫자로 매핑
 * React Native에서 fontWeight 속성 값으로 사용
 */
export const fontWeightMap = {
  100: '100',
  200: '200',
  300: '300',
  400: '400',
  500: '500',
  600: '600',
  700: '700',
  800: '800',
  900: '900',
  thin: '100',
  extraLight: '200',
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
  black: '900',
} as const;

/**
 * FontWeight 타입: 숫자 또는 문자열
 */
export type FontWeight = keyof typeof fontFamily;