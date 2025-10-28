import styled from "styled-components/native";
import { theme } from '@/constants/theme.ts';
import AppText from '@/components/AppText.tsx';

const SelectWrapper = styled.View`
  flex-direction: row;
  justify-content: space-between;
`

const StyledSelectItem = styled.TouchableOpacity<{ width: number | string, isActive: boolean }>`
  background-color: ${theme.colors.inputBackground};
  border-radius: ${theme.moderateScale(10)}px;
  width: ${({ width }) => typeof width === 'string' ? width : theme.horizontalScale(width)};
  height: ${theme.verticalScale(36)};
  ${({ isActive }) => isActive && 'border: 1px solid ' + theme.colors.primary};
  justify-content: center;
`

interface SelectItemProps {
  width: number | string;
  name: string;
  onPress: () => void;
  isActive: boolean;
}

const SelectItem = ({
  width,
  name,
  onPress,
  isActive,
}: SelectItemProps) => {
  return (
    <StyledSelectItem
      width={width}
      onPress={onPress}
      isActive={isActive}
    >
      <AppText
        color={isActive ? 'black' : '#767676'}
        textAlign="center"
        fontSize={16}
        fontWeight={500}
        lineHeight={20}
      >{name}</AppText>
    </StyledSelectItem>
  )
}

interface SelectProps {
  itemWidth: number | string;
  items: string[];
  value: number | null;
  setValue: (value: number) => void;
}

export default function Select ({
  itemWidth,
  items,
  value,
  setValue,
}: SelectProps)  {
  return (
    <SelectWrapper>
      {items.map((item, idx) => (
        <SelectItem
          key={idx}
          width={itemWidth}
          name={item}
          onPress={() => setValue(idx)}
          isActive={value === idx}
        />
      ))}
    </SelectWrapper>
  )
}