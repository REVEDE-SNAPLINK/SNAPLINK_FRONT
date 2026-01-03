import ScreenContainer from '@/components/common/ScreenContainer.tsx';
import ScheduleCalendar, { EnhancedScheduleData } from '@/components/ScheduleCalendar.tsx';
import styled from '@/utils/scale/CustomStyled.ts';
import { Typography } from '@/components/theme';
import { theme } from '@/theme';
import Icon from '@/components/Icon.tsx';
import CrossIcon from '@/assets/icons/cross-white.svg';
import { PersonalSchedule } from '@/store/modalStore';
import { GetPhotographerDayDetailResponse } from '@/api/schedules';
import { formatTime } from '@/utils/format.ts';
import { useMemo } from 'react';

interface BookingCalendarViewProps {
  selectedDate: string;
  scheduleData: EnhancedScheduleData[];
  dayDetailData: GetPhotographerDayDetailResponse | null;
  personalSchedules: PersonalSchedule[];
  dDayText: string;
  onPressBookingItem: (bookingId: number) => void;
  onPressPersonalSchedule: (scheduleId: string) => void;
  onSelectDate: (date: string) => void;
  onPressAddSchedule: () => void;
  onMonthChange: (yearMonth: string) => void;
}

export default function BookingCalendarView({
  selectedDate,
  scheduleData,
  dayDetailData,
  personalSchedules,
  dDayText,
  onPressBookingItem,
  onPressPersonalSchedule,
  onSelectDate,
  onPressAddSchedule,
  onMonthChange,
}: BookingCalendarViewProps) {
  const formatDateToKorean = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'][
      date.getDay()
    ];
    return `${month}월 ${day}일 ${dayOfWeek}`;
  };

  const bookings = useMemo(() => {
    if (!dayDetailData?.bookings) return [];

    return [...dayDetailData.bookings].sort((a, b) => {
      return a.startTime.localeCompare(b.startTime);
    });
  }, [dayDetailData?.bookings]);
  const hasPublicHoliday = dayDetailData?.publicHolidayName;
  const hasPhotographerHoliday = dayDetailData?.photographerHolidayReason;

  const hasSchedules = bookings.length > 0 || personalSchedules.length > 0 || hasPublicHoliday || hasPhotographerHoliday;

  return (
    <ScreenContainer
      headerShown={true}
      headerTitle="촬영 일정 관리"
      alignItemsCenter={false}
      backgroundColor="#EAEAEA"
    >
      <ScheduleCalendar
        initialDate={selectedDate}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        scheduleData={scheduleData}
        onMonthChange={onMonthChange}
      />
      <BookingContentContainer>
        <BookingSlideBarWrapper>
          <BookingSlideBar />
        </BookingSlideBarWrapper>
        <BookingContentHeader>
          <Typography fontSize={16} fontWeight="semiBold">
            {formatDateToKorean(selectedDate)}
          </Typography>
        </BookingContentHeader>
        <BookingContent>
          <BookingContentScrollView showsVerticalScrollIndicator={false}>
            {!hasSchedules ? (
              <BookingItem disabled>
                <BookingInfoWrapper>
                  <BookingEmptyBar />
                  <Typography fontSize={14} color="#AAA">
                    일정이 없습니다
                  </Typography>
                </BookingInfoWrapper>
              </BookingItem>
            ) : (
              <>
                {hasPublicHoliday && (
                  <BookingItem disabled>
                    <BookingInfoWrapper>
                      <PublicHolidayBar />
                      <Typography fontSize={14}>
                        공휴일ㆍ{hasPublicHoliday}
                      </Typography>
                    </BookingInfoWrapper>
                  </BookingItem>
                )}
                {bookings.map((booking) => (
                  <BookingItem key={`booking-${booking.bookingId}`} onPress={() => onPressBookingItem(booking.bookingId)}>
                    <BookingInfoWrapper>
                      <BookingBar />
                      <Typography fontSize={14}>
                        {booking.customerNickName}ㆍ{formatTime(booking.startTime)}~{formatTime(booking.endTime)}
                      </Typography>
                    </BookingInfoWrapper>
                    <BookingDetailButton>
                      <Typography fontSize={11}>상세보기</Typography>
                    </BookingDetailButton>
                  </BookingItem>
                ))}

                {hasPhotographerHoliday && (
                  <BookingItem disabled>
                    <BookingInfoWrapper>
                      <PhotographerHolidayBar />
                      <Typography fontSize={14}>
                        휴가ㆍ{hasPhotographerHoliday}
                      </Typography>
                    </BookingInfoWrapper>
                  </BookingItem>
                )}

                {personalSchedules.map((schedule) => (
                  <BookingItem key={`schedule-${schedule.id}`} onPress={() => onPressPersonalSchedule(schedule.id)}>
                    <BookingInfoWrapper>
                      <PersonalScheduleBar />
                      <Typography fontSize={14}>
                        {schedule.title}
                      </Typography>
                    </BookingInfoWrapper>
                    <BookingDetailButton>
                      <Typography fontSize={11}>상세보기</Typography>
                    </BookingDetailButton>
                  </BookingItem>
                ))}
              </>
            )}
          </BookingContentScrollView>
        </BookingContent>
        <ScheduleToolButtonWrapper>
          <ScheduleDDayBlock>
            <Typography fontSize={14} fontWeight="bold">
              {dDayText}
            </Typography>
          </ScheduleDDayBlock>
          <FloatingButton onPress={onPressAddSchedule}>
            <Icon width={20} height={20} Svg={CrossIcon} />
          </FloatingButton>
        </ScheduleToolButtonWrapper>
      </BookingContentContainer>
    </ScreenContainer>
  );
}

const BookingContentContainer = styled.View`
  flex: 1;
  width: 100%;
`

const BookingSlideBarWrapper = styled.View`
  width: 100%;
  margin-top: 8px;
  align-items: center;
`

const BookingSlideBar = styled.View`
  width: 30px;
  height: 3px;
  background-color: #AAAAAA;
  border-radius: 100px;
`

const BookingContentHeader = styled.View`
  margin-top: 17px;
  width: 100%;
  height: 32px;
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: #C8C8C8;
  padding-left: 20px;
`

const BookingContent = styled.View`
  flex: 1;
  width: 100%;
`

const BookingContentScrollView = styled.ScrollView`
  padding-top: 12px;
  padding-left: 17px;
  padding-right: 17px;
`

const BookingItem = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
  justify-content: space-between;
`

const BookingBar = styled.View`
  width: 3px;
  height: 40px;
  border-radius: 100px;
  margin-right: 10px;
  background-color: ${theme.colors.primary};
`

const PhotographerHolidayBar = styled.View`
  width: 3px;
  height: 40px;
  border-radius: 100px;
  margin-right: 10px;
  background-color: #FF9800;
`

const PersonalScheduleBar = styled.View`
  width: 3px;
  height: 40px;
  border-radius: 100px;
  margin-right: 10px;
  background-color: ${theme.colors.textPrimary};
`

const PublicHolidayBar = styled.View`
  width: 3px;
  height: 40px;
  border-radius: 100px;
  margin-right: 10px;
  background-color: #FFB23F;
`

const BookingEmptyBar = styled.View`
  width: 3px;
  height: 40px;
  border-radius: 100px;
  margin-right: 10px;
  background-color: #AAAAAA;
`

const BookingInfoWrapper = styled.View`
  flex-direction: row;
  align-items: center;
`

const BookingDetailButton = styled.View`
  height: 21px;
  padding: 0 5px;
  justify-content: center;
  border-radius: 100px;
  border: 1px solid ${theme.colors.textPrimary};
`

const ScheduleToolButtonWrapper = styled.View`
  align-items: center;
  position: absolute;
  bottom: 10px;
  left: 0;
  width: 100%;
`

const ScheduleDDayBlock = styled.View`
  width: 54px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border-radius: 25px;
  background-color: #fff;
`

const FloatingButton = styled.TouchableOpacity`
  width: 38px;
  height: 38px;
  border-radius: 38px;
  background-color: ${theme.colors.primary};
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 19px;
  bottom: 0;
`
