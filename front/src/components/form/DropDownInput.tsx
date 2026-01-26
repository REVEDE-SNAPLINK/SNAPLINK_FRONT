import React, { useMemo, useState, useRef, useCallback } from 'react';
import {
  TouchableOpacity,
  Platform,
  UIManager,
  ScrollView,
  View,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import styled from '@/utils/scale/CustomStyled.ts';
import FormErrorMessage from '@/components/form/FormErrorMessage.tsx';
import ArrowDownIcon from '@/assets/icons/arrow-down.svg';
import Icon from '@/components/Icon.tsx';
import { theme } from '@/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface DropDownInputProps {
  placeholder: string;
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
  errorMessage?: string;
  disabled?: boolean;

  // 확장 높이 제한
  maxVisibleOptions?: number; // 기본 5개 정도

  // 자동 스크롤을 위한 ScrollView ref (ScrollView 또는 KeyboardAwareScrollView)
  scrollViewRef?: React.RefObject<any>;
  onOpen?: (open: boolean) => void;
}

const ROW_HEIGHT = 50;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const DROPDOWN_MARGIN = 8; // 드롭다운과 입력 필드 사이 간격

interface DropdownPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  openUpward: boolean;
}

export default function DropDownInput({
  placeholder,
  options,
  value,
  onChange,
  errorMessage,
  disabled = false,
  maxVisibleOptions = 4,
  onOpen,
}: DropDownInputProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<DropdownPosition | null>(null);
  const wrapperRef = useRef<View>(null);

  const rotate = useSharedValue(0); // 0 -> 180

  const maxHeight = useMemo(() => {
    const visibleCount = Math.min(options.length, maxVisibleOptions);
    return visibleCount * ROW_HEIGHT;
  }, [options.length, maxVisibleOptions]);

  const measureAndOpen = useCallback(() => {
    if (!wrapperRef.current) return;

    wrapperRef.current.measureInWindow((x, y, width, height) => {
      // 드롭다운이 아래로 열릴 경우의 하단 위치
      const dropdownBottom = y + height + DROPDOWN_MARGIN + maxHeight;
      // 화면 하단 여유 공간 (Footer 영역 고려해서 80px 여유)
      const bottomThreshold = SCREEN_HEIGHT - 80;
      // 아래 공간이 부족하면 위로 열기
      const openUpward = dropdownBottom > bottomThreshold;

      setPosition({
        x,
        y,
        width,
        height,
        openUpward,
      });
      setOpen(true);
      onOpen?.(true);

      rotate.value = withTiming(180, {
        duration: 180,
        easing: Easing.out(Easing.cubic),
      });
    });
  }, [maxHeight, onOpen, rotate]);

  const close = useCallback(() => {
    setOpen(false);
    // position은 유지 - Modal이 닫히는 동안 위치가 튀지 않도록
    // 다음에 열 때 새로 측정됨
    onOpen?.(false);

    rotate.value = withTiming(0, {
      duration: 180,
      easing: Easing.out(Easing.cubic),
    });
  }, [onOpen, rotate]);

  const toggle = useCallback(() => {
    if (open) {
      close();
    } else {
      measureAndOpen();
    }
  }, [open, close, measureAndOpen]);

  const handleSelect = useCallback((option: string) => {
    onChange?.(option);
    close();
  }, [onChange, close]);

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  // 드롭다운 위치 계산
  const dropdownStyle = useMemo(() => {
    if (!position) return {};

    const { x, y, width, height, openUpward } = position;

    if (openUpward) {
      // 위로 열기: 입력 필드 위에 배치
      return {
        position: 'absolute' as const,
        left: x,
        bottom: SCREEN_HEIGHT - y + DROPDOWN_MARGIN,
        width,
        maxHeight,
      };
    } else {
      // 아래로 열기: 입력 필드 아래에 배치
      return {
        position: 'absolute' as const,
        left: x,
        top: y + height + DROPDOWN_MARGIN,
        width,
        maxHeight,
      };
    }
  }, [position, maxHeight]);

  return (
    <Wrapper ref={wrapperRef}>
      <TouchableOpacity onPress={toggle} activeOpacity={0.7} style={{ width: '100%' }} disabled={disabled}>
        <InputFieldWrapper $disabled={disabled}>
          {value ? (
            <StyledInputField $disabled={disabled}>{value}</StyledInputField>
          ) : (
            <PlaceholderText $disabled={disabled}>{placeholder}</PlaceholderText>
          )}
          <Animated.View style={arrowStyle}>
            <Icon width={24} height={24} Svg={ArrowDownIcon} />
          </Animated.View>
        </InputFieldWrapper>
      </TouchableOpacity>

      {/* Modal로 드롭다운 렌더링 (z-index 문제 해결) */}
      <Modal
        visible={open && position !== null}
        transparent
        animationType="none"
        onRequestClose={close}
      >
        <TouchableWithoutFeedback onPress={close}>
          <ModalOverlay>
            <TouchableWithoutFeedback>
              <DropDownBox style={dropdownStyle}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                  scrollEventThrottle={16}
                  bounces={false}
                >
                  {options.map((option, index) => (
                    <OptionRow
                      key={`${option}-${index}`}
                      onPress={() => handleSelect(option)}
                      activeOpacity={0.7}
                      $selected={value === option}
                    >
                      <OptionText $selected={value === option}>{option}</OptionText>
                    </OptionRow>
                  ))}
                </ScrollView>
              </DropDownBox>
            </TouchableWithoutFeedback>
          </ModalOverlay>
        </TouchableWithoutFeedback>
      </Modal>

      {errorMessage && (
        <>
          <FormErrorMessageSpacer />
          <FormErrorMessage message={errorMessage} />
        </>
      )}
    </Wrapper>
  );
}

/** ---------- styles ---------- */

const Wrapper = styled(View)`
  width: 100%;
`;

const ModalOverlay = styled.View`
  flex: 1;
  background-color: transparent;
`;

const InputFieldWrapper = styled.View<{ $disabled?: boolean }>`
  width: 100%;
  background-color: ${({ $disabled }) => ($disabled ? '#e9e9e9' : '#f9f9f9')};
  border: 1px solid #e9e9e9;
  border-radius: 5px;
  height: ${ROW_HEIGHT}px;
  padding: 0 21px;

  align-items: center;
  justify-content: space-between;
  flex-direction: row;
`;

const StyledInputField = styled.Text<{ $disabled?: boolean }>`
  flex: 1;
  font-size: 14px;
  font-family: Pretendard-Regular;
  letter-spacing: 0.2px;
  color: ${({ $disabled }) => ($disabled ? '#a0a0a0' : '#000')};
`;

const PlaceholderText = styled.Text<{ $disabled?: boolean }>`
  flex: 1;
  font-size: 14px;
  font-family: Pretendard-Regular;
  letter-spacing: 0.2px;
  color: ${({ $disabled }) => ($disabled ? '#a0a0a0' : '#737373')};
`;

const FormErrorMessageSpacer = styled.View`
  height: 10px;
`;

const DropDownBox = styled.View`
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;

  /* iOS shadow */
  shadow-opacity: 0.15;
  shadow-radius: 12px;
  shadow-offset: 0px 4px;
  shadow-color: #000;

  /* Android shadow */
  elevation: 8;

  border: 1px solid #eee;
`;

const OptionRow = styled.TouchableOpacity<{ $selected: boolean }>`
  width: 100%;
  height: ${ROW_HEIGHT}px;
  padding: 0 21px;

  align-items: center;
  flex-direction: row;

  background-color: ${({ $selected }) => ($selected ? `${theme.colors.primary}22` : '#fff')};
  border-bottom-width: 1px;
  border-bottom-color: #f1f1f1;
`;

const OptionText = styled.Text<{ $selected: boolean }>`
  font-size: 14px;
  font-family: Pretendard-Regular;
  letter-spacing: 0.2px;
  color: ${({ $selected }) => ($selected ? theme.colors.primary : '#000')};
`;