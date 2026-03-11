import styled from '@/utils/scale/CustomStyled.ts';
import Icon from '@/components/ui/Icon.tsx';
import { theme } from '@/theme';
import Typography from '@/components/ui/Typography.tsx';
import SwapIcon from '@/assets/icons/swap.svg';
import ArrowDownIcon from '@/assets/icons/arrow-down.svg';
import { useMemo, useState, useRef, useEffect } from 'react';
import { Animated, Pressable } from 'react-native';

export type SortOption<T extends string> = {
  key: T;
  label: string;
};

interface SortButtonProps<T extends string> {
  options: SortOption<T>[];
  selectedKey: T;
  onSelect: (key: T) => void;
}

export default function SortButton<T extends string>({
  options,
  selectedKey,
  onSelect,
}: SortButtonProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const selectedLabel = useMemo(
    () => options.find((opt) => opt.key === selectedKey)?.label || '',
    [options, selectedKey],
  );

  const otherOptions = useMemo(
    () => options.filter((opt) => opt.key !== selectedKey),
    [options, selectedKey],
  );

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isOpen, rotateAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <Container>
      {/* 닫힘 상태: 기존 트리거 UI 그대로 */}
      <SortTrigger onPress={toggle} activeOpacity={0.8}>
        <Typography
          fontSize={12}
          lineHeight="140%"
          letterSpacing="-2.5%"
          color={theme.colors.disabled}
          marginRight={1.5}
        >
          {selectedLabel}
        </Typography>
        <Icon width={14} height={14} Svg={SwapIcon} />
      </SortTrigger>

      {/* 열림 상태: 수정버전 박스 UI */}
      {isOpen && (
        <>
          {/* 바깥 눌러서 닫기(원치 않으면 삭제 가능) */}
          <Backdrop onPress={close} />

          <DropdownBox>
            <HeaderItem onPress={toggle} activeOpacity={0.8}>
              <Typography fontSize={12}>{selectedLabel}</Typography>
              <AnimatedIconWrapper style={{ transform: [{ rotate: rotation }] }}>
                <Icon width={24} height={24} Svg={ArrowDownIcon} />
              </AnimatedIconWrapper>
            </HeaderItem>

            <ItemsWrapper>
              {otherOptions.map((option) => (
                <Item
                  key={option.key}
                  onPress={() => {
                    onSelect(option.key);
                    close();
                  }}
                  activeOpacity={0.8}
                >
                  <Typography fontSize={12}>{option.label}</Typography>
                </Item>
              ))}
            </ItemsWrapper>
          </DropdownBox>
        </>
      )}
    </Container>
  );
}

const Container = styled.View`
  position: relative;
  z-index: 1002;
`;

/** 열려있을 때 바깥 클릭으로 닫기 */
const Backdrop = styled(Pressable)`
  position: absolute;
  top: -9999px;
  left: -9999px;
  right: -9999px;
  bottom: -9999px;
  z-index: 99;
`;

const SortTrigger = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`;

/**
 * "수정버전 박스"를 기존 버전처럼 떠있게(absolute) 만들기
 * + 그림자(iOS shadow props, Android elevation 같이)
 */
const DropdownBox = styled.View`
  width: 122px;
  background-color: #fff;
  border-radius: 8px;

  position: absolute;
  right: 0;
  top: 20px;

  z-index: 1002;

  /* iOS shadow */
  shadow-color: #000;
  shadow-opacity: 0.15;
  shadow-radius: 6px;
  shadow-offset: 0px 2px;

  /* Android shadow */
  elevation: 6;
`;

const HeaderItem = styled.TouchableOpacity`
  width: 100%;
  height: 44px;
  padding-left: 16px;
  padding-right: 12px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-bottom-width: 1px;
  border-bottom-color: #e9eff2;
`;

const AnimatedIconWrapper = styled(Animated.View)``;

const ItemsWrapper = styled.View`
  width: 100%;
`;

const Item = styled.TouchableOpacity`
  width: 100%;
  height: 44px;
  padding-left: 16px;
  justify-content: center;
`;