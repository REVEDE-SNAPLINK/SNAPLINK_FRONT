import styled from '@/utils/scale/CustomStyled.ts';
import { theme } from '@/theme';
import Typography from '@/components/theme/Typography.tsx';
import { GetAvailableBookingTimeResponse } from '@/api/schedules.ts';
import { Dimensions } from 'react-native';

const formatTime = (time: string) => {
  const timeItems = time.split(':');
  return timeItems[0]+":"+timeItems[1];
}

const HORIZONTAL_PADDING = 40;
const SLOT_MARGIN = 6;
const TARGET_SLOT_WIDTH = 60; // Figma 기준 목표 사이즈

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 1. 화면 너비에서 패딩을 뺀 가용 너비 계산
const availableWidth = SCREEN_WIDTH - HORIZONTAL_PADDING;

// 2. 가용 너비에 60px 슬롯이 대략 몇 개 들어갈지 계산 (간격 고려)
// 공식: Count = (AvailableWidth + Margin) / (TargetWidth + Margin)
const SLOT_COUNT = Math.floor((availableWidth + SLOT_MARGIN) / (TARGET_SLOT_WIDTH + SLOT_MARGIN));

// 3. 최종 슬롯 너비 계산 (소수점 버림)
const SLOT_WIDTH = Math.floor((availableWidth - (SLOT_COUNT - 1) * SLOT_MARGIN) / SLOT_COUNT);

const TimeWrapper = styled.TouchableOpacity<{ isSelected: boolean; isDisabled: boolean, isLast: boolean }>`
  width: ${SLOT_WIDTH}px;
  height: 28px;
  border-radius: 5px;
  justify-content: center;
  align-items: center;
  margin-bottom: ${SLOT_MARGIN}px;
  ${({ isLast }) => !isLast && `margin-right: ${SLOT_MARGIN}px;`}
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
  isLast: boolean;
}

export const SelectTime = ({ isSelected, isDisabled, time, onPress, isLast }: SelectTimeProps) => {
  return (
    <TimeWrapper isSelected={isSelected} isDisabled={isDisabled} onPress={onPress} disabled={isDisabled} isLast={isLast}>
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
  flex: 1;
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
      {timeSlots.map((slot, index) => {
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
            isLast={index % SLOT_COUNT === (SLOT_COUNT - 1)}
          />
        );
      })}
    </TimeListWrapper>
  );
};
