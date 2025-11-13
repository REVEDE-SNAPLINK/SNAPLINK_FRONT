import styled from '@/utils/scale/CustomStyled.ts';
import { theme } from '@/theme';
import Icon from '@/components/Icon';
import Typography from '@/components/theme/Typography.tsx';
import { FilterCategory, FilterChip } from '@/types/filter';
import FilterIcon from '@/assets/icons/filter.svg';
import CancelIcon from '@/assets/icons/cancel.svg';

interface FilterProps {
  categories: FilterCategory[];
  activeCategoryIds: string[];
  filterChips: FilterChip[];
  onPressFilterButton: () => void;
  onPressCategoryChip: (categoryId: string) => void;
  onPressFilterChip: (chipId: string) => void;
}

export default function Filter({
  categories,
  activeCategoryIds,
  filterChips,
  onPressFilterButton,
  onPressCategoryChip,
  onPressFilterChip,
}: FilterProps) {
  return (
    <Container>
      <TopRow
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        <FilterButton onPress={onPressFilterButton}>
          <Icon width={15} height={15} Svg={FilterIcon} />
        </FilterButton>

        {categories.map((category) => {
          const isActive = activeCategoryIds.includes(category.id);
          const IconComponent = isActive ? category.activeIcon : category.icon;

          return (
            <CategoryChip
              key={category.id}
              name={category.name}
              Icon={IconComponent}
              isActive={isActive}
              onPress={() => onPressCategoryChip(category.id)}
            />
          );
        })}
      </TopRow>

      {filterChips.length > 0 && (
        <SelectedFiltersContainer>
          {filterChips.map((chip) => (
            <SelectedFilterChip
              key={chip.id}
              label={chip.label}
              onRemove={() => onPressFilterChip(chip.id)}
            />
          ))}
        </SelectedFiltersContainer>
      )}
    </Container>
  );
}

const Container = styled.View`
  width: 100%;
  margin-top: 15px;
`;

const TopRow = styled.ScrollView`
  width: 100%;
  flex-grow: 0;
`;

const FilterButton = styled.TouchableOpacity`
  width: 25px;
  height: 25px;
  border-radius: 12.5px;
  background-color: #f4f4f4;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
`;

const CategoryChipWrapper = styled.TouchableOpacity<{ isActive: boolean }>`
  flex-direction: row;
  align-items: center;
  padding-horizontal: 10px;
  height: 25px;
  border-radius: 17.5px;
  background-color: ${({ isActive }) => (isActive ? theme.colors.primary : '#F4F4F4')};
  margin-right: 8px;
`;

interface CategoryChipProps {
  name: string;
  Icon: React.ComponentType<any>;
  isActive: boolean;
  onPress: () => void;
}

const CategoryChip = ({ name, Icon: IconComponent, isActive, onPress }: CategoryChipProps) => {
  return (
    <CategoryChipWrapper onPress={onPress} isActive={isActive}>
      <Icon
        width={15}
        height={15}
        Svg={IconComponent}
        color={isActive ? '#fff' : theme.colors.textPrimary}
      />
      <Typography
        fontSize={11}
        lineHeight="140%"
        letterSpacing="-2.5%"
        color={isActive ? '#fff' : '#000'}
        marginLeft={4}
      >
        {name}
      </Typography>
    </CategoryChipWrapper>
  );
};

const SelectedFiltersContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 10px;
  gap: 8px;
`;

const SelectedFilterChipButton = styled.TouchableOpacity`
  flex-direction: row;
  height: 25px;
  padding-horizontal: 10px;
  background-color: #f4f4f4;
  border-radius: 15px;
  align-items: center;
`;

interface SelectedFilterChipProps {
  label: string;
  onRemove: () => void;
}

const SelectedFilterChip = ({ label, onRemove }: SelectedFilterChipProps) => {
  return (
    <SelectedFilterChipButton onPress={onRemove}>
      <Typography
        fontSize={11}
        lineHeight="140%"
        letterSpacing="-2.5%"
        marginRight={6}>
        {label}
      </Typography>
      <Icon
        width={14}
        height={14}
        Svg={CancelIcon} />
    </SelectedFilterChipButton>
  );
};
