import { useState, useEffect, useRef } from 'react';
import { Platform, Animated, Dimensions } from 'react-native';
import styled from '@/utils/scale/CustomStyled';
import IconButton from '@/components/IconButton';
import CancelIcon from '@/assets/icons/cancel.svg';
import TimeCircleIcon from '@/assets/icons/time-circle.svg';
import DocumentIcon from '@/assets/icons/document.svg';
import { Typography, Alert } from '@/components/theme';
import PrimaryToggleButton from '@/components/theme/PrimaryToggleButton';
import DatePicker from 'react-native-date-picker';
import { theme } from '@/theme';
import { PersonalSchedule } from '@/store/modalStore';
import { usePersonalScheduleQuery } from '@/queries/schedules';
import { useCreatePersonalScheduleMutation, useUpdatePersonalScheduleMutation } from '@/mutations/schedules';
import { PersonalSchedule as APIPersonalSchedule } from '@/api/schedules';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface AddScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (schedule: Omit<PersonalSchedule, 'id'>) => void;
  initialSchedule?: PersonalSchedule;
  isDuplicate?: boolean; // 복사 모드 여부
  scheduleId?: number; // API로부터 불러올 스케줄 ID (수정 모드)
}

export default function AddScheduleModal({
  visible,
  onClose,
  onSubmit,
  initialSchedule,
  isDuplicate = false,
  scheduleId,
}: AddScheduleModalProps) {
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
  const createMutation = useCreatePersonalScheduleMutation();
  const updateMutation = useUpdatePersonalScheduleMutation();

  const isDirty =
    title !== '' ||
    description !== '' ||
    location !== '';

  const resetModal = () => {
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
      const { startDate: startDateStr, endDate: endDateStr, startTime, endTime, title: apiTitle, content } = apiScheduleData;

      // YYYY-MM-DD와 HH:mm을 Date 객체로 변환
      const startDateTime = new Date(`${startDateStr}T${startTime}`);
      const endDateTime = new Date(`${endDateStr}T${endTime}`);

      // 종일 여부 판단 (00:00 ~ 23:59 or 00:00 ~ 00:00)
      const isAllDaySchedule = startTime === '00:00' && (endTime === '23:59' || endTime === '00:00');

      setTitle(apiTitle);
      setIsAllDay(isAllDaySchedule);
      setStartDate(startDateTime);
      setEndDate(endDateTime);
      setDescription(content || '');
      previousStartDateRef.current = startDateTime;
    } else if (visible && initialSchedule) {
      // 로컬 데이터를 로드
      setTitle(initialSchedule.title);
      setIsAllDay(initialSchedule.isAllDay);
      setStartDate(initialSchedule.startDate);
      setEndDate(initialSchedule.endDate);
      setDescription(initialSchedule.description || '');
      previousStartDateRef.current = initialSchedule.startDate;
    } else if (visible && !initialSchedule && !apiScheduleData) {
      resetModal();
      const now = new Date();
      previousStartDateRef.current = now;
    }
  }, [visible, initialSchedule, apiScheduleData]);

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

  const handlePressClose = () => {
    if (isDirty) {
      Alert.show({
        title: `일정 ${initialSchedule ? '수정' : '추가'}을 그만둘까요?`,
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
  };

  const handlePressSave = () => {
    if (!title.trim()) {
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

    const apiSchedule: Omit<APIPersonalSchedule, 'id'> = {
      title: title.trim(),
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      startTime: isAllDay ? '00:00' : formatTime(startDate),
      endTime: isAllDay ? '23:59' : formatTime(endDate),
      content: description.trim() || '',
    };

    if (scheduleId) {
      // 수정 모드
      updateMutation.mutate(
        { id: scheduleId, body: { ...apiSchedule, id: scheduleId } },
        {
          onSuccess: () => {
            // 로컬 상태 업데이트를 위해 onSubmit 호출
            onSubmit({
              title: title.trim(),
              startDate,
              endDate,
              isAllDay,
              description: description.trim() || undefined,
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
      // 생성 모드
      createMutation.mutate(
        { ...apiSchedule, id: 0 }, // id는 서버에서 생성
        {
          onSuccess: () => {
            // 로컬 상태 업데이트를 위해 onSubmit 호출
            onSubmit({
              title: title.trim(),
              startDate,
              endDate,
              isAllDay,
              description: description.trim() || undefined,
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
          <TitleInputWrapper>
            <TitleInput
              placeholder="일정 제목을 입력하세요."
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#A4A4A4"
            />
          </TitleInputWrapper>

          <AllDaySection>
            <AllDayLeft>
              <TimeCircleIcon width={24} height={24} />
              <AllDayText>
                <Typography fontSize={16}>종일</Typography>
              </AllDayText>
            </AllDayLeft>
            <PrimaryToggleButton value={isAllDay} onToggle={setIsAllDay} />
          </AllDaySection>

          <DateTimeSection>
            <DateTimeRow onPress={() => setStartDatePickerVisible(true)}>
              <DateText>
                <Typography fontSize={16}>{formatDate(startDate)}</Typography>
              </DateText>
              {!isAllDay && (
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
              {!isAllDay && (
                <TimeText>
                  <Typography fontSize={16} color="#A4A4A4">
                    {formatTime(endDate)}
                  </Typography>
                </TimeText>
              )}
            </DateTimeRow>
          </DateTimeSection>

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
        </ScrollContainer>
      </AnimatedContainer>

      <DatePicker
        modal
        mode={isAllDay ? 'date' : 'datetime'}
        open={startDatePickerVisible}
        date={startDate}
        onConfirm={handleStartDateChange}
        onCancel={() => setStartDatePickerVisible(false)}
        locale="ko"
        title="시작 날짜"
      />

      <DatePicker
        modal
        mode={isAllDay ? 'date' : 'datetime'}
        open={endDatePickerVisible}
        date={endDate}
        minimumDate={startDate}
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
