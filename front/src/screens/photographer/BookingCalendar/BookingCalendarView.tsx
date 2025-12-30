import ScreenContainer from '@/components/common/ScreenContainer.tsx';
import ScheduleCalendar from '@/components/ScheduleCalendar.tsx';
import styled from '@/utils/scale/CustomStyled.ts';
import { Typography } from '@/components/theme';
import { theme } from '@/theme';
import Icon from '@/components/Icon.tsx';
import CrossIcon from '@/assets/icons/cross-white.svg';
import { PhotographerBooking } from '@/api/photographers.ts';
import { PersonalSchedule } from './AddScheduleModal';

interface BookingCalendarViewProps {
  selectedDate: string;
  bookings: PhotographerBooking[];
  personalSchedules: PersonalSchedule[];
  eventDates: string[];
  dDayText: string;
  onPressBack: () => void;
  onPressBookingItem: (reservationId: number) => void;
  onPressPersonalSchedule: (scheduleId: string) => void;
  onSelectDate: (date: string) => void;
  onPressAddSchedule: () => void;
}

export default function BookingCalendarView({
  selectedDate,
  bookings,
  personalSchedules,
  eventDates,
  dDayText,
  onPressBack,
  onPressBookingItem,
  onPressPersonalSchedule,
  onSelectDate,
  onPressAddSchedule,
}: BookingCalendarViewProps) {
  // Format date to Korean format (12월 31일 화요일)
  const formatDateToKorean = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'][
      date.getDay()
    ];
    return `${month}월 ${day}일 ${dayOfWeek}`;
  };

  const hasSchedules = bookings.length > 0 || personalSchedules.length > 0;

  return (
    <ScreenContainer
      headerShown={true}
      headerTitle="촬영 일정 관리"
      onPressBack={onPressBack}
      alignItemsCenter={false}
    >
      <ScheduleCalendar
        initialDate={selectedDate}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        eventDates={eventDates}
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
                {bookings.map((booking) => (
                  <BookingItem key={`booking-${booking.id}`} onPress={() => onPressBookingItem(booking.id)}>
                    <BookingInfoWrapper>
                      <BookingBar />
                      <BookingProfileImage
                        source={
                          booking.userProfileImage ? { uri: booking.userProfileImage } : undefined
                        }
                      />
                      <Typography fontSize={14}>
                        {booking.userNickname}ㆍ{booking.location}ㆍ{booking.shootingType}
                      </Typography>
                    </BookingInfoWrapper>
                    <BookingDetailButton>
                      <Typography fontSize={11}>상세보기</Typography>
                    </BookingDetailButton>
                  </BookingItem>
                ))}
                {personalSchedules.map((schedule) => (
                  <BookingItem key={`schedule-${schedule.id}`} onPress={() => onPressPersonalSchedule(schedule.id)}>
                    <BookingInfoWrapper>
                      <PersonalScheduleBar />
                      <BookingProfileImage />
                      <Typography fontSize={14}>
                        {schedule.customerName || '개인 일정'}
                        {schedule.location && `ㆍ${schedule.location}`}
                        {schedule.shootingType && `ㆍ${schedule.shootingType}`}
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
  background-color: #EAEAEA;
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
  height: 100%;
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

const PersonalScheduleBar = styled.View`
  width: 3px;
  height: 40px;
  border-radius: 100px;
  margin-right: 10px;
  background-color: ${theme.colors.textPrimary};
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

const BookingProfileImage = styled.Image`
  width: 30px;
  height: 30px;
  border-radius: 30px;
  background-color: #ccc;
  margin-right: 6px;
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
  bottom: 57px;
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