import { useState, useEffect, useRef } from 'react';
import { Animated, Dimensions } from 'react-native';
import styled from '@/utils/scale/CustomStyled';
import IconButton from '@/components/IconButton';
import CancelIcon from '@/assets/icons/cancel.svg';
import EditIcon from '@/assets/icons/edit.svg';
import MoreIcon from '@/assets/icons/more.svg';
import TimeCircleIcon from '@/assets/icons/time-circle.svg';
import DocumentIcon from '@/assets/icons/document.svg';
import CameraIcon from '@/assets/icons/camera.svg';
import LocationIcon from '@/assets/icons/location.svg';
import { Typography, Alert } from '@/components/theme';
import SlideModal from '@/components/theme/SlideModal';
import { theme } from '@/theme';
import { PersonalSchedule } from './AddScheduleModal';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface ScheduleDetailModalProps {
  visible: boolean;
  onClose: () => void;
  schedule: PersonalSchedule | null;
  onEdit: (schedule: PersonalSchedule) => void;
  onDelete: (scheduleId: string) => void;
  onDuplicate: (schedule: PersonalSchedule) => void;
}

export default function ScheduleDetailModal({
  visible,
  onClose,
  schedule,
  onEdit,
  onDelete,
  onDuplicate,
}: ScheduleDetailModalProps) {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

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

  const handlePressEdit = () => {
    setIsEditModalVisible(false);
    if (schedule) {
      onEdit(schedule);
    }
  };

  const handlePressDuplicate = () => {
    setIsEditModalVisible(false);
    if (schedule) {
      onDuplicate(schedule);
    }
  };

  const handlePressDelete = () => {
    setIsEditModalVisible(false);
    if (schedule) {
      Alert.show({
        title: '일정을 삭제할까요?',
        message: '삭제한 일정은 복구할 수 없어요.',
        buttons: [
          { text: '취소', type: 'cancel' },
          {
            text: '삭제',
            type: 'destructive',
            onPress: () => {
              onDelete(schedule.id);
              onClose();
            },
          },
        ],
      });
    }
  };

  const onCloseEditModal = () => {
    setIsEditModalVisible(false);
  };

  if (!visible || !schedule) return null;

  return (
    <>
      <Overlay>
        <ModalContainer style={{ transform: [{ translateY: slideAnim }] }}>
          <Header>
            <IconButton icon={CancelIcon} size={24} onPress={onClose} />
            <HeaderActions>
              <IconButton
                icon={EditIcon}
                size={24}
                onPress={handlePressEdit}
              />
              <IconButton
                icon={MoreIcon}
                size={24}
                onPress={() => setIsEditModalVisible(true)}
                style={{ marginRight: 10 }}
              />
            </HeaderActions>
          </Header>

          <ScrollContainer>
            <DetailRow first>
              <Typography fontSize={18} fontWeight="600">
                {schedule.title}
              </Typography>
            </DetailRow>

            <DetailRow>
              <IconWrapper>
                <TimeCircleIcon width={24} height={24} />
              </IconWrapper>
              <DetailContent>
                <Typography fontSize={16}>
                  {formatDate(schedule.startDate)}
                  {!schedule.isAllDay && ` ${formatTime(schedule.startDate)}~`}
                </Typography>
                <Typography fontSize={16} marginTop={4}>
                  {formatDate(schedule.endDate)}
                  {!schedule.isAllDay && ` ${formatTime(schedule.endDate)}`}
                </Typography>
              </DetailContent>
            </DetailRow>

            {schedule.customerName && (
              <DetailRow>
                <IconWrapper>
                  <DocumentIcon width={24} height={24} />
                </IconWrapper>
                <DetailContent>
                  <Typography fontSize={16}>{schedule.customerName}</Typography>
                </DetailContent>
              </DetailRow>
            )}

            {schedule.location && (
              <DetailRow>
                <IconWrapper>
                  <LocationIcon width={24} height={24} />
                </IconWrapper>
                <DetailContent>
                  <Typography fontSize={16}>{schedule.location}</Typography>
                </DetailContent>
              </DetailRow>
            )}

            {schedule.shootingType && (
              <DetailRow>
                <IconWrapper>
                  <CameraIcon width={24} height={24} />
                </IconWrapper>
                <DetailContent>
                  <Typography fontSize={16}>{schedule.shootingType}</Typography>
                  {schedule.shootingCategory && (
                    <Typography fontSize={16} marginTop={4} color="#A4A4A4">
                      {schedule.shootingCategory}
                    </Typography>
                  )}
                </DetailContent>
              </DetailRow>
            )}
          </ScrollContainer>
        </ModalContainer>
      </Overlay>

      <SlideModal visible={isEditModalVisible} onClose={onCloseEditModal}>
        <EditModalWrapper>
          <EditModalButton onPress={handlePressDuplicate}>
            <Typography fontSize={16} letterSpacing="-2.5%">
              복사
            </Typography>
          </EditModalButton>
          <EditModalDivider />
          <EditModalButton onPress={handlePressDelete}>
            <Typography fontSize={16} letterSpacing="-2.5%" color="#FF0000">
              삭제
            </Typography>
          </EditModalButton>
          <EditModalDivider />
          <EditModalButton onPress={onCloseEditModal}>
            <Typography fontSize={16} letterSpacing="-2.5%" color="#A4A4A4">
              닫기
            </Typography>
          </EditModalButton>
        </EditModalWrapper>
      </SlideModal>
    </>
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
  height: ${SCREEN_HEIGHT * 0.7}px;
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

const HeaderActions = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

const ScrollContainer = styled.ScrollView`
  flex: 1;
  padding: 20px 21px;
`;

const DetailRow = styled.View<{ first?: boolean }>`
  padding: 16px 0;
  flex-direction: row;
  align-items: flex-start;
  margin-top: ${({ first }) => (first ? 0 : 8)}px;
`;

const IconWrapper = styled.View`
  width: 31px;
  margin-right: 7px;
`;

const DetailContent = styled.View`
  flex: 1;
`;

const EditModalWrapper = styled.View`
  padding: 20px 0;
`;

const EditModalButton = styled.TouchableOpacity`
  padding: 16px 20px;
  align-items: center;
`;

const EditModalDivider = styled.View`
  height: 1px;
  background-color: #E5E5E5;
`;
