import styled from '@/utils/scale/CustomStyled.ts';
import { theme } from '@/theme';
import Typography from '@/components/theme/Typography.tsx';
import { useState, useEffect } from 'react';
import SubmitButton from '@/components/theme/SubmitButton.tsx';
import RangeSlider from './RangeSlider';
import { FilterCategory, FilterValue } from '@/types/filter';
import SlideModal from '@/components/theme/SlideModal.tsx';

interface FilterModalProps {
  initialIndex?: number;
  categories: FilterCategory[];
  selectedFilters: FilterValue[];
  onClose: () => void;
  onApply: (filters: FilterValue[]) => void;
}

export default function FilterModal({
  initialIndex = 0,
  categories,
  selectedFilters,
  onClose,
  onApply,
}: FilterModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [localFilters, setLocalFilters] = useState<FilterValue[]>(selectedFilters);

  useEffect(() => {
    setLocalFilters(selectedFilters);
  }, [selectedFilters]);

  const currentCategory = categories[currentIndex];

  const getFilterValue = (categoryId: string): FilterValue | undefined => {
    return localFilters.find((f) => f.categoryId === categoryId);
  };

  const updateEnumFilter = (categoryId: string, value: string) => {
    const existingFilter = getFilterValue(categoryId) as FilterValue | undefined;

    if (existingFilter && existingFilter.type === 'ENUM') {
      const values = existingFilter.values.includes(value)
        ? existingFilter.values.filter((v) => v !== value)
        : [...existingFilter.values, value];

      if (values.length === 0) {
        setLocalFilters(localFilters.filter((f) => f.categoryId !== categoryId));
      } else {
        setLocalFilters(
          localFilters.map((f) =>
            f.categoryId === categoryId ? { ...f, values } : f
          )
        );
      }
    } else {
      setLocalFilters([
        ...localFilters.filter((f) => f.categoryId !== categoryId),
        { categoryId, type: 'ENUM', values: [value] },
      ]);
    }
  };

  const updateNumberFilter = (categoryId: string, min: number, max: number) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category || category.type !== 'NUMBER') return;

    if (min === category.min && max === category.max) {
      // If at default range, remove the filter (no restriction)
      setLocalFilters(localFilters.filter((f) => f.categoryId !== categoryId));
    } else {
      const existingIndex = localFilters.findIndex((f) => f.categoryId === categoryId);
      if (existingIndex >= 0) {
        setLocalFilters(
          localFilters.map((f) =>
            f.categoryId === categoryId ? { categoryId, type: 'NUMBER', min, max } : f
          )
        );
      } else {
        setLocalFilters([...localFilters, { categoryId, type: 'NUMBER', min, max }]);
      }
    }
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const headerContent = (
    <ModalHeaderContent>
      {categories.map((category, index) => (
        <CategoryTabButton
          key={category.id}
          onPress={() => setCurrentIndex(index)}
          isActive={currentIndex === index}
          name={category.name}
        />
      ))}
    </ModalHeaderContent>
  );

  return (
    <SlideModal
      visible={true}
      onClose={onClose}
      showHeader={true}
      headerLeft={headerContent}
      minHeight={300}
      scrollable={false}
      footer={
        <SubmitButton
          text="적용하기"
          width="100%"
          onPress={handleApply}
        />
      }
      footerHeight={72}
    >
      <ModalContent>
        <Typography
          fontSize={14}
          fontWeight="bold"
          lineHeight="140%"
          letterSpacing="-2.5%"
          marginBottom={10}
        >
          {currentCategory.name}
        </Typography>

        {currentCategory.type === 'ENUM' && (
          <EnumItemsContainer>
            {currentCategory.items.map((item) => {
              const filter = getFilterValue(currentCategory.id);
              const isSelected =
                filter && filter.type === 'ENUM' && filter.values.includes(item);

              return (
                <EnumFilterChip
                  key={item}
                  onPress={() => updateEnumFilter(currentCategory.id, item)}
                  name={item}
                  isSelected={!!isSelected}
                />
              );
            })}
          </EnumItemsContainer>
        )}

        {currentCategory.type === 'NUMBER' && (
          <RangeSlider
            min={currentCategory.min}
            max={currentCategory.max}
            unit={currentCategory.unit}
            initialMinValue={
              getFilterValue(currentCategory.id)?.type === 'NUMBER'
                ? (getFilterValue(currentCategory.id) as any).min
                : currentCategory.min
            }
            initialMaxValue={
              getFilterValue(currentCategory.id)?.type === 'NUMBER'
                ? (getFilterValue(currentCategory.id) as any).max
                : currentCategory.max
            }
            onChange={(min, max) => updateNumberFilter(currentCategory.id, min, max)}
          />
        )}
      </ModalContent>
    </SlideModal>
  );
}

/** ---------- styles ---------- */

const ModalHeaderContent = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
`;

const CategoryTabButtonWrapper = styled.TouchableOpacity`
  margin-right: 14px;
  align-items: center;
  justify-content: center;
`;

interface CategoryTabButtonProps {
  onPress: () => void;
  name: string;
  isActive: boolean;
}

const CategoryTabButton = ({
  onPress,
  name,
  isActive,
}: CategoryTabButtonProps) => {
  return (
    <CategoryTabButtonWrapper onPress={onPress} disabled={isActive}>
      <Typography
        fontSize={14}
        fontWeight="bold"
        lineHeight="140%"
        letterSpacing="-2.5%"
        color={isActive ? theme.colors.textPrimary : theme.colors.disabled}
      >
        {name}
      </Typography>
    </CategoryTabButtonWrapper>
  );
};

const ModalContent = styled.View`
  width: 100%;
`;

const EnumItemsContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 7px;
  row-gap: 7px;
  column-gap: 5px;
`;

const EnumFilterChipWrapper = styled.TouchableOpacity<{ isSelected: boolean }>`
  padding-horizontal: 13px;
  height: 26px;
  border-radius: 5px;
  align-items: center;
  justify-content: center;
  border: 1px solid
    ${({ isSelected }) => (isSelected ? theme.colors.primary : theme.colors.disabled)};
  background-color: ${({ isSelected }) => (isSelected ? '#EAFFFA' : 'transparent')};
`;

interface EnumFilterChipProps {
  onPress: () => void;
  name: string;
  isSelected: boolean;
}

const EnumFilterChip = ({ onPress, name, isSelected }: EnumFilterChipProps) => {
  return (
    <EnumFilterChipWrapper onPress={onPress} isSelected={isSelected}>
      <Typography
        fontSize={13}
        letterSpacing="-2.5%"
        color={isSelected ? theme.colors.primary : theme.colors.disabled}
      >
        {name}
      </Typography>
    </EnumFilterChipWrapper>
  );
};