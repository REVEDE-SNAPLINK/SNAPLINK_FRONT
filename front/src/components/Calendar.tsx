import { Calendar as RNCalendar, LocaleConfig } from 'react-native-calendars';
import styled from '@/utils/scale/CustomStyled.ts';
import { theme } from '@/theme';
import Typography from '@/components/theme/Typography.tsx';
import ArrowLeftIcon from '@/assets/icons/arrow-left2.svg';
import ArrowRightIcon from '@/assets/icons/arrow-right2.svg';
import dayjs from 'dayjs';
import Icon from '@/components/Icon.tsx';

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
  initialDate: string;
  currentDate: string;
  availableDates: string[];
}

export default function Calendar({
  onChangeDate,
  initialDate,
  currentDate,
  availableDates,
}: CalendarProps) {
  return (
    <RNCalendar
      initialDate={initialDate}
      theme={{
        textSectionTitleColor: theme.colors.textPrimary,
        textDayHeaderFontFamily: 'Pretendard-SemiBold',
        textDayHeaderFontSize: 13,
        textDayFontWeight: 'semibold',
      }}
      renderArrow={(direction) => (
        direction === 'left'
          ? <Icon width={24} height={24} Svg={ArrowLeftIcon} />
          : <Icon width={24} height={24} Svg={ArrowRightIcon} />
      )}
      renderHeader={(date) => (
        <Typography
          fontSize={16}
          fontWeight="semiBold"
          color={theme.colors.disabled}
        >
          {dayjs(date).format('YYYY.MM')}
        </Typography>
      )}
      dayComponent={({ date }) => {
        const dateString = date?.dateString;
        const isSelected = currentDate === dateString;
        const isDisabled = !availableDates.includes(dateString ?? initialDate);

        return (
          <DayWrapper
            selected={isSelected}
            onPress={() => onChangeDate(dateString ?? initialDate)}
          >
            <Typography
              fontSize={13}
              fontWeight="semiBold"
              lineHeight="140%"
              letterSpacing="-2.5%"
              color={isDisabled ? theme.colors.disabled : isSelected ? "#fff" : theme.colors.textPrimary}
            >{date?.day}</Typography>
          </DayWrapper>
        )
      }}
    />
  )
}

const DayWrapper = styled.TouchableOpacity<{ selected: boolean }>`
  width: 30px;
  height: 30px;
  justify-content: center;
  align-items: center;
  ${({ selected }) => selected && `
    background-color: ${theme.colors.primary};
    border-radius: 5px;
  `}
`