import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, Animated, Dimensions, BackHandler } from 'react-native';
import styled from '@/utils/scale/CustomStyled.ts';
import IconButton from '@/components/IconButton.tsx';
import CancelIcon from '@/assets/icons/cancel.svg';
import { Alert, Typography } from '@/components/theme';
import Icon from '@/components/Icon.tsx';
import ArrowDownIcon from '@/assets/icons/arrow-down.svg';
import { theme } from '@/theme';
import { mappingReason, REASON, REASONS } from '@/api/reports.ts';
import LoadingSpinner from '@/components/LoadingSpinner.tsx';
import { UserType } from '@/types/auth.ts';
import { useFocusEffect } from '@react-navigation/native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (params: { reason: REASON; description: string }) => void;
  initialReason?: REASON;
  targetUserType: UserType;
  isLoading: boolean;
}

export default function ReportModal({
  visible,
  onClose,
  onSubmit,
  initialReason,
  targetUserType,
  isLoading,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<REASON | null>(null);
  const [description, setDescription] = useState('');
  const [isReasonListVisible, setIsReasonListVisible] = useState(false);

  const reasons = REASONS.filter((reason) => targetUserType === 'user' ? reason !== 'UNILATERAL_CANCELLATION' : true);

  const isDirty = selectedReason !== null || description !== '';

  // Sliding animation
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const resetModal = useCallback(() => {
    setSelectedReason(initialReason || null);
    setDescription('');
  }, [initialReason]);

  // Load initial reason when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedReason(initialReason || null);
      setDescription('');
    }
  }, [visible, initialReason]);

  useEffect(() => {
    if (visible) {
      // Slide in from bottom
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      // Slide out to bottom
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
        title: '신고 작성을 그만둘까요?',
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
            text: '계속 작성하기',
            onPress: () => {
              // Alert가 자동으로 닫힘
            },
          },
        ],
      });
      return;
    }

    onClose();
  }, [resetModal, isDirty, onClose]);

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

  const handlePressReasonSelector = () => {
    setIsReasonListVisible(!isReasonListVisible);
  };

  const handleSelectReason = (reason: REASON) => {
    setSelectedReason(reason);
    setIsReasonListVisible(false);
  };

  const handleSubmit = () => {
    if (!selectedReason) {
      return;
    }

    onSubmit({
      reason: selectedReason,
      description: description.trim(),
    });
  };

  const canSubmit = selectedReason !== null && (selectedReason !== 'OTHER' || (selectedReason === 'OTHER' && description.trim() !== ''));

  if (!visible) return null;

  return (
    <>
      <Overlay>
        <AnimatedContainer
          style={{
            transform: [{ translateY: slideAnim }],
          }}
        >
          <KeyboardAvoidingContainer
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <Header>
              <IconButton width={18} height={18} Svg={CancelIcon} onPress={handlePressClose} />
              <Typography fontSize={16} fontWeight="bold" letterSpacing="-2.5%" color="#000">
                신고하기
              </Typography>
              <ConfirmButton onPress={handleSubmit} disabled={!canSubmit}>
                <Typography
                  fontSize={16}
                  letterSpacing="-2.5%"
                  color={canSubmit ? theme.colors.primary : '#C8C8C8'}
                >
                  완료
                </Typography>
              </ConfirmButton>
            </Header>
            <ScrollContainer
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            >
              <ReasonSelector>
                <ReasonWrapper onPress={handlePressReasonSelector}>
                  <Typography fontSize={16} letterSpacing="-2.5%">
                    {selectedReason ? mappingReason(selectedReason) : '신고 사유를 선택해주세요.'}
                  </Typography>
                  <Icon width={24} height={24} Svg={ArrowDownIcon} />
                </ReasonWrapper>
                {isReasonListVisible && (
                  <ReasonList>
                    {reasons.map((reason) => (
                      <ReasonItem key={reason} onPress={() => handleSelectReason(reason)}>
                        <Typography fontSize={16} letterSpacing="-2.5%">
                          {mappingReason(reason)}
                        </Typography>
                      </ReasonItem>
                    ))}
                  </ReasonList>
                )}
              </ReasonSelector>
              <DescriptionInput
                placeholder="신고 내용을 상세하게 작성해주세요."
                placeholderTextColor="#A4A4A4"
                multiline={true}
                value={description}
                onChangeText={setDescription}
              />
            </ScrollContainer>
          </KeyboardAvoidingContainer>
          <KeyboardAvodingSpacer />
        </AnimatedContainer>
      </Overlay>
      <LoadingSpinner visible={isLoading} />
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
  ${Platform.OS === 'ios' ? `padding-top: 50px;` : ''}
`;

const KeyboardAvoidingContainer = styled.KeyboardAvoidingView`
  flex: 1;
  width: 100%;
  height: 100%;
`

const ScrollContainer = styled.ScrollView`
  flex: 1;
  width: 100%;
  height: 100%;
`

const Header = styled.View`
  width: 100%;
  height: 57px;
  align-items: center;
  flex-direction: row;
  padding-horizontal: 20px;
  justify-content: space-between;
  position: relative;
  z-index: 999;
`

const ConfirmButton = styled.TouchableOpacity<{ disabled?: boolean }>`
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`

const ReasonSelector = styled.View`
  width: 100%;
  height: 62px;
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: #C8C8C8;
  position: relative;
  z-index: 999;
`

const ReasonWrapper = styled.TouchableOpacity`
  width: 100%;
  height: 100%;
  padding-left: 28px;
  padding-right: 22px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`

const ReasonList = styled.View`
  flex: 1;
  width: 100%;
  position: absolute;
  left: 0;
  top: 62px;
  z-index: 1001;
  background-color: #FAFAFA;
`

const ReasonItem = styled.TouchableOpacity`
  flex: 1;
  width: 100%;
  height: 62px;
  justify-content: center;
  padding-left: 28px;
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: #C8C8C8;
  background-color: #FAFAFA;
  position: relative;
  z-index: 1001;
`

const DescriptionInput = styled.TextInput`
  width: 100%;
  padding: 20px 28px;
  min-height: 200px;
  text-align-vertical: top;
  font-size: 16px;
  font-family: Pretendard-Regular;
  color: ${theme.colors.textPrimary};
`

const KeyboardAvodingSpacer = styled.View`
  height: 20px;
`
