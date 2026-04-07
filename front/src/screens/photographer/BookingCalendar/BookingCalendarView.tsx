import {
  ScheduleCalendarHeader,
  ScheduleCalendarGrid,
  EnhancedScheduleData,
} from '@/components/domain/booking/ScheduleCalendar.tsx';
import { useModalStore } from '@/store/modalStore';
import styled from '@/utils/scale/CustomStyled.ts';
import { Typography } from '@/components/ui';
import { theme } from '@/theme';
import Icon from '@/components/ui/Icon.tsx';
import CrossIcon from '@/assets/icons/cross-white.svg';
import { GetPhotographerDayDetailResponse } from '@/api/schedules';
import { formatTime } from '@/utils/format.ts';
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { Dimensions, View, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
  withTiming, Easing, interpolate, Extrapolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';

interface BookingCalendarViewProps {
  selectedDate: string;
  isToday: boolean;
  scheduleData: EnhancedScheduleData[];
  currentYearMonth: string;
  weekCount: number;
  dayDetailData: GetPhotographerDayDetailResponse | null;
  onPressBookingItem: (bookingId: number) => void;
  onPressPersonalSchedule: (id: number) => void;
  onPressHoliday: () => void;
  onSelectToday: () => void;
  onSelectDate: (date: string) => void;
  onPressAddSchedule: () => void;
  onMonthChange: (yearMonth: string) => void;
}

const CALENDAR_HEADER_HEIGHT = 76;
const DAY_HEIGHT = 62;
const MAX_WEEK_COUNT = 6; // 캘린더 최대 주차 수 (높이 통일 기준)
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 통일된 타이밍 설정 (빠르고 예측 가능한 감속 커브)
const SNAP_TIMING_CONFIG = {
  duration: 280,
  easing: Easing.out(Easing.cubic),
};

// 이전달 계산
const getPrevMonth = (yearMonth: string) => {
  const [year, month] = yearMonth.split('-').map(Number);
  if (month === 1) {
    return `${year - 1}-12`;
  }
  return `${year}-${String(month - 1).padStart(2, '0')}`;
};

// 다음달 계산
const getNextMonth = (yearMonth: string) => {
  const [year, month] = yearMonth.split('-').map(Number);
  if (month === 12) {
    return `${year + 1}-01`;
  }
  return `${year}-${String(month + 1).padStart(2, '0')}`;
};

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
  isToday,
  scheduleData,
  currentYearMonth,
  weekCount: _weekCount,
  dayDetailData,
  onPressBookingItem,
  onPressPersonalSchedule,
  onPressHoliday,
  onSelectToday,
  onSelectDate,
  onPressAddSchedule,
  onMonthChange,
}: BookingCalendarViewProps) {
  const { openMonthPickerModal } = useModalStore();

  const [containerHeight, setContainerHeight] = useState(0);
  // containerHeight에서 동기 계산 (useEffect 비동기 딜레이 제거)
  const defaultHeight = containerHeight > 0
    ? containerHeight - (CALENDAR_HEADER_HEIGHT + MAX_WEEK_COUNT * DAY_HEIGHT) + 20
    : 0;
  const [renderType, setRenderType] = useState<'HIDDEN' | 'DEFAULT' | 'FULL'>('HIDDEN');

  // onLayout 측정 완료 여부
  const isLayoutReady = containerHeight > 0;

  // 제스처 완료 후 React state만 동기화 (애니메이션은 제스처 onEnd에서 이미 처리됨)
  const deferredSetRenderType = useCallback((type: 'HIDDEN' | 'DEFAULT' | 'FULL') => {
    requestAnimationFrame(() => {
      setRenderType(type);
    });
  }, []);

  // 방법 C: 월 목록을 상태로 관리 [이전달, 현재달, 다음달]
  const [months, setMonths] = useState(() => [
    getPrevMonth(currentYearMonth),
    currentYearMonth,
    getNextMonth(currentYearMonth),
  ]);

  // 이전/다음 달 지연 렌더링 (현재 달 우선)
  const [isAdjacentMonthsReady, setIsAdjacentMonthsReady] = useState(false);

  // 가로 스크롤 관련
  const scrollViewRef = useRef<ScrollView>(null);

  // 오늘 날짜의 년월 계산
  const todayYearMonth = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }, []);

  // 외부 currentYearMonth 변경 시 months 배열 동기화 (헤더 화살표 클릭 등)
  // months를 dependency에서 제외 - 내부 변경(스와이프, 오늘버튼)에 반응하지 않도록
  useEffect(() => {
    if (months[1] !== currentYearMonth) {
      setMonths([
        getPrevMonth(currentYearMonth),
        currentYearMonth,
        getNextMonth(currentYearMonth),
      ]);
      // 스크롤 위치를 가운데로
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: SCREEN_WIDTH, animated: false });
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentYearMonth]);

  // containerHeight 설정 후 즉시 이전/다음 달 렌더링 준비
  useEffect(() => {
    if (!containerHeight) return;

    // 현재 달이 렌더링된 후 다음 프레임에 이전/다음 달 렌더링
    requestAnimationFrame(() => {
      setIsAdjacentMonthsReady(true);
      // 스크롤 위치를 가운데로
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: SCREEN_WIDTH, animated: false });
      }, 0);
    });
  }, [containerHeight]);

  // 스크롤 종료 시 처리 (방법 C: 배열 조작)
  const handleScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / SCREEN_WIDTH);

    // 가운데(현재달)면 아무것도 안함
    if (pageIndex === 1) return;

    if (pageIndex === 0) {
      // 이전달로 이동: 맨 앞에 새 달 추가, 맨 뒤 삭제
      const newPrevMonth = getPrevMonth(months[0]);
      const newMonths = [newPrevMonth, months[0], months[1]];
      setMonths(newMonths);
      onMonthChange(months[0]); // 새 현재달 알림
    } else if (pageIndex === 2) {
      // 다음달로 이동: 맨 뒤에 새 달 추가, 맨 앞 삭제
      const newNextMonth = getNextMonth(months[2]);
      const newMonths = [months[1], months[2], newNextMonth];
      setMonths(newMonths);
      onMonthChange(months[2]); // 새 현재달 알림
    }

    // 스크롤 위치를 즉시 가운데로 리셋 (배열이 바뀌었으므로)
    scrollViewRef.current?.scrollTo({ x: SCREEN_WIDTH, animated: false });
  }, [months, onMonthChange]);

  // 헤더 화살표 클릭 핸들러
  const handlePressLeft = useCallback(() => {
    onMonthChange(getPrevMonth(currentYearMonth));
  }, [currentYearMonth, onMonthChange]);

  const handlePressRight = useCallback(() => {
    onMonthChange(getNextMonth(currentYearMonth));
  }, [currentYearMonth, onMonthChange]);

  // 헤더 연도.월 클릭 핸들러
  const currentDateForPicker = useMemo(() => {
    const [year, month] = currentYearMonth.split('-').map(Number);
    return new Date(year, month - 1, 1);
  }, [currentYearMonth]);

  const handlePressYearMonth = useCallback(() => {
    openMonthPickerModal(
      currentDateForPicker,
      (newDate: Date) => {
        const year = newDate.getFullYear();
        const month = String(newDate.getMonth() + 1).padStart(2, '0');
        setTimeout(() => {
          onMonthChange(`${year}-${month}`);
        }, 50);
      },
      2001,
    );
  }, [currentDateForPicker, onMonthChange, openMonthPickerModal]);

  // 오늘 버튼 클릭 핸들러 - 오늘 날짜가 있는 달로 이동
  const handleSelectToday = useCallback(() => {
    if (months[1] !== todayYearMonth) {
      setMonths([
        getPrevMonth(todayYearMonth),
        todayYearMonth,
        getNextMonth(todayYearMonth),
      ]);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: SCREEN_WIDTH, animated: false });
      }, 0);
      // 부모의 currentYearMonth도 업데이트 (useEffect 동기화 방지)
      onMonthChange(todayYearMonth);
    }
    onSelectToday();
  }, [months, todayYearMonth, onSelectToday, onMonthChange]);

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

  // 수정 A: 초기 상태가 HIDDEN이므로  sheetHeight=0으로 시작하되,
  // ScheduleCalendarGrid에 전달되는 containerHeight가 이미 initialContainerHeight로
  // 세팅되어 있으므로 hiddenMaxMargin이 올바르게 초기 계산됨
  const sheetHeight = useSharedValue(0);
  const dragStartHeight = useSharedValue(0);
  const renderTypeSV = useSharedValue<'HIDDEN' | 'DEFAULT' | 'FULL'>('HIDDEN');

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: sheetHeight.value,
    };
  });

  // 날짜 선택 핸들러 - HIDDEN 상태에서 날짜를 선택하면 DEFAULT로 전환 (직접 애니메이션)
  // useCallback으로 참조 안정화 → ScheduleCalendarGrid 리렌더 방지
  const handleSelectDate = useCallback((date: string) => {
    if (renderTypeSV.value === 'HIDDEN' && defaultHeight > 0) {
      // 1. 날짜 하이라이트 + state 즉시 반영
      renderTypeSV.value = 'DEFAULT';
      setRenderType('DEFAULT');
      onSelectDate(date);
      // 2. 리렌더가 끝난 후 애니메이션 시작 (프레임 드랍 방지)
      requestAnimationFrame(() => {
        sheetHeight.value = withTiming(defaultHeight, SNAP_TIMING_CONFIG);
      });
      return;
    }
    onSelectDate(date);
  }, [defaultHeight, onSelectDate, renderTypeSV, sheetHeight]);

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
      const velocity = e.velocityY;

      const SNAP_HIDDEN = defaultHeight * 0.4;
      const SNAP_FULL = defaultHeight + (containerHeight - defaultHeight) * 0.6;

      if (renderTypeSV.value === 'FULL') {
        if (velocity > 500 || current < SNAP_FULL) {
          sheetHeight.value = withTiming(defaultHeight, SNAP_TIMING_CONFIG, () => {
            renderTypeSV.value = 'DEFAULT';
            runOnJS(deferredSetRenderType)('DEFAULT');
          });
        } else {
          sheetHeight.value = withTiming(containerHeight, SNAP_TIMING_CONFIG);
        }
        return;
      }

      if (velocity > 500 || current < SNAP_HIDDEN) {
        sheetHeight.value = withTiming(0, SNAP_TIMING_CONFIG, () => {
          renderTypeSV.value = 'HIDDEN';
          runOnJS(deferredSetRenderType)('HIDDEN');
        });
      }
      else if (velocity < -500 || current > SNAP_FULL) {
        sheetHeight.value = withTiming(containerHeight, SNAP_TIMING_CONFIG, () => {
          renderTypeSV.value = 'FULL';
          runOnJS(deferredSetRenderType)('FULL');
        });
      }
      else {
        sheetHeight.value = withTiming(defaultHeight, SNAP_TIMING_CONFIG, () => {
          renderTypeSV.value = 'DEFAULT';
          runOnJS(deferredSetRenderType)('DEFAULT');
        });
      }
    });

  const calendarPanGesture = Gesture.Pan()
    .onBegin(() => {
      if (renderTypeSV.value !== 'HIDDEN') return;
      dragStartHeight.value = sheetHeight.value;
    })
    .onUpdate((e) => {
      if (renderTypeSV.value !== 'HIDDEN' || e.translationY > 0) return;

      const nextHeight = dragStartHeight.value - e.translationY * DRAG_DAMPING;
      sheetHeight.value = Math.min(defaultHeight, Math.max(0, nextHeight));
    })
    .onEnd((e) => {
      if (renderTypeSV.value !== 'HIDDEN') return;

      const current = sheetHeight.value;
      const velocity = e.velocityY;

      const THRESHOLD = defaultHeight * 0.3;

      if (velocity < -300 || current > THRESHOLD) {
        sheetHeight.value = withTiming(defaultHeight, SNAP_TIMING_CONFIG, () => {
          renderTypeSV.value = 'DEFAULT';
          runOnJS(deferredSetRenderType)('DEFAULT');
        });
      } else {
        sheetHeight.value = withTiming(0, SNAP_TIMING_CONFIG);
      }
    });

  const floatingAnimatedStyle = useAnimatedStyle(() => {
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
    <>
      <Container
        onLayout={e => {
          setContainerHeight(e.nativeEvent.layout.height);
        }}
      >
        <Animated.View style={{ flex: 1 }}>
          <GestureDetector gesture={calendarPanGesture}>
            <Animated.View style={{ flex: 1 }}>
              {/* 
                고정 헤더 & 가로 스와이프 가능한 날짜 그리드
                - isLayoutReady가 true가 될 때(onLayout으로 컨테이너 높이 계산 완료 후) 렌더링하여
                ScheduleCalendarGrid의 useSharedValue 초깃값이 정확하게 들어가도록 함.
                - opacity 토글만 하면 1프레임 딜레이로 인한 마진 팽창이 보일 수 있으므로 아예 마운트를 지연시킴.
              */}
              {isLayoutReady && (
                <>
                  <ScheduleCalendarHeader
                    currentYearMonth={months[1]}
                    onPressLeft={handlePressLeft}
                    onPressRight={handlePressRight}
                    onPressYearMonth={handlePressYearMonth}
                  />
                  {isAdjacentMonthsReady ? (
                    <ScrollView
                      ref={scrollViewRef}
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      scrollEnabled={renderType !== 'FULL'}
                      onMomentumScrollEnd={handleScrollEnd}
                      scrollEventThrottle={16}
                      contentOffset={{ x: SCREEN_WIDTH, y: 0 }}
                    >
                      {months.map((month) => (
                        <View key={month} style={{ width: SCREEN_WIDTH }}>
                          <ScheduleCalendarGrid
                            displayYearMonth={month}
                            selectedDate={selectedDate}
                            onSelectDate={handleSelectDate}
                            scheduleData={scheduleData}
                            containerHeight={containerHeight}
                            sheetHeight={sheetHeight}
                            defaultHeight={defaultHeight}
                            calendarHeaderHeight={CALENDAR_HEADER_HEIGHT}
                            dayRowHeight={DAY_HEIGHT}
                          />
                        </View>
                      ))}
                    </ScrollView>
                  ) : (
                    /* 현재달만 먼저 렌더링 */
                    <View style={{ width: SCREEN_WIDTH }}>
                      <ScheduleCalendarGrid
                        displayYearMonth={months[1]}
                        selectedDate={selectedDate}
                        onSelectDate={handleSelectDate}
                        scheduleData={scheduleData}
                        containerHeight={containerHeight}
                        sheetHeight={sheetHeight}
                        defaultHeight={defaultHeight}
                        calendarHeaderHeight={CALENDAR_HEADER_HEIGHT}
                        dayRowHeight={DAY_HEIGHT}
                      />
                    </View>
                  )}
                </>
              )}
            </Animated.View>
          </GestureDetector>
        </Animated.View>
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
            {!isToday &&
              <ScheduleDDayBlock onPress={handleSelectToday}>
                <Typography fontSize={14} fontWeight="bold">
                  오늘
                </Typography>
              </ScheduleDDayBlock>
            }
            {isDateSelected && (
              <FloatingButton onPress={onPressAddSchedule}>
                <Icon width={20} height={20} Svg={CrossIcon} />
              </FloatingButton>
            )}
          </Animated.View>
        </BookingContentContainer>
      </Container>

    </>
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

const ScheduleDDayBlock = styled.TouchableOpacity`
  width: 54px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border-radius: 25px;
  background-color: #fff;
  position: absolute;
  bottom: 20px;
  left: ${SCREEN_WIDTH / 2 - 27}px;
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
