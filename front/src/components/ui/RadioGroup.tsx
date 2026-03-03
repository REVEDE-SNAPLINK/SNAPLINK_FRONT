import { memo } from 'react';
import styled from '@/utils/scale/CustomStyled.ts';
import { theme } from '@/theme';
import Typography from '@/components/ui/Typography.tsx';

export interface RadioOption<T = string | number> {
  label: string;
  value: T;
}

interface RadioGroupProps<T = string | number> {
  options: RadioOption<T>[];
  value?: T;
  onChange?: (value: T) => void;
}

const RadioOptionWrapper = styled.Pressable`
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
`;

const RadioIndicator = styled.View`
  width: 25px;
  height: 25px;
  border-radius: 25px;
  border: 1px solid #E9E9E9;
  justify-content: center;
  align-items: center;
`;

const RadioDot = styled.View`
  width: 15px;
  height: 15px;
  border-radius: 15px;
  background-color: ${theme.colors.primary};
`;

function RadioGroup<T = string | number>({
  options,
  value,
  onChange,
}: RadioGroupProps<T>) {
  return (
    <>
      {options.map((option) => {
        const isSelected = value === option.value;

        return (
          <RadioOptionWrapper
            key={String(option.value)}
            onPress={() => onChange?.(option.value)}
          >
            <RadioIndicator>
              {isSelected && <RadioDot />}
            </RadioIndicator>
            <Typography
              fontSize={14}
              lineHeight={28}
              letterSpacing={0.2}
              color="#737373"
              marginLeft={5}
            >
              {option.label}
            </Typography>
          </RadioOptionWrapper>
        );
      })}
    </>
  );
}

export default memo(RadioGroup) as typeof RadioGroup;
