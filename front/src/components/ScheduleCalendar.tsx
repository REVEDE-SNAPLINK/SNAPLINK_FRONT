import { Calendar as RNCalendar, LocaleConfig } from 'react-native-calendars';
import styled from '@/utils/scale/CustomStyled.ts';
import { theme } from '@/theme';
import Typography from '@/components/theme/Typography.tsx';
import ArrowLeftIcon from '@/assets/icons/arrow-left2.svg';
import ArrowRightIcon from '@/assets/icons/arrow-right2.svg';
import dayjs from 'dayjs';
import Icon from '@/components/Icon.tsx';
import { useMemo } from 'react';

LocaleConfig.locales['ko'] = {
  monthNames: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
  monthNamesShort: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
  dayNames: ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'],
  dayNamesShort: ['일','월','화','수','목','금','토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'ko';

export interface MonthScheduleData {
  day: number;
  hasBookings: boolean;
  publicHoliday: boolean;
  photographerHoliday: boolean;
}

interface ScheduleCalendarProps {
  /** 현재 선택된 날짜 (YYYY-MM-DD) */
  selectedDate: string;
  /** 날짜 선택 콜백 (YYYY-MM-DD) */
  onSelectDate: (date: string) => void;
  /** 월별 일정 데이터 */
  monthScheduleData?: MonthScheduleData[];
  /** 캘린더 최초 표시 날짜 (옵션) */
  initialDate?: string;
}

export default function ScheduleCalendar({
  selectedDate,
  onSelectDate,
  monthScheduleData = [],
  initialDate,
}: ScheduleCalendarProps) {
  // Create a map for quick lookup
  const scheduleMap = useMemo(() => {
    const map = new Map<number, MonthScheduleData>();
    monthScheduleData.forEach(item => {
      map.set(item.day, item);
    });
    return map;
  }, [monthScheduleData]);

  const getEventColor = (day: number) => {
    const scheduleData = scheduleMap.get(day);
    if (!scheduleData) return null;

    // Priority: hasBookings > photographerHoliday > publicHoliday
    if (scheduleData.hasBookings) {
      return 'rgba(0, 169, 128, 0.2)'; // primary color
    }
    if (scheduleData.photographerHoliday) {
      return 'rgba(255, 152, 0, 0.2)'; // orange for photographer holiday
    }
    if (scheduleData.publicHoliday) {
      return 'rgba(158, 158, 158, 0.2)'; // gray for public holiday
    }
    return null;
  };

  return (
    <RNCalendar
      initialDate={initialDate ?? selectedDate}
      theme={{
        textSectionTitleColor: theme.colors.textPrimary,
        textDayHeaderFontFamily: 'Pretendard-SemiBold',
        textDayHeaderFontSize: 13,
        textDayFontWeight: 'semibold',
      }}
      renderArrow={(direction) =>
        direction === 'left'
          ? <Icon width={24} height={24} Svg={ArrowLeftIcon} />
          : <Icon width={24} height={24} Svg={ArrowRightIcon} />
      }
      renderHeader={(date) => (
        <Typography
          testID="calendar-header"
          fontSize={16}
          fontWeight="semiBold"
          color={theme.colors.disabled}
        >
          {dayjs(date).format('YYYY.MM')}
        </Typography>
      )}
      dayComponent={({ date }) => {
        const dateString = date?.dateString ?? '';
        const isSelected = selectedDate === dateString;
        const day = date?.day ?? 0;
        const eventColor = getEventColor(day);

        return (
          <DayWrapper
            selected={isSelected}
            eventColor={eventColor}
            onPress={() => onSelectDate(dateString)}
            activeOpacity={0.8}
          >
            <Typography
              fontSize={13}
              fontWeight="semiBold"
              lineHeight="140%"
              letterSpacing="-2.5%"
              color={isSelected ? '#fff' : theme.colors.textPrimary}
            >
              {date?.day}
            </Typography>
          </DayWrapper>
        );
      }}
    />
  );
}

const DayWrapper = styled.TouchableOpacity<{ selected: boolean; eventColor: string | null }>`
  width: 37.57px;
  height: 42px;
  justify-content: center;
  align-items: center;
  border-radius: 100px;

  ${({ eventColor, selected }) =>
    eventColor && !selected
      ? `background-color: ${eventColor};`
      : ''}

  ${({ selected }) =>
    selected
      ? `background-color: ${theme.colors.primary};`
      : ''}
`;
