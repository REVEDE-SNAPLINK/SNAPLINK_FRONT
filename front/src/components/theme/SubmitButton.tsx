import { TouchableOpacityProps } from 'react-native';
import { styled } from '@/utils/CustomStyled';
import { theme } from '@/theme';
import Typography from '@/components/theme/Typography';

type Props = TouchableOpacityProps & {
  text: string;
  width?: number | string;
  disabled?: boolean;
  type?: 'submit' | 'cancel';
  size?: 'small' | 'large';
}

const StyledSubmitButton = styled.TouchableOpacity<{ $width: number | string, $disabled?: boolean, $type?: 'submit' | 'cancel', $size?: 'small' | 'large' }>`
  width: ${({ $width }) => typeof $width === 'string' ? $width : $width+'px'};
  height: ${({ $size }) => $size !== undefined && $size === 'small' ? 40 : 49}px;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  background-color: ${({ $disabled, $type }) => ($disabled !== undefined && $disabled) || ($type !== undefined && $type === 'cancel') ? theme.colors.disabled : theme.colors.primary};
`

export default function SubmitButton({
  text,
  width = '100%',
  disabled = false,
  type = 'submit',
  size = 'large',
  ...rest
}: Props) {
  return (
    <StyledSubmitButton $width={width} $disabled={disabled} $type={type} $size={size} {...rest}>
      <Typography
        fontWeight="bold"
        fontSize={16}
        letterSpacing={-0.4}
        color={type === 'submit' ? '#fff' : '#000'}
      >
        {text}
      </Typography>
    </StyledSubmitButton>
  );
}