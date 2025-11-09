import { ReactNode } from 'react';
import { TextProps, Text } from 'react-native';
import { styled } from '@/utils/CustomStyled';
import { theme } from '@/theme';
import { fontFamily, fontWeightMap, FontWeight } from '@/theme/tokens/fontFamily';

type Variant = keyof typeof theme.typography;

type Props = TextProps & {
  variant?: Variant;
  color?: string;
  children?: ReactNode;
  fontWeight?: FontWeight;
  fontSize?: number;
  lineHeight?: number | string;
  letterSpacing?: number | string;
}

/**
 * 스타일이 적용된 텍스트 컴포넌트
 * px 값은 자동으로 스케일링됩니다
 */
const StyledText = styled(Text)<{
  $variant: Variant;
  $color: string;
  $fontWeight: FontWeight;
  $fontSize?: number;
  $lineHeight?: number;
  $letterSpacing?: number;
}>`
  font-size: ${({ $variant, $fontSize }) =>
    $fontSize !== undefined ? $fontSize : theme.typography[$variant].fontSize
  }px;
  line-height: ${({ $variant, $lineHeight }) =>
    $lineHeight !== undefined ? $lineHeight : theme.typography[$variant].lineHeight
  }px;
  letter-spacing: ${({ $variant, $letterSpacing }) =>
    $letterSpacing !== undefined ? $letterSpacing : theme.typography[$variant].letterSpacing
  }px;
  font-family: ${({ $fontWeight }) => fontFamily[$fontWeight] || fontFamily.regular};
  font-weight: ${({ $fontWeight }) => fontWeightMap[$fontWeight] || '400'};
  color: ${({ $color }) =>
    $color in theme.colors ? theme.colors[$color as keyof typeof theme.colors] : $color
  };
`;

/**
 * Typography 컴포넌트
 *
 * @example
 * ```tsx
 * // variant 기반 사용
 * <Typography variant="title1" color="aqua" fontWeight={600}>
 *   제목 텍스트
 * </Typography>
 *
 * // Figma 스타일 fontWeight (문자열)
 * <Typography variant="title1" fontWeight="bold">
 *   굵은 텍스트
 * </Typography>
 *
 * <Typography variant="body1" fontWeight="medium">
 *   중간 굵기 텍스트
 * </Typography>
 *
 * // 커스텀 폰트 크기 사용
 * <Typography variant="body1" fontSize={18} lineHeight={24}>
 *   커스텀 크기 텍스트
 * </Typography>
 *
 * // 직접 색상 지정
 * <Typography variant="body1" color="#333333">
 *   본문 텍스트
 * </Typography>
 * ```
 */
export default function Typography({
  variant = 'caption2',
  color = '#000',
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
        ? (fontSize || theme.typography[variant].fontSize) * (parseFloat(lineHeight) / 100)
        : typeof lineHeight === 'string'
        ? parseFloat(lineHeight)
        : lineHeight)
    : undefined;

  // letterSpacing을 퍼센트에서 숫자로 변환
  const processedLetterSpacing = letterSpacing !== undefined
    ? (typeof letterSpacing === 'string' && letterSpacing.includes('%')
        ? (fontSize || theme.typography[variant].fontSize) * (parseFloat(letterSpacing) / 100)
        : typeof letterSpacing === 'string'
        ? parseFloat(letterSpacing)
        : letterSpacing)
    : undefined;

  return (
    <StyledText
      $variant={variant}
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
