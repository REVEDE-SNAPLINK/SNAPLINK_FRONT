import styled from '@/utils/scale/CustomStyled.ts';
import { theme } from '@/theme';
import Icon from '@/components/ui/Icon.tsx';
import CheckIcon from '@/assets/icons/bi-check.svg'

/**
 * Checkbox Component
 */
const CheckboxWrapper = styled.TouchableOpacity<{ isChecked: boolean; isDisabled?: boolean }>`
  width: 25px;
  height: 25px;
  border-radius: 5px;
  justify-content: center;
  align-items: center;
  border: 1px solid
    ${({ isChecked, isDisabled }) =>
  isChecked ? theme.colors.primary : isDisabled !== undefined && isDisabled ? theme.colors.disabled : '#f4f4f4'};
  ${({ isChecked }) => isChecked && `background-color: ${theme.colors.primary};`};
`;

interface CheckboxProps {
  isChecked: boolean;
  isDisabled?: boolean;
  onPress: () => void;
}

export default function Checkbox ({ isChecked, isDisabled = false, onPress }: CheckboxProps) {
  return (
    <CheckboxWrapper isChecked={isChecked} isDisabled={isDisabled} onPress={onPress}>
      {isChecked && <Icon width={12} height={9} Svg={CheckIcon} />}
    </CheckboxWrapper>
  );
};
