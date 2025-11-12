import styled from '@/utils/scale/CustomStyled';
import Icon, { IconProps } from '@/components/Icon';

type IconButtonProps = IconProps & {
  onPress: () => void;
  disabled?: boolean;
};

const ButtonWrapper = styled.TouchableOpacity`
  align-items: center;
  justify-content: center;
`;

export default function IconButton({ onPress, disabled = false, ...iconProps }: IconButtonProps) {
  return (
    <ButtonWrapper onPress={onPress} disabled={disabled} activeOpacity={0.7}>
      <Icon {...iconProps} />
    </ButtonWrapper>
  );
}