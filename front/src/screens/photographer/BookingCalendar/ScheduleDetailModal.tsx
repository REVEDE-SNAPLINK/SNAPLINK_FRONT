import { useState, useEffect, useRef, useMemo } from 'react';
import { Animated, Dimensions, Platform } from 'react-native';
import styled from '@/utils/scale/CustomStyled';
import IconButton from '@/components/IconButton';
import CancelIcon from '@/assets/icons/cancel.svg';
import EditIcon from '@/assets/icons/edit.svg';
import MoreIcon from '@/assets/icons/more.svg';
import TimeCircleIcon from '@/assets/icons/time-circle.svg';
import DocumentIcon from '@/assets/icons/document.svg';
import { Typography, Alert } from '@/components/theme';
import SlideModal from '@/components/theme/SlideModal';
import { PersonalSchedule } from '@/store/modalStore';
import { usePersonalScheduleQuery } from '@/queries/schedules';
import { useDeletePersonalScheduleMutation } from '@/mutations/schedules';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ScheduleDetailModalProps {
  visible: boolean;
  onClose: () => void;
  schedule: PersonalSchedule | null;
  onEdit: (schedule: PersonalSchedule) => void;
  onDelete: (scheduleId: string) => void;
  onDuplicate: (schedule: PersonalSchedule) => void;
  scheduleId?: number; // API로부터 불러올 스케줄 ID
}

export default function ScheduleDetailModal({
  visible,
  onClose,
  schedule,
  onEdit,
  onDelete,
  onDuplicate,
  scheduleId,
}: ScheduleDetailModalProps) {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // API hooks
  const { data: apiScheduleData } = usePersonalScheduleQuery(scheduleId, visible && !!scheduleId);
  const deleteMutation = useDeletePersonalScheduleMutation();

  // API 데이터를 로컬 형식으로 변환
  const displaySchedule = useMemo<PersonalSchedule | null>(() => {
    if (apiScheduleData) {
      const { id, startDate: startDateStr, endDate: endDateStr, startTime, endTime, title, content } = apiScheduleData;

      // YYYY-MM-DD와 HH:mm을 Date 객체로 변환
      const startDateTime = new Date(`${startDateStr}T${startTime}`);
      const endDateTime = new Date(`${endDateStr}T${endTime}`);

      // 종일 여부 판단
      const isAllDay = startTime === '00:00' && (endTime === '23:59' || endTime === '00:00');

      return {
        id: String(id), // number -> string 변환
        title,
        startDate: startDateTime,
        endDate: endDateTime,
        isAllDay,
        description: content || undefined,
      };
    }
    return schedule;
  }, [apiScheduleData, schedule]);

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
    if (displaySchedule) {
      onEdit(displaySchedule);
    }
  };

  const handlePressDuplicate = () => {
    setIsEditModalVisible(false);
    if (displaySchedule) {
      onDuplicate(displaySchedule);
    }
  };

  const handlePressDelete = () => {
    setIsEditModalVisible(false);
    if (displaySchedule) {
      Alert.show({
        title: '일정을 삭제할까요?',
        message: '삭제한 일정은 복구할 수 없어요.',
        buttons: [
          { text: '취소', type: 'cancel', onPress: () => {} },
          {
            text: '삭제',
            type: 'destructive',
            onPress: () => {
              if (scheduleId) {
                // API를 통한 삭제
                deleteMutation.mutate(scheduleId, {
                  onSuccess: () => {
                    onDelete(displaySchedule.id);
                    onClose();
                  },
                  onError: () => {
                    Alert.show({
                      title: '일정 삭제 실패',
                      message: '일정 삭제에 실패했습니다. 다시 시도해주세요.',
                      buttons: [{ text: '확인', onPress: () => {} }],
                    });
                  },
                });
              } else {
                // 로컬 삭제
                onDelete(displaySchedule.id);
                onClose();
              }
            },
          },
        ],
      });
    }
  };

  const onCloseEditModal = () => {
    setIsEditModalVisible(false);
  };

  if (!visible || !displaySchedule) return null;

  return (
    <>
      <Overlay>
        <AnimatedContainer style={{ transform: [{ translateY: slideAnim }] }}>
          <Header>
            <IconButton Svg={CancelIcon} width={24} height={24} onPress={onClose} />
            <HeaderActions>
              <IconButton
                Svg={EditIcon}
                width={24}
                height={24}
                onPress={handlePressEdit}
              />
              <IconButton
                Svg={MoreIcon}
                width={24}
                height={24}
                onPress={() => setIsEditModalVisible(true)}
              />
            </HeaderActions>
          </Header>

          <ScrollContainer>
            <DetailRow first>
              <Typography fontSize={18}>
                {displaySchedule.title}
              </Typography>
            </DetailRow>

            <DetailRow>
              <IconWrapper>
                <TimeCircleIcon width={24} height={24} />
              </IconWrapper>
              <DetailContent>
                <Typography fontSize={16}>
                  {formatDate(displaySchedule.startDate)}
                  {!displaySchedule.isAllDay && ` ${formatTime(displaySchedule.startDate)}~`}
                </Typography>
                <Typography fontSize={16} marginTop={4}>
                  {formatDate(displaySchedule.endDate)}
                  {!displaySchedule.isAllDay && ` ${formatTime(displaySchedule.endDate)}`}
                </Typography>
              </DetailContent>
            </DetailRow>

            {displaySchedule.description && (
              <DetailRow>
                <IconWrapper>
                  <DocumentIcon width={24} height={24} />
                </IconWrapper>
                <DetailContent>
                  <Typography fontSize={16}>{displaySchedule.description}</Typography>
                </DetailContent>
              </DetailRow>
            )}

          </ScrollContainer>
        </AnimatedContainer>
      </Overlay>

      <SlideModal visible={isEditModalVisible} onClose={onCloseEditModal} showHeader={false}>
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
  padding-vertical: 16px;
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
  margin-vertical: 20px;
  border: 1px solid #E5E5E5;
  border-radius: 5px;
`;

const EditModalButton = styled.TouchableOpacity`
  padding: 16px 20px;
  align-items: center;
`;

const EditModalDivider = styled.View`
  height: 1px;
  background-color: #E5E5E5;
`;
