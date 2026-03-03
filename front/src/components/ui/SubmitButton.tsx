import { TouchableOpacityProps } from 'react-native';
import styled from '@/utils/scale/CustomStyled';
import { theme } from '@/theme';
import Typography from '@/components/ui/Typography';

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

  position?: 'absolute' | 'relative';
  bottom?: number;
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
  marginRight?: number,
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

const SubmitButtonWrapper = styled.View<{ bottom?: number }>`
  align-items: center;
  width: 100%;
  position: absolute;
  left: 0;
  bottom: ${({ bottom }) => bottom !== undefined && `${bottom}px;`};
`

export default function SubmitButton({
  text,
  width = 'auto',
  disabled = false,
  type = 'submit',
  size = 'large',
  position = 'relative',
  bottom,
  ...rest
}: Props) {
  const SubmitButtonElement = (
    <StyledSubmitButton $width={width} $disabled={disabled} $type={type} $size={size} {...rest} disabled={disabled}>
      <Typography
        fontWeight="bold"
        fontSize={size === "large" ? 16 : 12}
        letterSpacing={-0.4}
        color={type === 'submit' && !disabled ? '#fff' : '#000'}
      >
        {text}
      </Typography>
    </StyledSubmitButton>
  );

  if (position === 'absolute') {
    return (
      <SubmitButtonWrapper bottom={bottom}>
        {SubmitButtonElement}
      </SubmitButtonWrapper>
    )
  }

  return SubmitButtonElement;
}