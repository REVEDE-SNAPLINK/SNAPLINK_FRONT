import { useState, useEffect, useRef } from 'react';
import { Platform, Animated, Dimensions, TextInput as RNTextInput } from 'react-native';
import styled from '@/utils/scale/CustomStyled';
import IconButton from '@/components/IconButton';
import CancelIcon from '@/assets/icons/cancel.svg';
import TimeCircleIcon from '@/assets/icons/time-circle.svg';
import DocumentIcon from '@/assets/icons/document.svg';
import CameraIcon from '@/assets/icons/camera.svg';
import LocationIcon from '@/assets/icons/location.svg';
import { Typography, Alert } from '@/components/theme';
import PrimaryToggleButton from '@/components/theme/PrimaryToggleButton';
import { theme } from '@/theme';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export interface PersonalSchedule {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  isAllDay: boolean;
  customerName?: string;
  location?: string;
  shootingType?: string;
  shootingCategory?: string;
}

interface AddScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (schedule: Omit<PersonalSchedule, 'id'>) => void;
  initialSchedule?: PersonalSchedule;
}

export default function AddScheduleModal({
  visible,
  onClose,
  onSubmit,
  initialSchedule,
}: AddScheduleModalProps) {
  const [title, setTitle] = useState(initialSchedule?.title || '');
  const [isAllDay, setIsAllDay] = useState(initialSchedule?.isAllDay || false);
  const [startDate, setStartDate] = useState(initialSchedule?.startDate || new Date());
  const [endDate, setEndDate] = useState(initialSchedule?.endDate || new Date());
  const [customerName, setCustomerName] = useState(initialSchedule?.customerName || '');
  const [location, setLocation] = useState(initialSchedule?.location || '');
  const [shootingType, setShootingType] = useState(initialSchedule?.shootingType || '');
  const [shootingCategory, setShootingCategory] = useState(initialSchedule?.shootingCategory || '');

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const isDirty =
    title !== '' ||
    customerName !== '' ||
    location !== '' ||
    shootingType !== '' ||
    shootingCategory !== '';

  const resetModal = () => {
    setTitle('');
    setIsAllDay(false);
    setStartDate(new Date());
    setEndDate(new Date());
    setCustomerName('');
    setLocation('');
    setShootingType('');
    setShootingCategory('');
  };

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
        buttons: [{ text: '확인' }],
      });
      return;
    }

    onSubmit({
      title: title.trim(),
      startDate,
      endDate,
      isAllDay,
      customerName: customerName.trim() || undefined,
      location: location.trim() || undefined,
      shootingType: shootingType.trim() || undefined,
      shootingCategory: shootingCategory.trim() || undefined,
    });
    resetModal();
    onClose();
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

  if (!visible) return null;

  return (
    <Overlay>
      <ModalContainer style={{ transform: [{ translateY: slideAnim }] }}>
        <Header>
          <IconButton icon={CancelIcon} size={24} onPress={handlePressClose} />
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
            <DateTimeRow>
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
            <DateTimeRow>
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
            <Input
              placeholder="고객명"
              value={customerName}
              onChangeText={setCustomerName}
              placeholderTextColor="#A4A4A4"
            />
          </InputRow>

          <ShootingSection>
            <InputRow noBorder>
              <CameraIcon width={24} height={24} />
              <Input
                placeholder="촬영 항목"
                value={shootingType}
                onChangeText={setShootingType}
                placeholderTextColor="#A4A4A4"
              />
            </InputRow>
            <InputRow>
              <InputWithoutIcon
                placeholder="촬영 유형"
                value={shootingCategory}
                onChangeText={setShootingCategory}
                placeholderTextColor="#A4A4A4"
              />
            </InputRow>
          </ShootingSection>

          <InputRow>
            <LocationIcon width={24} height={24} />
            <Input
              placeholder="위치 추가"
              value={location}
              onChangeText={setLocation}
              placeholderTextColor="#A4A4A4"
            />
          </InputRow>
        </ScrollContainer>
      </ModalContainer>
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

const ModalContainer = styled(Animated.View)`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${SCREEN_HEIGHT * 0.9}px;
  background-color: white;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
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
  padding: 0 25px;
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

const DateTimeRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
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
  align-items: center;
  height: 55px;
  padding-left: 21px;
  border-bottom-width: ${({ noBorder }) => (noBorder ? 0 : 1)}px;
  border-bottom-color: #C8C8C8;
`;

const Input = styled.TextInput`
  flex: 1;
  font-size: 16px;
  color: ${theme.colors.textPrimary};
  margin-left: 7px;
`;

const ShootingSection = styled.View`
  border-bottom-width: 1px;
  border-bottom-color: #C8C8C8;
`;

const InputWithoutIcon = styled.TextInput`
  flex: 1;
  font-size: 16px;
  color: ${theme.colors.textPrimary};
  margin-left: 31px;
`;
