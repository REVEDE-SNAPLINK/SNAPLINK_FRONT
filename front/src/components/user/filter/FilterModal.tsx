import styled from '@/utils/scale/CustomStyled.ts';
import { theme } from '@/theme';
import Typography from '@/components/theme/Typography.tsx';
import { useState, useEffect } from 'react';
import SubmitButton from '@/components/theme/SubmitButton.tsx';
import RangeSlider from './RangeSlider';
import { FilterCategory, FilterValue } from '@/types/filter';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

interface FilterModalProps {
  categories: FilterCategory[];
  selectedFilters: FilterValue[];
  onClose: () => void;
  onApply: (filters: FilterValue[]) => void;
}

export default function FilterModal({
  categories,
  selectedFilters,
  onClose,
  onApply,
}: FilterModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [localFilters, setLocalFilters] = useState<FilterValue[]>(selectedFilters);

  // Sync localFilters when selectedFilters prop changes
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

  // Gesture to block parent swipe on iOS
  const blockGesture = Gesture.Pan()
    .onTouchesDown(() => true)
    .onUpdate(() => {})
    .enabled(true);

  return (
    <Container>
      <Overlay onPress={onClose} />
      <GestureDetector gesture={blockGesture}>
        <ModalContainer>
        <ModalHeader>
          {categories.map((category, index) => (
            <CategoryTabButton
              key={category.id}
              onPress={() => setCurrentIndex(index)}
              isActive={currentIndex === index}
              name={category.name}
            />
          ))}
        </ModalHeader>
        <ModalBody>
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
          <SubmitButton text="적용하기" width="100%" onPress={handleApply} marginTop={37} />
        </ModalBody>
      </ModalContainer>
      </GestureDetector>
    </Container>
  );
}

const Container = styled.View`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`

const Overlay = styled.TouchableOpacity`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 5;
  background-color: rgba(0, 0, 0, 0.4);
`

const ModalContainer = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 10;
  background-color: #fff;
  min-height: 276px;
  border-top-left-radius: 35px;
  border-top-right-radius: 35px;
`

const ModalHeader = styled.View`
  width: 100%;
  padding-horizontal: 31px;
  padding-top: 22px;
  align-items: flex-start;
  box-sizing: border-box;
  height: 57px;
  border-bottom-width: 1px;
  border-bottom-color: ${theme.colors.disabled};
  flex-direction: row;
`

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

const ModalBody = styled.View`
  flex: 1;
  padding-horizontal: 31px;
  padding-top: 14px;
  padding-bottom: 17px;
  justify-content: space-between;
`;

const ModalContent = styled.View`
  justify-content: flex-start;
  flex: 1;
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