import ScheduleCalendar, { EnhancedScheduleData } from '@/components/ScheduleCalendar.tsx';
import styled from '@/utils/scale/CustomStyled.ts';
import { Typography } from '@/components/theme';
import { theme } from '@/theme';
import Icon from '@/components/Icon.tsx';
import CrossIcon from '@/assets/icons/cross-white.svg';
import { GetPhotographerDayDetailResponse } from '@/api/schedules';
import { formatTime } from '@/utils/format.ts';
import { useEffect, useMemo, useState } from 'react';
import { Dimensions, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
  withTiming, interpolate, Extrapolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface BookingCalendarViewProps {
  selectedDate: string;
  scheduleData: EnhancedScheduleData[];
  currentYearMonth: string;
  dayDetailData: GetPhotographerDayDetailResponse | null;
  dDayText: string;
  onPressBookingItem: (bookingId: number) => void;
  onPressPersonalSchedule: (id: number) => void;
  onPressHoliday: () => void;
  onSelectDate: (date: string) => void;
  onPressAddSchedule: () => void;
  onMonthChange: (yearMonth: string) => void;
}

export default function BookingCalendarView({
  selectedDate,
  scheduleData,
  currentYearMonth,
  dayDetailData,
  dDayText,
  onPressBookingItem,
  onPressPersonalSchedule,
  onPressHoliday,
  onSelectDate,
  onPressAddSchedule,
  onMonthChange,
}: BookingCalendarViewProps) {
  const [containerHeight, setContainerHeight] = useState(0);
  const [renderType, setRenderType] = useState<'HIDDEN' | 'DEFAULT' | 'FULL'>('HIDDEN');

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
  const personalSchedules = useMemo(() => {
    if (!dayDetailData?.personalSchedules) return [];

    return [...dayDetailData.personalSchedules].sort((a, b) => {
      return a.startTime.localeCompare(b.startTime);
    });
  }, [dayDetailData?.personalSchedules]);
  const hasPublicHoliday = dayDetailData?.holidayName && dayDetailData?.holidayId === null;
  const hasPhotographerHoliday = dayDetailData?.holidayId !== null;

  const hasSchedules = bookings.length > 0 || personalSchedules.length > 0 || hasPublicHoliday || hasPhotographerHoliday;

  const sheetHeight = useSharedValue(0);
  const dragStartHeight = useSharedValue(0);
  const defaultHeight = useMemo(() => {
    if (!containerHeight) return 0;
    return containerHeight * 0.45;
  }, [containerHeight]);
  const renderTypeSV = useSharedValue<'HIDDEN' | 'DEFAULT' | 'FULL'>('HIDDEN');

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: sheetHeight.value,
    };
  });

  useEffect(() => {
    renderTypeSV.value = renderType;
  }, [renderType, renderTypeSV]);

  useEffect(() => {
    if (!selectedDate) return;
    if (!defaultHeight) return;

    setRenderType('DEFAULT');
  }, [selectedDate, defaultHeight]);

  const DRAG_DAMPING = 0.8;

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      dragStartHeight.value = sheetHeight.value;
    })

    .onUpdate((e) => {
      // 🔥 FULL 상태에서 위로 더 못 올리게
      if (renderTypeSV.value === 'FULL' && e.translationY < 0) {
        return;
      }

      const nextHeight =
        dragStartHeight.value - e.translationY * DRAG_DAMPING;

      sheetHeight.value = Math.min(
        containerHeight,
        Math.max(0, nextHeight),
      );
    })

    .onEnd((e) => {
      const current = sheetHeight.value;

      const SNAP_HIDDEN = defaultHeight * 0.5;
      const SNAP_FULL =
        defaultHeight + (containerHeight - defaultHeight) * 0.5;

      // 🔥 FULL 상태
      if (renderTypeSV.value === 'FULL') {
        if (e.velocityY > 600 || current < SNAP_FULL) {
          sheetHeight.value = withTiming(defaultHeight);
          renderTypeSV.value = 'DEFAULT';
          runOnJS(setRenderType)('DEFAULT');
        } else {
          sheetHeight.value = withTiming(containerHeight);
        }
        return;
      }

      // 🔥 DEFAULT 상태
      if (current <= SNAP_HIDDEN) {
        sheetHeight.value = withTiming(0);
        renderTypeSV.value = 'HIDDEN';
        runOnJS(setRenderType)('HIDDEN');
        return;
      }

      if (current >= SNAP_FULL) {
        sheetHeight.value = withTiming(containerHeight);
        renderTypeSV.value = 'FULL';
        runOnJS(setRenderType)('FULL');
        return;
      }

      sheetHeight.value = withTiming(defaultHeight);
      renderTypeSV.value = 'DEFAULT';
      runOnJS(setRenderType)('DEFAULT');
    });

  useEffect(() => {
    if (!containerHeight || !defaultHeight) return;

    if (renderType === 'HIDDEN') {
      sheetHeight.value = withTiming(0);
    }

    if (renderType === 'DEFAULT') {
      sheetHeight.value = withTiming(defaultHeight);
    }

    if (renderType === 'FULL') {
      sheetHeight.value = withTiming(containerHeight);
    }
  }, [renderType, containerHeight, defaultHeight, sheetHeight]);

  const floatingAnimatedStyle = useAnimatedStyle(() => {
    /**
     * 언제부터 사라질지 기준
     * DEFAULT 높이의 60% → 거의 다 내려왔을 때
     */
    const fadeStart = defaultHeight * 0.6;
    const fadeEnd = 0;

    const opacity = interpolate(
      sheetHeight.value,
      [fadeEnd, fadeStart],
      [0, 1],
      Extrapolate.CLAMP,
    );

    return {
      opacity,
      zIndex: opacity === 0 ? -1 : 10,
    };
  });

  const calendarBaseHeight = useSharedValue(containerHeight);

  const calendarAnimatedStyle = useAnimatedStyle(() => {
    /**
     * BottomSheet가 DEFAULT보다 커진 만큼
     * Calendar가 다시 차지해야 할 공간
     */
    const extra = Math.max(
      0,
      containerHeight - sheetHeight.value,
    );

    return {
      height: calendarBaseHeight.value + extra,
    };
  });

  const weekRowCount = useMemo(() => {
    if (!currentYearMonth) return 6;

    const firstDay = new Date(`${currentYearMonth}-01`);
    const lastDay = new Date(
      firstDay.getFullYear(),
      firstDay.getMonth() + 1,
      0,
    );

    const startWeekday = firstDay.getDay();
    const totalDays = lastDay.getDate();

    return Math.ceil((startWeekday + totalDays) / 7) + 1;
  }, [currentYearMonth]);

  return (
    <Container
      onLayout={(e) => {
        setContainerHeight(e.nativeEvent.layout.height);
      }}
    >
      <CalendarWrapper
        style={calendarAnimatedStyle}
        onLayout={(e) => {
          calendarBaseHeight.value = e.nativeEvent.layout.height;
        }}
      >
        <ScheduleCalendar
          initialDate={`${currentYearMonth}-01`}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
          scheduleData={scheduleData}
          onMonthChange={onMonthChange}
          sheetHeight={sheetHeight}
          defaultHeight={defaultHeight}
          calendarWrapperHeight={calendarBaseHeight}
          weekRowCount={weekRowCount}
        />
      </CalendarWrapper>
      <BookingContentContainer
        style={animatedStyle}
      >
        <GestureDetector gesture={panGesture}>
          <View>
            <BookingSlideBarWrapper>
              <BookingSlideBar />
            </BookingSlideBarWrapper>
            <BookingContentHeader>
              <Typography fontSize={16} fontWeight="semiBold">
                {formatDateToKorean(selectedDate)}
              </Typography>
            </BookingContentHeader>
          </View>
        </GestureDetector>
        <BookingContent>
          <BookingContentScrollView
            showsVerticalScrollIndicator={false}
            scrollEnabled={renderType === 'FULL'}
          >
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
                        공휴일ㆍ{dayDetailData?.holidayName}
                      </Typography>
                    </BookingInfoWrapper>
                  </BookingItem>
                )}
                {bookings.map((booking) => (
                  <BookingItem key={`booking-${booking.id}`} onPress={() => onPressBookingItem(booking.id)}>
                    <BookingInfoWrapper>
                      <BookingBar />
                      <Typography fontSize={14}>
                        {booking.customerName}ㆍ{booking.productName}ㆍ{formatTime(booking.startTime)}~{formatTime(booking.endTime)}
                      </Typography>
                    </BookingInfoWrapper>
                    <BookingDetailButton>
                      <Typography fontSize={11}>상세보기</Typography>
                    </BookingDetailButton>
                  </BookingItem>
                ))}

                {hasPhotographerHoliday && (
                  <BookingItem onPress={onPressHoliday}>
                    <BookingInfoWrapper>
                      <PhotographerHolidayBar />
                      <Typography fontSize={14}>
                        휴가
                      </Typography>
                    </BookingInfoWrapper>
                    <BookingDetailButton>
                      <Typography fontSize={11}>상세보기</Typography>
                    </BookingDetailButton>
                  </BookingItem>
                )}

                {personalSchedules.map((schedule) => (
                  <BookingItem key={`schedule-${schedule.id}`} onPress={() => onPressPersonalSchedule(schedule.id)}>
                    <BookingInfoWrapper>
                      <PersonalScheduleBar />
                      <Typography fontSize={14}>
                        {schedule.title}ㆍ{formatTime(schedule.startTime)}~{formatTime(schedule.endTime)}
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
      </BookingContentContainer>
      <Animated.View style={floatingAnimatedStyle} pointerEvents="box-none">
        <ScheduleDDayBlock>
          <Typography fontSize={14} fontWeight="bold">
            {dDayText}
          </Typography>
        </ScheduleDDayBlock>
        <FloatingButton onPress={onPressAddSchedule}>
          <Icon width={20} height={20} Svg={CrossIcon} />
        </FloatingButton>
      </Animated.View>
    </Container>
  );
}

const Container = styled.View`
  flex: 1
`

const CalendarWrapper = styled(Animated.View)`
  flex: 1;
  width: 100%;
`

const BookingContentContainer = styled(Animated.View)`
  //flex: 1;
  width: 100%;
  background-color: #EAEAEA;
`;

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
  background-color: #E84E4E;
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

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ScheduleDDayBlock = styled.View`
  width: 54px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border-radius: 25px;
  background-color: #fff;
  position: absolute;
  bottom: 20px;
  left: ${SCREEN_WIDTH / 2  - 27}px;
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
  bottom: 20px;
`