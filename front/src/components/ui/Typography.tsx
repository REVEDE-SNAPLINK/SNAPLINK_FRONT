import { ReactNode } from 'react';
import { TextProps, Text } from 'react-native';
import styled from '@/utils/scale/CustomStyled';
import { theme } from '@/theme';
import { fontFamily, fontWeightMap, FontWeight } from '@/theme/tokens/fontFamily';

type Props = TextProps & {
  color?: string;
  children?: ReactNode;
  fontWeight?: FontWeight;
  fontSize?: number;
  lineHeight?: number | string;
  letterSpacing?: number | string;
  marginHorizontal?: number;
  marginVertical?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
}

/**
 * 스타일이 적용된 텍스트 컴포넌트
 * px 값은 자동으로 스케일링됩니다
 */
const StyledText = styled(Text)<{
  $color: string;
  $fontWeight: FontWeight;
  $fontSize?: number;
  $lineHeight?: number;
  $letterSpacing?: number;
  marginHorizontal?: number;
  marginVertical?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
}>`
  ${({ $fontSize }) => $fontSize !== undefined ? `font-size: ${$fontSize * 1.1}px;` : ''}
  ${({ $lineHeight }) => $lineHeight !== undefined ? `line-height: ${$lineHeight * 1.1}px;` : ''}
  ${({ $letterSpacing }) => $letterSpacing !== undefined ? `letter-spacing: ${$letterSpacing}px;` : ''}
  font-family: ${({ $fontWeight }) => fontFamily[$fontWeight] || fontFamily.regular};
  font-weight: ${({ $fontWeight }) => Number(fontWeightMap[$fontWeight]) || 400};
  color: ${({ $color }) =>
    $color in theme.colors ? theme.colors[$color as keyof typeof theme.colors] : $color
  };
  ${({ marginHorizontal }) => marginHorizontal !== undefined ? `margin-horizontal: ${marginHorizontal}px;` : ''}
  ${({ marginVertical }) => marginVertical !== undefined ? `margin-vertical: ${marginVertical}px;` : ''}
  ${({ marginTop }) => marginTop !== undefined ? `margin-top: ${marginTop}px;` : ''}
  ${({ marginBottom }) => marginBottom !== undefined ? `margin-bottom: ${marginBottom}px;` : ''}
  ${({ marginLeft }) => marginLeft !== undefined ? `margin-left: ${marginLeft}px;` : ''}
  ${({ marginRight }) => marginRight !== undefined ? `margin-right: ${marginRight}px;` : ''}
`;

/**
 * Typography 컴포넌트
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <Typography fontSize={16} color="aqua" fontWeight="semibold">
 *   제목 텍스트
 * </Typography>
 *
 * // 커스텀 폰트 크기와 lineHeight
 * <Typography fontSize={18} lineHeight={24}>
 *   커스텀 크기 텍스트
 * </Typography>
 *
 * // 퍼센트 기반 lineHeight
 * <Typography fontSize={14} lineHeight="140%">
 *   본문 텍스트
 * </Typography>
 *
 * // 직접 색상 지정
 * <Typography fontSize={14} color="#333333">
 *   본문 텍스트
 * </Typography>
 * ```
 */
export default function Typography({
  color = 'textPrimary',
  fontWeight = 'regular',
  fontSize,
  lineHeight,
  letterSpacing,
  children,
  ...rest
}: Props) {
  // lineHeight를 퍼센트에서 숫자로 변환
  const processedLineHeight = lineHeight !== undefined
    ? (typeof lineHeight === 'string' && lineHeight.includes('%')
        ? fontSize ? fontSize * (parseFloat(lineHeight) / 100) : undefined
        : typeof lineHeight === 'string'
        ? parseFloat(lineHeight)
        : lineHeight)
    : undefined;

  // letterSpacing을 퍼센트에서 숫자로 변환
  const processedLetterSpacing = letterSpacing !== undefined
    ? (typeof letterSpacing === 'string' && letterSpacing.includes('%')
        ? fontSize ? fontSize * (parseFloat(letterSpacing) / 100) : undefined
        : typeof letterSpacing === 'string'
        ? parseFloat(letterSpacing)
        : letterSpacing)
    : undefined;

  return (
    <StyledText
      $color={color}
      $fontWeight={fontWeight}
      $fontSize={fontSize}
      $lineHeight={processedLineHeight}
      $letterSpacing={processedLetterSpacing}
      {...rest}
    >
      {children}
    </StyledText>
  );
}
