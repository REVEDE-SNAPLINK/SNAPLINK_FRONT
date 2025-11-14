import styled from '@/utils/scale/CustomStyled.ts';
import { theme } from '@/theme';
import Typography from '@/components/theme/Typography.tsx';
import { TimeSlot } from '@/api/photographer.ts';

const TimeWrapper = styled.TouchableOpacity<{ isSelected: boolean; isDisabled: boolean }>`
  width: 57px;
  height: 25px;
  border-radius: 5px;
  justify-content: center;
  align-items: center;
  margin-right: 6px;
  margin-bottom: 6px;
  ${({ isSelected, isDisabled }) =>
    isSelected
      ? `background-color: ${theme.colors.primary}`
      : isDisabled
        ? `border: 1px solid ${theme.colors.disabled}`
        : `border: 1px solid ${theme.colors.textPrimary}`};
`;

interface SelectTimeProps {
  isSelected: boolean;
  isDisabled: boolean;
  time: string;
  onPress: () => void;
}

export const SelectTime = ({ isSelected, isDisabled, time, onPress }: SelectTimeProps) => {
  return (
    <TimeWrapper isSelected={isSelected} isDisabled={isDisabled} onPress={onPress} disabled={isDisabled}>
      <Typography
        fontSize={12}
        letterSpacing="-2.5%"
        color={isSelected ? '#fff' : isDisabled ? theme.colors.disabled : theme.colors.textPrimary}
      >
        {time}
      </Typography>
    </TimeWrapper>
  );
};

const TimeListWrapper = styled.View`
  width: 100%;
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: 15px;
`;

interface TimeSelectorProps {
  timeSlots: TimeSlot[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
}

export const TimeSelector = ({ timeSlots, selectedTime, onSelectTime }: TimeSelectorProps) => {
  if (!timeSlots || timeSlots.length === 0) {
    return null;
  }

  return (
    <TimeListWrapper>
      {timeSlots.map((slot) => (
        <SelectTime
          key={slot.time}
          time={slot.time}
          isSelected={selectedTime === slot.time}
          isDisabled={slot.isReserved}
          onPress={() => onSelectTime(slot.time)}
        />
      ))}
    </TimeListWrapper>
  );
};
