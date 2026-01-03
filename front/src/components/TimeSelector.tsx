import styled from '@/utils/scale/CustomStyled.ts';
import { theme } from '@/theme';
import Typography from '@/components/theme/Typography.tsx';
import { GetAvailableBookingTimeResponse } from '@/api/schedules.ts';

const formatTime = (time: string) => {
  const timeItems = time.split(':');
  return timeItems[0]+":"+timeItems[1];
}

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
  timeSlots: GetAvailableBookingTimeResponse[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  currentDate?: string; // YYYY-MM-DD
}

export const TimeSelector = ({ timeSlots, selectedTime, onSelectTime, currentDate }: TimeSelectorProps) => {
  if (!timeSlots || timeSlots.length === 0) {
    return null;
  }

  const now = new Date();
  const yyyy = now.getFullYear().toString();
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const dd = now.getDate().toString().padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;
  const isToday = !!currentDate && currentDate === todayStr;

  const isPastTimeToday = (startTime: string) => {
    if (!isToday) return false;
    const [hour, minute] = startTime.split(':').map(Number);
    const slotTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hour,
      minute,
      0,
      0
    );
    return slotTime.getTime() <= now.getTime();
  };

  return (
    <TimeListWrapper>
      {timeSlots.map((slot) => {
        const disabled = !slot.available || isPastTimeToday(slot.startTime);

        return (
          <SelectTime
            key={slot.startTime}
            time={formatTime(slot.startTime)}
            isSelected={selectedTime === slot.startTime}
            isDisabled={disabled}
            onPress={() => {
              if (disabled) return;
              onSelectTime(slot.startTime);
            }}
          />
        );
      })}
    </TimeListWrapper>
  );
};
