import { Calendar as RNCalendar, LocaleConfig } from 'react-native-calendars';
import styled from '@/utils/scale/CustomStyled.ts';
import { theme } from '@/theme';
import Typography from '@/components/theme/Typography.tsx';
import ArrowLeftIcon from '@/assets/icons/arrow-left2.svg';
import ArrowRightIcon from '@/assets/icons/arrow-right2.svg';
import dayjs from 'dayjs';
import Icon from '@/components/Icon.tsx';
import { useMemo, useState } from 'react';

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
  hasPersonalSchedule?: boolean;
}

export interface EnhancedScheduleData {
  date: string; // YYYY-MM-DD
  hasBooking: boolean;
  publicHoliday: boolean;
  photographerHoliday: boolean;
  hasPersonalSchedule?: boolean;
}

interface ScheduleCalendarProps {
  /** 현재 선택된 날짜 (YYYY-MM-DD) */
  selectedDate: string;
  /** 날짜 선택 콜백 (YYYY-MM-DD) */
  onSelectDate: (date: string) => void;
  /** 날짜별 일정 데이터 (이전/현재/다음 달 포함) */
  scheduleData?: EnhancedScheduleData[];
  /** 캘린더 최초 표시 날짜 (옵션) */
  initialDate?: string;
  /** 월 변경 콜백 (YYYY-MM) */
  onMonthChange?: (yearMonth: string) => void;
}

export default function ScheduleCalendar({
  selectedDate,
  onSelectDate,
  scheduleData = [],
  initialDate,
  onMonthChange,
}: ScheduleCalendarProps) {
  // Track currently displayed month (YYYY-MM)
  const [displayedYearMonth, setDisplayedYearMonth] = useState(() =>
    dayjs(initialDate ?? selectedDate).format('YYYY-MM')
  );

  // Create a map for quick lookup by date string
  const scheduleMap = useMemo(() => {
    const map = new Map<string, EnhancedScheduleData>();
    scheduleData.forEach(item => {
      map.set(item.date, item);
    });
    return map;
  }, [scheduleData]);

  const getEventColor = (dateString: string) => {
    const scheduleItem = scheduleMap.get(dateString);
    if (!scheduleItem) return null;

    // Priority: hasBookings > photographerHoliday > hasPersonalSchedule > publicHoliday
    if (scheduleItem.hasBooking) {
      return 'rgba(0, 169, 128, 0.2)'; // primary color
    }
    if (scheduleItem.photographerHoliday) {
      return 'rgba(255, 152, 0, 0.2)'; // orange for photographer holiday
    }
    if (scheduleItem.hasPersonalSchedule) {
      return `${theme.colors.textPrimary}33`; // textPrimary with 20% opacity
    }
    if (scheduleItem.publicHoliday) {
      return 'rgba(255, 178, 63, 0.2)'; // #FFB23F with 20% opacity
    }
    return null;
  };

  return (
    <RNCalendar
      initialDate={initialDate ?? selectedDate}
      onMonthChange={(date) => {
        const yearMonth = dayjs(date.dateString).format('YYYY-MM');
        setDisplayedYearMonth(yearMonth);
        if (onMonthChange) {
          onMonthChange(yearMonth);
        }
      }}
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

        // Check if the date is in the currently displayed month
        const dateYearMonth = dayjs(dateString).format('YYYY-MM');
        const isCurrentMonth = dateYearMonth === displayedYearMonth;

        // Show event color for all dates (including prev/next month)
        const eventColor = getEventColor(dateString);

        // Text color: selected = white, other month = disabled, current month = textPrimary
        const textColor = isSelected
          ? '#fff'
          : isCurrentMonth
          ? theme.colors.textPrimary
          : theme.colors.disabled;

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
              color={textColor}
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
