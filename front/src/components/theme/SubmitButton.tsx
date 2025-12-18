import { TouchableOpacityProps } from 'react-native';
import styled from '@/utils/scale/CustomStyled';
import { theme } from '@/theme';
import Typography from '@/components/theme/Typography';

type Props = TouchableOpacityProps & {
  text: string;
  width?: number | string;
  disabled?: boolean;
  type?: 'submit' | 'cancel';
  size?: 'small' | 'large';

  marginHorizontal?: number;
  marginVertical?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
}

const StyledSubmitButton = styled.TouchableOpacity<{
  $width: number | string,
  $disabled?: boolean,
  $type?: 'submit' | 'cancel',
  $size?: 'small' | 'large',
  marginHorizontal?: number,
  marginVertical?: number,
  marginTop?: number,
  marginBottom?: number,
  marginLeft?: number,
  marginRight?: number
}>`
  ${({ $width }) => $width === 'auto' ? 'flex: 1' : `width: ${typeof $width === 'string' ? $width : $width+'px'};`};
  height: ${({ $size }) => $size !== undefined && $size === 'small' ? 40 : 49}px;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  background-color: ${({ $disabled, $type }) => ($disabled !== undefined && $disabled) || ($type !== undefined && $type === 'cancel') ? theme.colors.disabled : theme.colors.primary};

  ${({ marginHorizontal }) => marginHorizontal !== undefined ? `margin-horizontal: ${marginHorizontal}px;` : ''}
  ${({ marginVertical }) => marginVertical !== undefined ? `margin-vertical: ${marginVertical}px;` : ''}
  ${({ marginTop }) => marginTop !== undefined ? `margin-top: ${marginTop}px;` : ''}
  ${({ marginBottom }) => marginBottom !== undefined ? `margin-bottom: ${marginBottom}px;` : ''}
  ${({ marginLeft }) => marginLeft !== undefined ? `margin-left: ${marginLeft}px;` : ''}
  ${({ marginRight }) => marginRight !== undefined ? `margin-right: ${marginRight}px;` : ''}
`

export default function SubmitButton({
  text,
  width = 'auto',
  disabled = false,
  type = 'submit',
  size = 'large',
  ...rest
}: Props) {
  return (
    <StyledSubmitButton $width={width} $disabled={disabled} $type={type} $size={size} {...rest}>
      <Typography
        fontWeight="bold"
        fontSize={size === "large" ? 16 : 12}
        letterSpacing={-0.4}
        color={type === 'submit' ? '#fff' : '#000'}
      >
        {text}
      </Typography>
    </StyledSubmitButton>
  );
}