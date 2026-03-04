import React, { useState, useCallback, useEffect } from 'react';
import { Calendar as RNCalendar, LocaleConfig } from 'react-native-calendars';
import styled from '@/utils/scale/CustomStyled.ts';
import { theme } from '@/theme';
import Typography from '@/components/ui/Typography.tsx';
import ArrowLeftIcon from '@/assets/icons/arrow-left-black.svg';
import ArrowRightIcon from '@/assets/icons/arrow-right2.svg';
import ArrowLeftGrayIcon from '@/assets/icons/arrow-left-gray.svg';
import dayjs from 'dayjs';
import Icon from '@/components/ui/Icon.tsx';

LocaleConfig.locales['ko'] = {
  monthNames: [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ],
  monthNamesShort: [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ],
  dayNames: [
    '일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'
  ],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘'
};

LocaleConfig.defaultLocale = 'ko';

interface CalendarProps {
  onChangeDate: (date: string) => void;
  onMonthChange?: (year: number, month: number) => void;
  initialDate: string;
  currentDate: string;
  availableDates: string[];
  minDate?: string;
  maxDate?: string;
}

const CALENDAR_THEME = {
  textSectionTitleColor: theme.colors.textPrimary,
  textDayHeaderFontFamily: 'Pretendard-SemiBold',
  textDayHeaderFontSize: 13,
  textDayFontWeight: 'semibold' as const,
};

const DayCell = React.memo(({ dateString, day, isSelected, isDisabled, onPress }: { dateString: string, day: number, isSelected: boolean, isDisabled: boolean, onPress: (d: string) => void }) => {
  return (
    <DayWrapper
      selected={isSelected}
      disabled={isDisabled}
      onPress={() => {
        if (!isDisabled) {
          onPress(dateString);
        }
      }}
    >
      <Typography
        fontSize={13}
        fontWeight="semiBold"
        lineHeight="140%"
        letterSpacing="-2.5%"
        color={isDisabled ? theme.colors.disabled : isSelected ? "#fff" : theme.colors.textPrimary}
      >{day}</Typography>
    </DayWrapper>
  );
});

export default function Calendar({
  onChangeDate,
  onMonthChange,
  initialDate,
  currentDate,
  availableDates,
  minDate,
  maxDate,
}: CalendarProps) {

  const [currentDisplayMonth, setCurrentDisplayMonth] = useState(() => initialDate.substring(0, 7));
  const minMonthStr = minDate ? minDate.substring(0, 7) : '';
  const isLeftDisabled = minMonthStr !== '' && currentDisplayMonth <= minMonthStr;

  const handleDayPress = useCallback((dateString: string) => {
    onChangeDate(dateString);
  }, [onChangeDate]);

  const renderArrow = useCallback((direction: 'left' | 'right') => {
    if (direction === 'left') {
      return <Icon width={24} height={24} Svg={isLeftDisabled ? ArrowLeftGrayIcon : ArrowLeftIcon} />;
    }
    return <Icon width={24} height={24} Svg={ArrowRightIcon} />;
  }, [isLeftDisabled]);

  const renderHeader = useCallback((date: any) => {
    const yyyyMm = dayjs(date).format('YYYY-MM');
    // Check if there are any available dates in the displayed month
    const hasAvailableDate = availableDates.some(d => d.startsWith(yyyyMm));

    return (
      <Typography
        testID="calendar-header"
        fontSize={16}
        fontWeight="semiBold"
        color={hasAvailableDate ? theme.colors.textPrimary : theme.colors.disabled}
      >
        {dayjs(date).format('YYYY.MM')}
      </Typography>
    );
  }, [availableDates]);

  return (
    <RNCalendar
      initialDate={initialDate}
      minDate={minDate}
      maxDate={maxDate}
      disableArrowLeft={isLeftDisabled}
      onMonthChange={(date) => {
        const year = date.year;
        const month = date.month;
        const formattedMonth = `${year}-${String(month).padStart(2, '0')}`;
        setCurrentDisplayMonth(formattedMonth);
        if (onMonthChange) {
          onMonthChange(year, month);
        }
      }}
      theme={CALENDAR_THEME}
      renderArrow={renderArrow}
      renderHeader={renderHeader}
      dayComponent={({ date }) => {
        const dateString = date?.dateString ?? initialDate;
        const isSelected = currentDate === dateString;
        const isDisabled = !availableDates.includes(dateString);

        return (
          <DayCell
            dateString={dateString}
            day={date?.day ?? 0}
            isSelected={isSelected}
            isDisabled={isDisabled}
            onPress={handleDayPress}
          />
        )
      }}
    />
  )
}

const DayWrapper = styled.TouchableOpacity<{ selected: boolean; disabled?: boolean }>`
  width: 30px;
  height: 30px;
  justify-content: center;
  align-items: center;
  ${({ selected }) => selected && `
    background-color: ${theme.colors.primary};
    border-radius: 5px;
  `}
`