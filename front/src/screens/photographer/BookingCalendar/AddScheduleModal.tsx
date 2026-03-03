import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, Animated, Dimensions, BackHandler } from 'react-native';
import styled from '@/utils/scale/CustomStyled';
import IconButton from '@/components/ui/IconButton';
import CancelIcon from '@/assets/icons/cancel.svg';
import TimeCircleIcon from '@/assets/icons/time-circle.svg';
import DocumentIcon from '@/assets/icons/document.svg';
import ArrowDownIcon from '@/assets/icons/arrow-down.svg';
import Icon from '@/components/ui/Icon';
import { Typography, Alert } from '@/components/ui';
import PrimaryToggleButton from '@/components/ui/PrimaryToggleButton';
import DatePicker from 'react-native-date-picker';
import { theme } from '@/theme';
import { PersonalSchedule, ScheduleType } from '@/store/modalStore';
import { usePersonalScheduleQuery } from '@/queries/schedules';
import { useCreatePersonalScheduleMutation, useUpdatePersonalScheduleMutation } from '@/mutations/schedules';
import { PersonalSchedule as APIPersonalSchedule } from '@/api/schedules';
import { useCreateHolidayMutation, useDeleteHolidayMutation } from '@/mutations/holidays';
import { getPhotographerDayDetail } from '@/api/schedules';
import { useAuthStore } from '@/store/authStore';
import { useFocusEffect } from '@react-navigation/native';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface AddScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (schedule: Omit<PersonalSchedule, 'id'>) => void;
  initialSchedule?: PersonalSchedule;
  isDuplicate?: boolean; // 복사 모드 여부
  scheduleId?: number; // API로부터 불러올 스케줄 ID (수정 모드)
  initialStartDate?: Date;
}

export default function AddScheduleModal({
  visible,
  onClose,
  onSubmit,
  initialSchedule,
  isDuplicate = false,
  scheduleId,
  initialStartDate,
}: AddScheduleModalProps) {
  const [scheduleType, setScheduleType] = useState<ScheduleType>('personal');
  const [isTypeListVisible, setIsTypeListVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  const [startDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [endDatePickerVisible, setEndDatePickerVisible] = useState(false);

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const previousStartDateRef = useRef<Date>(new Date());

  // API hooks
  const { data: apiScheduleData } = usePersonalScheduleQuery(scheduleId, visible && !!scheduleId);
  const userId = useAuthStore((state) => state.userId);
  const createMutation = useCreatePersonalScheduleMutation();
  const updateMutation = useUpdatePersonalScheduleMutation();
  const createHolidayMutation = useCreateHolidayMutation();
  const deleteHolidayMutation = useDeleteHolidayMutation();

  const isDirty =
    title !== '' ||
    description !== '' ||
    location !== '';

  const resetModal = () => {
    setScheduleType('personal');
    setTitle('');
    setIsAllDay(false);
    setStartDate(new Date());
    setEndDate(new Date());
    setDescription('');
    setLocation('');
  };

  // Load initial schedule data when modal opens
  useEffect(() => {
    if (visible && apiScheduleData) {
      // API 데이터를 로드 (수정 모드)
      const { startDate: startDateStr, endDate: endDateStr, startTime, endTime, title: apiTitle, description } = apiScheduleData;

      // YYYY-MM-DD와 HH:mm:ss을 Date 객체로 변환
      const startDateTime = new Date(`${startDateStr}T${startTime}`);
      const endDateTime = new Date(`${endDateStr}T${endTime}`);

      // 종일 여부 판단 (00:00:00 ~ 23:59:59)
      const isAllDaySchedule =
        startTime === '00:00:00' && endTime === '23:59:59';

      setTitle(apiTitle);
      setIsAllDay(isAllDaySchedule);
      setStartDate(startDateTime);
      setEndDate(endDateTime);
      setDescription(description || '');
      setScheduleType('personal'); // API는 항상 personal schedule
      previousStartDateRef.current = startDateTime;
    } else if (visible && initialSchedule) {
      // 로컬 데이터를 로드
      setScheduleType(initialSchedule.scheduleType || 'personal');
      setTitle(initialSchedule.title);
      setIsAllDay(initialSchedule.isAllDay);
      setStartDate(initialSchedule.startDate);
      setEndDate(initialSchedule.endDate);
      setDescription(initialSchedule.description || '');
      previousStartDateRef.current = initialSchedule.startDate;
    } else if (visible && !initialSchedule && !apiScheduleData) {
      resetModal();
      const baseDate = initialStartDate ?? new Date();
      setStartDate(baseDate);
      setEndDate(baseDate);
      previousStartDateRef.current = baseDate;
    }
  }, [visible, initialSchedule, apiScheduleData, initialStartDate]);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handlePressClose = useCallback(() => {
    if (isDirty) {
      Alert.show({
        title: `일정 ${initialSchedule ? '수정을' : '추가를'} 그만둘까요?`,
        message: '변경된 내용은 저장되지 않아요.',
        buttons: [
          {
            text: '나가기',
            type: 'cancel',
            onPress: () => {
              resetModal();
              onClose();
            },
          },
          {
            text: '계속하기',
            type: 'destructive',
            onPress: () => {},
          },
        ],
      });
    } else {
      resetModal();
      onClose();
    }
  }, [initialSchedule, isDirty, onClose]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (handlePressClose) {
          handlePressClose();
          return true; // 시스템 종료 방지
        }

        return false; // 더 이상 뒤로 갈 곳이 없으면 앱 종료 허용
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [handlePressClose])
  );

  // 휴가 기간 찾기 함수
  const findHolidayRange = async (baseDate: Date, photographerId: string) => {
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    let startDate = new Date(baseDate);
    let endDate = new Date(baseDate);

    // 시작 날짜 찾기 (이전으로 거슬러 올라가기)
    let currentDate = new Date(baseDate);
    currentDate.setDate(currentDate.getDate() - 1);

    while (true) {
      try {
        const dayDetail = await getPhotographerDayDetail({
          photographerId,
          date: formatDate(currentDate),
        });

        if (dayDetail.holidayId !== null) {
          startDate = new Date(currentDate);
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      } catch (error) {
        break;
      }
    }

    // 종료 날짜 찾기 (다음으로 내려가기)
    currentDate = new Date(baseDate);
    currentDate.setDate(currentDate.getDate() + 1);

    while (true) {
      try {
        const dayDetail = await getPhotographerDayDetail({
          photographerId,
          date: formatDate(currentDate),
        });

        if (dayDetail.holidayId !== null) {
          endDate = new Date(currentDate);
          currentDate.setDate(currentDate.getDate() + 1);
        } else {
          break;
        }
      } catch (error) {
        break;
      }
    }

    return { startDate, endDate };
  };

  const handlePressSave = () => {
    // 휴가 타입은 title 검증 불필요
    if (scheduleType === 'personal' && !title.trim()) {
      Alert.show({
        title: '일정 제목을 입력해주세요',
        message: '일정 제목은 필수입니다.',
        buttons: [{ text: '확인', onPress: () => {} }],
      });
      return;
    }

    // 복사 모드에서 날짜가 변경되지 않았으면 저장 불가
    if (isDuplicate && initialSchedule) {
      const isSameStartDate =
        startDate.getFullYear() === initialSchedule.startDate.getFullYear() &&
        startDate.getMonth() === initialSchedule.startDate.getMonth() &&
        startDate.getDate() === initialSchedule.startDate.getDate();

      const isSameEndDate =
        endDate.getFullYear() === initialSchedule.endDate.getFullYear() &&
        endDate.getMonth() === initialSchedule.endDate.getMonth() &&
        endDate.getDate() === initialSchedule.endDate.getDate();

      if (isSameStartDate && isSameEndDate) {
        Alert.show({
          title: '날짜를 변경해주세요',
          message: '일정을 복사하려면 날짜를 변경해야 합니다.',
          buttons: [{ text: '확인', onPress: () => {} }],
        });
        return;
      }
    }

    // Date 객체를 API 형식으로 변환
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const formatTime = (date: Date) => {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    // 휴가 타입 처리
    if (scheduleType === 'holiday') {
      // 날짜 범위 생성
      const generateDateRange = (start: Date, end: Date): string[] => {
        const dates: string[] = [];
        const current = new Date(start);
        current.setHours(0, 0, 0, 0);
        const endDate = new Date(end);
        endDate.setHours(0, 0, 0, 0);

        while (current <= endDate) {
          dates.push(formatDate(current));
          current.setDate(current.getDate() + 1);
        }
        return dates;
      };

      const newDates = generateDateRange(startDate, endDate);
      const isEditMode = !isDuplicate && initialSchedule?.scheduleType === 'holiday';

      if (isEditMode && initialSchedule && userId) {
        // 휴가 수정 모드 - 기존 휴가 기간 찾기
        const updateHolidays = async () => {
          try {
            // 기존 휴가 기간 찾기
            const holidayRange = await findHolidayRange(initialSchedule.startDate, userId);
            const existingDates = generateDateRange(holidayRange.startDate, holidayRange.endDate);

            // 추가할 날짜 (새로운 범위에는 있지만 기존에는 없던 날짜)
            const datesToAdd = newDates.filter(date => !existingDates.includes(date));
            // 삭제할 날짜 (기존에는 있었지만 새로운 범위에는 없는 날짜)
            const datesToDelete = existingDates.filter(date => !newDates.includes(date));

            // 삭제할 날짜에 대한 휴가 삭제 - dayDetail 조회해서 holidayId 찾기
            for (const dateToDelete of datesToDelete) {
              try {
                const dayDetail = await getPhotographerDayDetail({
                  photographerId: userId,
                  date: dateToDelete,
                });
                if (dayDetail.holidayId !== null) {
                  await deleteHolidayMutation.mutateAsync(dayDetail.holidayId);
                }
              } catch (error) {
                console.error('Failed to delete holiday:', error);
              }
            }

            // 추가할 날짜 생성
            for (const dateToAdd of datesToAdd) {
              await createHolidayMutation.mutateAsync({
                holidayDate: dateToAdd,
              });
            }

            onSubmit({
              title: '휴가',
              startDate,
              endDate,
              isAllDay: true,
              scheduleType: 'holiday',
            });
            resetModal();
            onClose();
          } catch (error) {
            Alert.show({
              title: '휴가 수정 실패',
              message: '휴가 수정에 실패했습니다. 다시 시도해주세요.',
              buttons: [{ text: '확인', onPress: () => {} }],
            });
          }
        };
        updateHolidays();
      } else {
        // 휴가 생성 모드
        const createHolidaysAsync = async () => {
          try {
            for (const date of newDates) {
              await createHolidayMutation.mutateAsync({
                holidayDate: date,
              });
            }
            onSubmit({
              title: '휴가',
              startDate,
              endDate,
              isAllDay: true,
              scheduleType: 'holiday',
            });
            resetModal();
            onClose();
          } catch (error) {
            Alert.show({
              title: '휴가 생성 실패',
              message: '휴가 생성에 실패했습니다. 다시 시도해주세요.',
              buttons: [{ text: '확인', onPress: () => {} }],
            });
          }
        };
        createHolidaysAsync();
      }
      return;
    }

    // 개인 일정 처리
    const apiSchedule: Omit<APIPersonalSchedule, 'id'> = {
      title: title.trim(),
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      startTime: isAllDay ? '00:00:00' : formatTime(startDate),
      endTime: isAllDay ? '23:59:59' : formatTime(endDate),
      description: description.trim() || '',
    };

    // Check if this is edit mode (scheduleId or initialSchedule.id exists and not duplicate mode)
    const isEditMode = !isDuplicate && (scheduleId || initialSchedule?.id);
    const editId = scheduleId || (initialSchedule?.id ? Number(initialSchedule.id) : undefined);

    if (isEditMode && editId) {
      // 수정 모드
      updateMutation.mutate(
        { id: editId, body: { ...apiSchedule } },
        {
          onSuccess: () => {
            // 로컬 상태 업데이트를 위해 onSubmit 호출
            onSubmit({
              title: title.trim(),
              startDate,
              endDate,
              isAllDay,
              description: description.trim() || undefined,
              scheduleType: 'personal',
            });
            resetModal();
            onClose();
          },
          onError: () => {
            Alert.show({
              title: '일정 수정 실패',
              message: '일정 수정에 실패했습니다. 다시 시도해주세요.',
              buttons: [{ text: '확인', onPress: () => {} }],
            });
          },
        }
      );
    } else {
      // 생성 모드 (복사 모드 포함)
      createMutation.mutate(
        { ...apiSchedule },
        {
          onSuccess: () => {
            // 로컬 상태 업데이트를 위해 onSubmit 호출
            onSubmit({
              title: title.trim(),
              startDate,
              endDate,
              isAllDay,
              description: description.trim() || undefined,
              scheduleType: 'personal',
            });
            resetModal();
            onClose();
          },
          onError: () => {
            Alert.show({
              title: '일정 생성 실패',
              message: '일정 생성에 실패했습니다. 다시 시도해주세요.',
              buttons: [{ text: '확인', onPress: () => {} }],
            });
          },
        }
      );
    }
  };

  const formatDate = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const weekday = weekdays[date.getDay()];
    return `${month}월 ${day}일 ${weekday}`;
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? '오후' : '오전';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${period} ${displayHours}:${String(minutes).padStart(2, '0')}`;
  };

  const handleStartDateChange = (date: Date) => {
    const timeDiff = date.getTime() - previousStartDateRef.current.getTime();
    const newEndDate = new Date(endDate.getTime() + timeDiff);

    setStartDate(date);
    setEndDate(newEndDate);
    setStartDatePickerVisible(false);
    previousStartDateRef.current = date;
  };

  const handlePressTypeSelector = () => {
    setIsTypeListVisible(!isTypeListVisible);
  };

  const handleSelectType = (type: ScheduleType) => {
    setScheduleType(type);
    setIsTypeListVisible(false);
    if (type === 'holiday') {
      setTitle('휴가');
      setIsAllDay(true);
    } else {
      setTitle('');
    }
  };

  // 휴가 날짜 제한: 오늘부터 3개월 후까지
  const getMaxHolidayDate = () => {
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setMonth(maxDate.getMonth() + 3);
    return maxDate;
  };

  const getMinHolidayDate = () => {
    return new Date(); // 오늘부터
  };

  if (!visible) return null;

  return (
    <Overlay>
      <AnimatedContainer style={{ transform: [{ translateY: slideAnim }] }}>
        <Header>
          <IconButton Svg={CancelIcon} width={24} height={24} onPress={handlePressClose} />
          <SaveButton onPress={handlePressSave}>
            <Typography fontSize={16} color={theme.colors.primary}>
              저장
            </Typography>
          </SaveButton>
        </Header>

        <ScrollContainer>
          <TypeSelector>
            <TypeWrapper onPress={handlePressTypeSelector}>
              <TypeLabelWrapper>
                <TypeDot color={scheduleType === 'holiday' ? '#E84E4E' : theme.colors.textPrimary} />
                <Typography fontSize={16} letterSpacing="-2.5%">
                  {scheduleType === 'holiday' ? '휴가' : '개인 일정'}
                </Typography>
              </TypeLabelWrapper>
              <Icon width={24} height={24} Svg={ArrowDownIcon} />
            </TypeWrapper>
            {isTypeListVisible && (
              <TypeList>
                <TypeItem onPress={() => handleSelectType('holiday')}>
                  <TypeDot color="#E84E4E" />
                  <Typography fontSize={16} letterSpacing="-2.5%">
                    휴가
                  </Typography>
                </TypeItem>
                <TypeItem onPress={() => handleSelectType('personal')}>
                  <TypeDot color={theme.colors.textPrimary} />
                  <Typography fontSize={16} letterSpacing="-2.5%">
                    개인 일정
                  </Typography>
                </TypeItem>
              </TypeList>
            )}
          </TypeSelector>

          {scheduleType === 'personal' && (
            <TitleInputWrapper>
              <TitleInput
                placeholder="일정 제목을 입력하세요."
                value={title}
                onChangeText={setTitle}
                placeholderTextColor="#A4A4A4"
              />
            </TitleInputWrapper>
          )}

          {scheduleType === 'personal' && (
            <AllDaySection>
              <AllDayLeft>
                <TimeCircleIcon width={24} height={24} />
                <AllDayText>
                  <Typography fontSize={16}>종일</Typography>
                </AllDayText>
              </AllDayLeft>
              <PrimaryToggleButton value={isAllDay} onToggle={setIsAllDay} />
            </AllDaySection>
          )}

          <DateTimeSection>
            <DateTimeRow onPress={() => setStartDatePickerVisible(true)}>
              <DateText>
                <Typography fontSize={16}>{formatDate(startDate)}</Typography>
              </DateText>
              {scheduleType === 'personal' && !isAllDay && (
                <TimeText>
                  <Typography fontSize={16} color="#A4A4A4">
                    {formatTime(startDate)}
                  </Typography>
                </TimeText>
              )}
            </DateTimeRow>
            <DateTimeRow onPress={() => setEndDatePickerVisible(true)}>
              <DateText>
                <Typography fontSize={16}>{formatDate(endDate)}</Typography>
              </DateText>
              {scheduleType === 'personal' && !isAllDay && (
                <TimeText>
                  <Typography fontSize={16} color="#A4A4A4">
                    {formatTime(endDate)}
                  </Typography>
                </TimeText>
              )}
            </DateTimeRow>
          </DateTimeSection>

          {scheduleType === 'personal' && (
            <>
              <Divider />
              <InputRow>
                <DocumentIcon width={24} height={24} />
                <DescriptionInput
                  placeholder="설명"
                  value={description}
                  onChangeText={setDescription}
                  placeholderTextColor="#A4A4A4"
                  multiline
                  textAlignVertical="top"
                />
              </InputRow>
            </>
          )}
        </ScrollContainer>
      </AnimatedContainer>

      <DatePicker
        modal
        mode={scheduleType === 'holiday' || isAllDay ? 'date' : 'datetime'}
        open={startDatePickerVisible}
        date={startDate}
        minimumDate={scheduleType === 'holiday' ? getMinHolidayDate() : undefined}
        maximumDate={scheduleType === 'holiday' ? getMaxHolidayDate() : undefined}
        onConfirm={handleStartDateChange}
        onCancel={() => setStartDatePickerVisible(false)}
        locale="ko"
        title="시작 날짜"
      />

      <DatePicker
        modal
        mode={scheduleType === 'holiday' || isAllDay ? 'date' : 'datetime'}
        open={endDatePickerVisible}
        date={endDate}
        minimumDate={scheduleType === 'holiday' ? startDate : startDate}
        maximumDate={scheduleType === 'holiday' ? getMaxHolidayDate() : undefined}
        onConfirm={(date) => {
          setEndDate(date);
          setEndDatePickerVisible(false);
        }}
        onCancel={() => setEndDatePickerVisible(false)}
        locale="ko"
        title="종료 날짜"
      />
    </Overlay>
  );
}

const Overlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`;

const AnimatedContainer = styled(Animated.View)`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100%;
  background-color: #fff;
  ${Platform.OS === 'ios' ? `padding-top: 50px;` : ''};
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom-width: 1px;
  border-bottom-color: #E5E5E5;
`;

const SaveButton = styled.TouchableOpacity`
  padding: 8px;
`;

const ScrollContainer = styled.ScrollView`
  flex: 1;
`;

const TypeSelector = styled.View`
  width: 100%;
  height: 62px;
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: #C8C8C8;
  position: relative;
  z-index: 999;
`;

const TypeWrapper = styled.TouchableOpacity`
  width: 100%;
  height: 100%;
  padding-left: 28px;
  padding-right: 22px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const TypeLabelWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const TypeDot = styled.View<{ color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${({ color }) => color};
`;

const TypeList = styled.View`
  flex: 1;
  width: 100%;
  position: absolute;
  left: 0;
  top: 62px;
  z-index: 1001;
  background-color: #FAFAFA;
`;

const TypeItem = styled.TouchableOpacity`
  flex: 1;
  width: 100%;
  height: 62px;
  padding-left: 28px;
  padding-right: 22px;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const TitleInputWrapper = styled.View`
  width: ${SCREEN_WIDTH}px;
  height: 65px;
  border-bottom-width: 1px;
  border-bottom-color: #C8C8C8;
  justify-content: center;
  padding-left: 51px;
`;

const TitleInput = styled.TextInput`
  font-size: 16px;
  color: ${theme.colors.textPrimary};
`;

const AllDaySection = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 26px;
  padding: 0 21px;
`;

const AllDayLeft = styled.View`
  flex-direction: row;
  align-items: center;
`;

const AllDayText = styled.View`
  margin-left: 7px;
`;

const DateTimeSection = styled.View`
  margin-top: 21px;
  padding: 0 50px;
`;

const DateTimeRow = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
  padding-vertical: 8px;
`;

const DateText = styled.View``;

const TimeText = styled.View``;

const Divider = styled.View`
  height: 1px;
  background-color: #C8C8C8;
  margin-top: 40px;
`;

const InputRow = styled.View<{ noBorder?: boolean }>`
  flex-direction: row;
  align-items: flex-start;
  min-height: 55px;
  padding-left: 21px;
  padding-top: 16px;
  padding-bottom: 16px;
  border-bottom-width: ${({ noBorder }) => (noBorder ? 0 : 1)}px;
  border-bottom-color: #C8C8C8;
`;


const DescriptionInput = styled.TextInput`
  flex: 1;
  font-size: 16px;
  color: ${theme.colors.textPrimary};
  margin-left: 7px;
  min-height: 80px;
  max-height: 200px;
`;
