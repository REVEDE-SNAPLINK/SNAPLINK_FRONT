import ScheduleCalendar, { EnhancedScheduleData } from '@/components/ScheduleCalendar.tsx';
import styled from '@/utils/scale/CustomStyled.ts';
import { Typography } from '@/components/theme';
import { theme } from '@/theme';
import Icon from '@/components/Icon.tsx';
import CrossIcon from '@/assets/icons/cross-white.svg';
import { GetPhotographerDayDetailResponse } from '@/api/schedules';
import { formatTime } from '@/utils/format.ts';
import {useEffect, useMemo, useState} from 'react';
import { Dimensions, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
  withTiming, interpolate, Extrapolate, useAnimatedReaction,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface BookingCalendarViewProps {
  selectedDate: string;
  scheduleData: EnhancedScheduleData[];
  currentYearMonth: string;
  weekCount: number;
  dayDetailData: GetPhotographerDayDetailResponse | null;
  dDayText: string;
  onPressBookingItem: (bookingId: number) => void;
  onPressPersonalSchedule: (id: number) => void;
  onPressHoliday: () => void;
  onSelectDate: (date: string) => void;
  onPressAddSchedule: () => void;
  onMonthChange: (yearMonth: string) => void;
}

const CALENDAR_HEADER_HEIGHT = 76;
const DAY_HEIGHT = 62;

const formatDateToKorean = (dateString: string) => {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'][
    date.getDay()
    ];
  return `${month}월 ${day}일 ${dayOfWeek}`;
};

export default function BookingCalendarView({
  selectedDate,
  scheduleData,
  currentYearMonth,
  weekCount,
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
  const [defaultHeight, setDefaultHeight] = useState(0);
  const [renderType, setRenderType] = useState<'HIDDEN' | 'DEFAULT' | 'FULL'>('HIDDEN');

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
  const isDateSelected = selectedDate && selectedDate.trim() !== '';

  const sheetHeight = useSharedValue(0);
  const dragStartHeight = useSharedValue(0);
  const renderTypeSV = useSharedValue<'HIDDEN' | 'DEFAULT' | 'FULL'>('DEFAULT');
  const dayMarginBottom = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: sheetHeight.value,
    };
  });

  // containerHeight와 weekCount가 변경되면 defaultHeight 계산
  useEffect(() => {
    if (!containerHeight || weekCount <= 0) return;
    const calendarHeight = CALENDAR_HEADER_HEIGHT + weekCount * DAY_HEIGHT;
    const newDefaultHeight = containerHeight - calendarHeight;
    setDefaultHeight(newDefaultHeight);
  }, [containerHeight, weekCount]);

  // sheetHeight 변화에 따라 dayMarginBottom 계산
  useAnimatedReaction(
    () => sheetHeight.value,
    (height) => {
      if (!containerHeight || weekCount <= 0 || !defaultHeight) return;

      const calendarHeight = CALENDAR_HEADER_HEIGHT + weekCount * DAY_HEIGHT;
      const maxMargin = (containerHeight - calendarHeight) / weekCount;

      // HIDDEN <-> DEFAULT 구간에서만 marginBottom 변화
      if (height <= 0) {
        // HIDDEN: marginBottom 최대
        dayMarginBottom.value = maxMargin;
      } else if (height < defaultHeight) {
        // HIDDEN -> DEFAULT 사이: 선형 보간
        dayMarginBottom.value = maxMargin * (1 - height / defaultHeight);
      } else {
        // DEFAULT 이상: marginBottom = 0
        dayMarginBottom.value = 0;
      }
    },
    [containerHeight, weekCount, defaultHeight]
  );

  useEffect(() => {
    renderTypeSV.value = renderType;
  }, [renderType, renderTypeSV]);

  // 날짜 선택 핸들러 - HIDDEN 상태에서 날짜를 선택하면 DEFAULT로 전환
  const handleSelectDate = (date: string) => {
    if (renderType === 'HIDDEN') {
      setRenderType('DEFAULT');
    }
    onSelectDate(date);
  };

  const DRAG_DAMPING = 0.8;

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      dragStartHeight.value = sheetHeight.value;
    })
    .onUpdate((e) => {
      if (renderTypeSV.value === 'FULL' && e.translationY < 0) return;

      const nextHeight = dragStartHeight.value - e.translationY * DRAG_DAMPING;
      sheetHeight.value = Math.min(containerHeight, Math.max(0, nextHeight));
    })
    .onEnd((e) => {
      const current = sheetHeight.value;
      const velocity = e.velocityY; // 아래로 빠르게 던지면 양수

      const SNAP_HIDDEN = defaultHeight * 0.4; // 조금 더 아래에서 반응하도록 조정
      const SNAP_FULL = defaultHeight + (containerHeight - defaultHeight) * 0.6;

      // 1. FULL 상태에서의 처리
      if (renderTypeSV.value === 'FULL') {
        if (velocity > 500 || current < SNAP_FULL) {
          sheetHeight.value = withTiming(defaultHeight, {}, () => {
            renderTypeSV.value = 'DEFAULT';
            runOnJS(setRenderType)('DEFAULT');
          });
        } else {
          sheetHeight.value = withTiming(containerHeight);
        }
        return;
      }

      // 2. DEFAULT/HIDDEN 상태에서의 처리
      // 속도가 빠르거나(아래로 던짐), 높이가 임계값보다 낮을 때
      if (velocity > 500 || current < SNAP_HIDDEN) {
        sheetHeight.value = withTiming(0, { duration: 250 }, () => {
          renderTypeSV.value = 'HIDDEN';
          runOnJS(setRenderType)('HIDDEN');
        });
      }
      // 위로 던지거나 높이가 FULL 임계값보다 높을 때
      else if (velocity < -500 || current > SNAP_FULL) {
        sheetHeight.value = withTiming(containerHeight, {}, () => {
          renderTypeSV.value = 'FULL';
          runOnJS(setRenderType)('FULL');
        });
      }
      // 그 외에는 다시 DEFAULT로
      else {
        sheetHeight.value = withTiming(defaultHeight, {}, () => {
          renderTypeSV.value = 'DEFAULT';
          runOnJS(setRenderType)('DEFAULT');
        });
      }
    });

  // HIDDEN 상태에서 캘린더 영역 드래그로 시트 올리기
  const calendarPanGesture = Gesture.Pan()
    .onBegin(() => {
      // HIDDEN 상태일 때만 동작
      if (renderTypeSV.value !== 'HIDDEN') return;
      dragStartHeight.value = sheetHeight.value;
    })
    .onUpdate((e) => {
      // HIDDEN 상태가 아니거나 위로 드래그가 아니면 무시
      if (renderTypeSV.value !== 'HIDDEN' || e.translationY > 0) return;

      const nextHeight = dragStartHeight.value - e.translationY * DRAG_DAMPING;
      // DEFAULT 높이까지만 올라가도록 제한
      sheetHeight.value = Math.min(defaultHeight, Math.max(0, nextHeight));
    })
    .onEnd((e) => {
      // HIDDEN 상태가 아니면 무시
      if (renderTypeSV.value !== 'HIDDEN') return;

      const current = sheetHeight.value;
      const velocity = e.velocityY;

      const THRESHOLD = defaultHeight * 0.3;

      // 위로 빠르게 드래그하거나 임계값을 넘으면 DEFAULT로 전환
      if (velocity < -300 || current > THRESHOLD) {
        sheetHeight.value = withTiming(defaultHeight, { duration: 250 }, () => {
          renderTypeSV.value = 'DEFAULT';
          runOnJS(setRenderType)('DEFAULT');
        });
      } else {
        // 아니면 HIDDEN으로 되돌림
        sheetHeight.value = withTiming(0, { duration: 250 });
      }
    });

  // renderType 변경 시 sheetHeight 애니메이션
  useEffect(() => {
    if (!containerHeight || !defaultHeight) return;

    // 현재 애니메이션이 이미 목표치에 도달했는지 확인 (불필요한 withTiming 방지)
    const targetMap = {
      HIDDEN: 0,
      DEFAULT: defaultHeight,
      FULL: containerHeight,
    };

    const targetValue = targetMap[renderType];

    // 현재 sheetHeight.value가 targetValue와 차이가 클 때만 실행
    if (Math.abs(sheetHeight.value - targetValue) > 1) {
      sheetHeight.value = withTiming(targetValue, { duration: 300 });
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

  return (
    <Container
      onLayout={e => {
        setContainerHeight(e.nativeEvent.layout.height);
      }}
    >
      <GestureDetector gesture={calendarPanGesture}>
        <View style={{ flex: 1 }}>
          <ScheduleCalendar
            initialDate={`${currentYearMonth}-01`}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            scheduleData={scheduleData}
            onMonthChange={onMonthChange}
            dayMarginBottom={dayMarginBottom}
            containerHeight={containerHeight}
          />
        </View>
      </GestureDetector>
      <BookingContentContainer style={animatedStyle}>
        <GestureDetector gesture={panGesture}>
          <View>
            <BookingSlideBarWrapper>
              <BookingSlideBar />
            </BookingSlideBarWrapper>
            <BookingContentHeader>
              <Typography fontSize={16} fontWeight="semiBold">
                {isDateSelected
                  ? formatDateToKorean(selectedDate)
                  : '날짜를 선택해주세요'}
              </Typography>
            </BookingContentHeader>
          </View>
        </GestureDetector>
        <BookingContent>
          <BookingContentScrollView
            showsVerticalScrollIndicator={false}
            scrollEnabled={renderType === 'FULL'}
          >
            {!isDateSelected ? (
              <BookingItem disabled>
                <BookingInfoWrapper>
                  <BookingEmptyBar />
                  <Typography fontSize={14} color="#AAA">
                    날짜를 선택하면 일정을 확인할 수 있습니다
                  </Typography>
                </BookingInfoWrapper>
              </BookingItem>
            ) : !hasSchedules ? (
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
                {bookings.map(booking => (
                  <BookingItem
                    key={`booking-${booking.id}`}
                    onPress={() => onPressBookingItem(booking.id)}
                  >
                    <BookingInfoWrapper>
                      <BookingBar />
                      <Typography fontSize={14}>
                        {booking.customerName}ㆍ{booking.productName}ㆍ
                        {formatTime(booking.startTime)}~
                        {formatTime(booking.endTime)}
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
                      <Typography fontSize={14}>휴가</Typography>
                    </BookingInfoWrapper>
                    <BookingDetailButton>
                      <Typography fontSize={11}>상세보기</Typography>
                    </BookingDetailButton>
                  </BookingItem>
                )}

                {personalSchedules.map(schedule => (
                  <BookingItem
                    key={`schedule-${schedule.id}`}
                    onPress={() => onPressPersonalSchedule(schedule.id)}
                  >
                    <BookingInfoWrapper>
                      <PersonalScheduleBar />
                      <Typography fontSize={14}>
                        {schedule.title}ㆍ{formatTime(schedule.startTime)}~
                        {formatTime(schedule.endTime)}
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
        <Animated.View style={floatingAnimatedStyle} pointerEvents="box-none">
          {isDateSelected &&
            <>
              <ScheduleDDayBlock>
                <Typography fontSize={14} fontWeight="bold">
                  {dDayText}
                </Typography>
              </ScheduleDDayBlock>
              <FloatingButton onPress={onPressAddSchedule}>
                <Icon width={20} height={20} Svg={CrossIcon} />
              </FloatingButton>
            </>
          }
        </Animated.View>
      </BookingContentContainer>
    </Container>
  );
}

const Container = styled.View`
  flex: 1
`

const BookingContentContainer = styled(Animated.View)`
  width: 100%;
  background-color: #EAEAEA;
  position: absolute;
  bottom: 0;
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