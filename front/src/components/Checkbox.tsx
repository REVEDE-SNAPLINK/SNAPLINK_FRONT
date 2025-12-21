import styled from '@/utils/scale/CustomStyled.ts';
import { theme } from '@/theme';
import Icon from '@/components/Icon.tsx';
import ConsentIcon from '@/assets/icons/consent.svg';

/**
 * Checkbox Component
 */
const CheckboxWrapper = styled.TouchableOpacity<{ isChecked: boolean; isDisabled?: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 2px;
  justify-content: center;
  align-items: center;
  border: 1px solid
    ${({ isChecked, isDisabled }) =>
  isChecked ? theme.colors.primary : isDisabled !== undefined && isDisabled ? theme.colors.disabled : '#f4f4f4'};
`;

interface CheckboxProps {
  isChecked: boolean;
  isDisabled?: boolean;
  onPress: () => void;
}

export default function Checkbox ({ isChecked, isDisabled = false, onPress }: CheckboxProps) {
  return (
    <CheckboxWrapper isChecked={isChecked} isDisabled={isDisabled} onPress={onPress}>
      {isChecked && <Icon width={15} height={15} Svg={ConsentIcon} />}
    </CheckboxWrapper>
  );
};
