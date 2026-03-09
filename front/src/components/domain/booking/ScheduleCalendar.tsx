import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Calendar as RNCalendar, LocaleConfig } from 'react-native-calendars';
import styled from '@/utils/scale/CustomStyled.ts';
import { theme } from '@/theme';
import Typography from '@/components/ui/Typography.tsx';
import ArrowLeftIcon from '@/assets/icons/arrow-left-black.svg';
import ArrowRightIcon from '@/assets/icons/arrow-right2.svg';
import dayjs from 'dayjs';
import Icon from '@/components/ui/Icon.tsx';
import { View, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useDerivedValue, SharedValue, useSharedValue } from 'react-native-reanimated';
// MonthPicker는 BookingCalendarView에서 사용
export { default as MonthPicker } from 'react-native-month-year-picker';

LocaleConfig.locales['ko'] = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'ko';

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

  dayMarginBottom: SharedValue<number>;
  containerHeight: number;
}

const DAY_HEIGHT = 42;

const CALENDAR_THEME = {
  textSectionTitleColor: theme.colors.textPrimary,
  textDayHeaderFontFamily: 'Pretendard-SemiBold',
  textDayHeaderFontSize: 13,
  textDayFontWeight: 'semibold' as const,
};

const DayWrapper = styled.TouchableOpacity<{ selected: boolean; eventColor: string | null }>`
  width: 37.57px;
  height: ${DAY_HEIGHT}px;
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

const AnimatedDayWrapper = Animated.createAnimatedComponent(DayWrapper);

type AnimatedDayCellProps = {
  dateString: string;
  day: number;
  isSelected: boolean;
  eventColor: string | null;
  textColor: string;
  style: any;
  onPress: (d: string) => void;
};

const AnimatedDayCell = React.memo(({ dateString, day, isSelected, eventColor, textColor, style, onPress }: AnimatedDayCellProps) => (
  <AnimatedDayWrapper
    style={style}
    selected={isSelected}
    eventColor={eventColor}
    onPress={() => onPress(dateString)}
    activeOpacity={0.8}
  >
    <Typography
      fontSize={13}
      fontWeight="semiBold"
      lineHeight="140%"
      letterSpacing="-2.5%"
      color={textColor}
    >
      {day}
    </Typography>
  </AnimatedDayWrapper>
));

export default function ScheduleCalendar({
  selectedDate,
  onSelectDate,
  scheduleData = [],
  initialDate,
  onMonthChange,
  dayMarginBottom,
  containerHeight,
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

  const getEventColor = useCallback((dateString: string) => {
    const scheduleItem = scheduleMap.get(dateString);
    if (!scheduleItem) return null;

    if (scheduleItem.hasBooking) return 'rgba(0, 169, 128, 0.2)';
    if (scheduleItem.photographerHoliday) return 'rgba(232, 78, 78, 0.2)';
    if (scheduleItem.hasPersonalSchedule) return `${theme.colors.textPrimary}33`;
    if (scheduleItem.publicHoliday) return 'rgba(255, 178, 63, 0.2)';
    return null;
  }, [scheduleMap]);

  const dayMarginStyle = useAnimatedStyle(() => ({
    marginBottom: dayMarginBottom.value,
  }));

  const handleDayPress = useCallback((dateString: string) => {
    onSelectDate(dateString);
  }, [onSelectDate]);

  const renderArrow = useCallback((direction: 'left' | 'right') => (
    direction === 'left'
      ? <Icon width={24} height={24} Svg={ArrowLeftIcon} />
      : <Icon width={24} height={24} Svg={ArrowRightIcon} />
  ), []);

  const renderHeader = useCallback((date: any) => (
    <Typography
      testID="calendar-header"
      fontSize={16}
      fontWeight="semiBold"
      color={theme.colors.disabled}
    >
      {dayjs(date).format('YYYY.MM')}
    </Typography>
  ), []);

  return containerHeight > 0 ? (
    <RNCalendar
      initialDate={selectedDate ?? initialDate}
      onMonthChange={(date) => {
        const yearMonth = dayjs(date.dateString).format('YYYY-MM');
        setDisplayedYearMonth(yearMonth);
        if (onMonthChange) {
          onMonthChange(yearMonth);
        }
      }}
      theme={CALENDAR_THEME}
      renderArrow={renderArrow}
      renderHeader={renderHeader}
      dayComponent={({ date }) => {
        const dateString = date?.dateString ?? '';
        const isSelected = selectedDate === dateString;

        // Check if the date is in the currently displayed month
        const dateYearMonth = dayjs(dateString).format('YYYY-MM');
        const isCurrentMonth = dateYearMonth === displayedYearMonth;

        // Show event color for all dates (including prev/next month)
        const eventColor = getEventColor(dateString);

        const isSunday = new Date(date?.dateString || '').getDay() === 0;

        // Text color: selected = white, other month = disabled, current month = textPrimary
        const textColor = isSelected
          ? '#fff'
          : !isCurrentMonth
            ? theme.colors.disabled
            : isSunday ? '#E84E4E'
              : theme.colors.textPrimary;

        return (
          <AnimatedDayCell
            dateString={dateString}
            day={date?.day ?? 0}
            isSelected={isSelected}
            eventColor={eventColor}
            textColor={textColor}
            style={dayMarginStyle}
            onPress={handleDayPress}
          />
        );
      }}
    />
  ) : null;
}

// ============ 분리된 컴포넌트들 (가로 스와이프용) ============

interface ScheduleCalendarHeaderProps {
  currentYearMonth: string;
  onPressLeft: () => void;
  onPressRight: () => void;
  onPressYearMonth?: () => void;
}

export function ScheduleCalendarHeader({
  currentYearMonth,
  onPressLeft,
  onPressRight,
  onPressYearMonth,
}: ScheduleCalendarHeaderProps) {
  return (
    <HeaderContainer>
      <ArrowButton onPress={onPressLeft}>
        <Icon width={24} height={24} Svg={ArrowLeftIcon} />
      </ArrowButton>
      <TouchableOpacity
        onPress={onPressYearMonth}
        activeOpacity={onPressYearMonth ? 0.7 : 1}
        disabled={!onPressYearMonth}
      >
        <Typography
          fontSize={16}
          fontWeight="semiBold"
          color={theme.colors.disabled}
        >
          {dayjs(currentYearMonth + '-01').format('YYYY.MM')}
        </Typography>
      </TouchableOpacity>
      <ArrowButton onPress={onPressRight}>
        <Icon width={24} height={24} Svg={ArrowRightIcon} />
      </ArrowButton>
    </HeaderContainer>
  );
}

const HeaderContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 10px;
  height: 44px;
`;

const ArrowButton = styled.TouchableOpacity`
  padding: 5px;
`;

// 해당 월의 주차 수 계산
const getWeekCountOfMonth = (yearMonth: string) => {
  const [year, month] = yearMonth.split('-').map(Number);
  const firstDay = new Date(year, month - 1, 1).getDay();
  const lastDate = new Date(year, month, 0).getDate();
  return Math.ceil((firstDay + lastDate) / 7);
};

interface ScheduleCalendarGridProps {
  /** 표시할 월 (YYYY-MM) */
  displayYearMonth: string;
  /** 현재 선택된 날짜 (YYYY-MM-DD) */
  selectedDate: string;
  /** 날짜 선택 콜백 */
  onSelectDate: (date: string) => void;
  /** 날짜별 일정 데이터 */
  scheduleData?: EnhancedScheduleData[];
  /** margin 계산에 필요한 shared values */
  sheetHeight: SharedValue<number>;
  containerHeight: number;
  defaultHeight: number;
  calendarHeaderHeight: number;
  dayRowHeight: number;
  /** 캘린더 최대 주차 수 (기본값 6, 높이 통일 기준) */
  maxWeekCount?: number;
}

// React.memo로 래핑하여 props 변경 시에만 리렌더 (시트 전환 중 프레임 드랍 방지)
export const ScheduleCalendarGrid = React.memo(function ScheduleCalendarGrid({
  displayYearMonth,
  selectedDate,
  onSelectDate,
  scheduleData = [],
  sheetHeight,
  containerHeight,
  defaultHeight,
  calendarHeaderHeight,
  dayRowHeight,
  maxWeekCount = 6,
}: ScheduleCalendarGridProps) {
  // 이 월의 주차 수 계산
  const weekCount = useMemo(() => getWeekCountOfMonth(displayYearMonth), [displayYearMonth]);

  // margin 값들을 미리 계산 (useMemo로 최적화)
  const { baseMargin, hiddenMaxMargin } = useMemo(() => {
    const baseMargin = maxWeekCount > weekCount
      ? (maxWeekCount - weekCount) * dayRowHeight / weekCount
      : 0;

    const calendarHeight = calendarHeaderHeight + weekCount * dayRowHeight;
    const hiddenMaxMargin = containerHeight > 0
      ? Math.max(0, (containerHeight - calendarHeight) / weekCount)
      : 0;

    return { baseMargin, hiddenMaxMargin };
  }, [containerHeight, weekCount, calendarHeaderHeight, dayRowHeight, maxWeekCount]);

  // SharedValue로 저장 (깜빡임 방지)
  const baseMarginSV = useSharedValue(baseMargin);
  const hiddenMaxMarginSV = useSharedValue(hiddenMaxMargin);

  // containerHeight나 weekCount 변경 시 margin 값 업데이트
  useEffect(() => {
    baseMarginSV.value = baseMargin;
    hiddenMaxMarginSV.value = hiddenMaxMargin;
  }, [baseMargin, hiddenMaxMargin, baseMarginSV, hiddenMaxMarginSV]);

  // margin을 내부에서 직접 계산 (useDerivedValue로 sheetHeight 변화에 반응)
  const dayMarginBottom = useDerivedValue(() => {
    'worklet';
    const height = sheetHeight.value;

    if (height <= 0) {
      // HIDDEN 상태: 최대 margin으로 containerHeight 채우기
      return hiddenMaxMarginSV.value;
    } else if (defaultHeight > 0 && height < defaultHeight) {
      // DEFAULT -> HIDDEN 전환 중: baseMargin에서 hiddenMaxMargin으로 보간
      const progress = height / defaultHeight; // 1: DEFAULT, 0: HIDDEN
      return baseMarginSV.value + (hiddenMaxMarginSV.value - baseMarginSV.value) * (1 - progress);
    } else {
      // DEFAULT 또는 FULL 상태: 6주 높이 맞추기 위한 baseMargin
      return baseMarginSV.value;
    }
  });

  const scheduleMap = useMemo(() => {
    const map = new Map<string, EnhancedScheduleData>();
    scheduleData.forEach(item => {
      map.set(item.date, item);
    });
    return map;
  }, [scheduleData]);

  const getEventColor = useCallback((dateString: string) => {
    const scheduleItem = scheduleMap.get(dateString);
    if (!scheduleItem) return null;

    if (scheduleItem.hasBooking) return 'rgba(0, 169, 128, 0.2)';
    if (scheduleItem.photographerHoliday) return 'rgba(232, 78, 78, 0.2)';
    if (scheduleItem.hasPersonalSchedule) return `${theme.colors.textPrimary}33`;
    if (scheduleItem.publicHoliday) return 'rgba(255, 178, 63, 0.2)';
    return null;
  }, [scheduleMap]);

  const dayMarginStyle = useAnimatedStyle(() => ({
    marginBottom: dayMarginBottom.value,
  }));

  const handleDayPress = useCallback((dateString: string) => {
    onSelectDate(dateString);
  }, [onSelectDate]);

  const renderHeader = useCallback(() => <View style={{ height: 0 }} />, []);

  // 수정 F: dayComponent를 useCallback으로 안정화
  const renderDayComponent = useCallback(({ date }: any) => {
    const dateString = date?.dateString ?? '';
    const isSelected = selectedDate === dateString;

    const dateYearMonth = dayjs(dateString).format('YYYY-MM');
    const isCurrentMonth = dateYearMonth === displayYearMonth;

    const eventColor = getEventColor(dateString);
    const isSunday = new Date(date?.dateString || '').getDay() === 0;

    const textColor = isSelected
      ? '#fff'
      : !isCurrentMonth
        ? theme.colors.disabled
        : isSunday
          ? '#E84E4E'
          : theme.colors.textPrimary;

    return (
      <AnimatedDayCell
        dateString={dateString}
        day={date?.day ?? 0}
        isSelected={isSelected}
        eventColor={eventColor}
        textColor={textColor}
        style={dayMarginStyle}
        onPress={handleDayPress}
      />
    );
  }, [selectedDate, displayYearMonth, getEventColor, dayMarginStyle, handleDayPress]);

  // 수정 F: theme 객체를 useMemo로 안정화하여 불필요한 RNCalendar 리렌더 방지
  const calendarTheme = useMemo(() => ({
    ...CALENDAR_THEME,
    // @ts-ignore
    'stylesheet.calendar.header': {
      header: {
        height: 0,
        opacity: 0,
      },
    },
  }), []);

  return (
    <RNCalendar
      key={displayYearMonth}
      initialDate={`${displayYearMonth}-01`}
      hideArrows={true}
      renderHeader={renderHeader}
      hideDayNames={false}
      theme={calendarTheme}
      dayComponent={renderDayComponent}
    />
  );
});