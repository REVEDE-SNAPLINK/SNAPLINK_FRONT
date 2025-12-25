import React, {useEffect, useRef} from 'react';
import {Modal, Animated} from 'react-native';
import styled from '@/utils/scale/CustomStyled.ts';
import Typography from '@/components/theme/Typography.tsx';
import SubmitButton from '@/components/theme/SubmitButton.tsx';

export interface AlertButton {
  text: string;
  onPress: () => void;
  type?: 'default' | 'cancel' | 'destructive';
}

export interface AlertOptions {
  title: string;
  message?: string;
  buttons?: AlertButton[];
  cancelable?: boolean;
}

interface AlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons: AlertButton[];
  onClose: () => void;
  cancelable?: boolean;
}

/**
 * Alert 컴포넌트
 *
 * React Native Alert API와 유사한 인터페이스를 제공하는 커스텀 Alert
 *
 * @example
 * ```tsx
 * Alert.show({
 *   title: '제목',
 *   message: '메시지',
 *   buttons: [
 *     { text: '취소', onPress: () => console.log('취소'), type: 'cancel' },
 *     { text: '확인', onPress: () => console.log('확인') }
 *   ]
 * });
 * ```
 */
export function AlertComponent({
  visible,
  title,
  message,
  buttons,
  onClose,
  cancelable = true,
}: AlertProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim]);

  const handleOverlayPress = () => {
    if (cancelable) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleOverlayPress}
    >
      <Container>
        <Overlay onPress={handleOverlayPress} activeOpacity={1}>
          <AnimatedOverlayBackground style={{opacity: opacityAnim}} />
        </Overlay>

        <AnimatedModalContainer
          style={{
            transform: [{scale: scaleAnim}],
            opacity: opacityAnim,
          }}
        >
          <ContentWrapper>
            <Typography
              fontSize={16}
              fontWeight="semiBold"
              lineHeight="140%"
              letterSpacing="-2.5%"
              color="#000"
              marginBottom={message ? 8 : 0}
            >
              {title}
            </Typography>

            {message && (
              <Typography
                fontSize={12}
                lineHeight="140%"
                letterSpacing="-2.5%"
                color="textSecondary"
              >
                {message}
              </Typography>
            )}
          </ContentWrapper>

          <ButtonWrapper buttonCount={buttons.length}>
            {buttons.map((button, index) => (
              <ButtonContainer
                key={index}
                buttonCount={buttons.length}
                isLastButton={index === buttons.length - 1}
              >
                <SubmitButton
                  type={button.type === 'cancel' ? 'cancel' : 'submit'}
                  width="100%"
                  size="small"
                  text={button.text}
                  onPress={async () => {
                    onClose();
                    // Alert 닫기 애니메이션을 위한 딜레이
                    await new Promise(resolve => setTimeout(resolve, 100));
                    button.onPress();
                  }}
                />
              </ButtonContainer>
            ))}
          </ButtonWrapper>
        </AnimatedModalContainer>
      </Container>
    </Modal>
  );
}

// Global Alert Manager
class AlertManager {
  private listener: ((options: AlertOptions & {id: string}) => void) | null =
    null;
  private hideListener: ((id: string) => void) | null = null;
  private currentId = 0;

  setListener(
    listener: (options: AlertOptions & {id: string}) => void,
    hideListener: (id: string) => void,
  ) {
    this.listener = listener;
    this.hideListener = hideListener;
  }

  show(options: AlertOptions) {
    if (!this.listener) {
      console.warn(
        'Alert: AlertProvider가 렌더링되지 않았습니다. App.tsx에 AlertProvider를 추가하세요.',
      );
      return;
    }

    const id = `alert-${++this.currentId}`;
    this.listener({...options, id});
  }

  hide(id: string) {
    if (this.hideListener) {
      this.hideListener(id);
    }
  }
}

export const Alert = new AlertManager();

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 1001;
`;

const Overlay = styled.TouchableOpacity`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1002;
`;

const AnimatedOverlayBackground = styled(Animated.View)`
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
`;

const AnimatedModalContainer = styled(Animated.View)`
  width: 317px;
  min-height: 153px;
  padding: 26px 39px;
  background-color: white;
  border-radius: 10px;
  justify-content: space-between;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  elevation: 5;
  position: relative;
  z-index: 1003;
`;

const ContentWrapper = styled.View`
  margin-bottom: 16px;
`;

const ButtonWrapper = styled.View<{buttonCount: number}>`
  width: 100%;
  flex-direction: row;
  justify-content: ${({buttonCount}) =>
    buttonCount === 1 ? 'center' : 'space-between'};
`;

const ButtonContainer = styled.View<{
  buttonCount: number;
  isLastButton: boolean;
}>`
  ${({buttonCount}) => (buttonCount === 1 ? 'min-width: 140px;' : 'flex: 1;')}
  margin-right: ${({isLastButton, buttonCount}) =>
    !isLastButton && buttonCount > 1 ? '9px' : '0'};
`;
