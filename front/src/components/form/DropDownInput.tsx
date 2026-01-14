import React, { useMemo, useState, useRef } from 'react';
import { TouchableOpacity, LayoutAnimation, Platform, UIManager, ScrollView, View } from 'react-native';
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
}

const ROW_HEIGHT = 50;

export default function DropDownInput({
  placeholder,
  options,
  value,
  onChange,
  errorMessage,
  disabled = false,
  maxVisibleOptions = 4,
  scrollViewRef,
}: DropDownInputProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<View>(null);

  const rotate = useSharedValue(0); // 0 -> 180

  const maxHeight = useMemo(() => {
    const visibleCount = Math.min(options.length, maxVisibleOptions);
    return visibleCount * ROW_HEIGHT;
  }, [options.length, maxVisibleOptions]);

  const toggle = () => {
    // 레이아웃 자체가 늘어나는 걸 부드럽게
    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        180,
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.opacity
      )
    );

    const next = !open;
    setOpen(next);
    rotate.value = withTiming(next ? 180 : 0, {
      duration: 180,
      easing: Easing.out(Easing.cubic),
    });

    // 열릴 때 자동 스크롤
    if (next && scrollViewRef?.current && wrapperRef.current) {
      setTimeout(() => {
        wrapperRef.current?.measureInWindow((x, y) => {
          // 드롭다운 높이를 고려한 스크롤 위치 계산
          const targetY = y - 100; // 상단에서 100px 여유 공간 확보
          const scrollY = targetY > 0 ? targetY : 0;

          // ScrollView와 KeyboardAwareScrollView 둘 다 지원
          if (scrollViewRef.current.scrollTo) {
            // 일반 ScrollView
            scrollViewRef.current.scrollTo({
              y: scrollY,
              animated: true,
            });
          } else if (scrollViewRef.current.scrollToPosition) {
            // KeyboardAwareScrollView
            scrollViewRef.current.scrollToPosition(0, scrollY, true);
          }
        });
      }, 200); // LayoutAnimation 완료 후 실행
    }
  };

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

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

      {/* Inline Dropdown (부모 height가 늘어나서 아래 컴포넌트가 밀림) */}
      {open && (
        <DropDownBox
          style={{
            maxHeight,
          }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            scrollEventThrottle={16}
          >
            {options.map((option, index) => (
              <OptionRow
                key={`${option}-${index}`}
                onPress={() => {
                  onChange?.(option);
                  toggle();
                }}
                activeOpacity={0.7}
                $selected={value === option}
              >
                <OptionText $selected={value === option}>{option}</OptionText>
              </OptionRow>
            ))}
          </ScrollView>
        </DropDownBox>
      )}

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

/**
 * 드롭다운 컨테이너
 * - input 아래에 붙어있고
 * - 레이아웃을 밀어내며 펼쳐짐
 * - shadow 적용
 */
const DropDownBox = styled.View`
  width: 100%;
  margin-top: 8px;

  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;

  /* iOS shadow */
  shadow-opacity: 0.12;
  shadow-radius: 10px;
  shadow-offset: 0px 6px;

  border: 1px solid #eee;
`;

/**
 * 아이템 row
 * - input이랑 동일한 height/padding
 * - text 위치 동일
 */
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