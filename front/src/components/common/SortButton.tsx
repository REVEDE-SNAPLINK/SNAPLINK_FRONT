import styled from '@/utils/scale/CustomStyled.ts';
import Icon from '@/components/Icon.tsx';
import { theme } from '@/theme';
import Typography from '@/components/theme/Typography.tsx';
import SwapIcon from '@/assets/icons/swap.svg';
import { useState } from 'react';

export type SortOption<T extends string> = {
  key: T;
  label: string;
};

interface SortButtonProps<T extends string> {
  options: SortOption<T>[];
  selectedKey: T;
  onSelect: (key: T) => void;
}

export default function SortButton<T extends string>({
  options,
  selectedKey,
  onSelect,
}: SortButtonProps<T>) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const selectedLabel = options.find((opt) => opt.key === selectedKey)?.label || '';

  return (
    <Container>
      {isOpen && (
        <SortList>
          {options.map((option, index) => (
            <SortItem
              key={option.key}
              onPress={() => {
                onSelect(option.key);
                setIsOpen(false);
              }}
              isSelected={selectedKey === option.key}
              isFirst={index === 0}
              isLast={index === options.length - 1}
            >
              <Typography
                fontSize={12}
                fontWeight="semiBold"
                color={selectedKey === option.key ? '#fff' : 'textPrimary'}
              >
                {option.label}
              </Typography>
            </SortItem>
          ))}
        </SortList>
      )}
      <SortTrigger onPress={() => setIsOpen(!isOpen)}>
        <Typography
          fontSize={12}
          lineHeight="140%"
          letterSpacing="-2.5%"
          color={theme.colors.disabled}
          marginRight={1.5}
        >
          {selectedLabel}
        </Typography>
        <Icon width={14} height={14} Svg={SwapIcon} />
      </SortTrigger>
    </Container>
  );
}

const Container = styled.View``;

const SortTrigger = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`;

const SortList = styled.View`
  width: 120px;
  border-radius: 10px;
  background-color: #fff;
  position: absolute;
  right: 0;
  top: 20px;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.15);
  z-index: 100;
`;

const SortItem = styled.TouchableOpacity<{
  isFirst: boolean;
  isLast: boolean;
  isSelected: boolean;
}>`
  width: 100%;
  height: 40px;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 101;
  ${({ isFirst }) =>
    isFirst &&
    `
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  `}
  ${({ isLast }) =>
    !isLast
      ? `
    border-bottom-width: 1px;
    border-bottom-style: solid;
    border-bottom-color: #C8C8C8;
   `
      : `
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
   `}
  ${({ isSelected }) =>
    isSelected &&
    `
    background-color: ${theme.colors.primary};
  `}
`;
