import React, { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  View,
  LayoutChangeEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  runOnJS,
  useAnimatedGestureHandler,
  Easing,
} from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import styled from '@/utils/scale/CustomStyled';
import Typography from '@/components/theme/Typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const DEFAULT_FOOTER_HEIGHT = 72;

// 애니메이션(튀는 느낌 줄이려면 stiffness 낮추고 damping 올리기)
const OPEN_DURATION = 220;
const CLOSE_DURATION = 220;

type SlideModalProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;

  // sizing
  minHeight?: number;

  /**
   * 댓글 모달용:
   * - autoGrowToMax=true면, content 높이를 측정해서 sheetHeight를 "자연스럽게" 키움
   * - maxHeight에 도달하면 거기서 멈추고, scrollable이면 내부 ScrollView가 스크롤 시작
   */
  autoGrowToMax?: boolean;
  maxHeight?: number;

  // header
  showHeader?: boolean;
  title?: string;
  headerAlign?: 'left' | 'center';

  headerLeft?: React.ReactNode;
  headerCenter?: React.ReactNode; // 없으면 title 표시
  headerRight?: React.ReactNode;

  // body layout
  scrollable?: boolean;

  // footer (sticky actions/input)
  footer?: React.ReactNode;
  footerHeight?: number;

  // keyboard
  keyboardAvoid?: boolean;

  // drag behavior
  draggableDown?: boolean;
  draggableUp?: boolean;
  closeOnOverlayPress?: boolean;
};

type Ctx = { startTranslateY: number; startSheetHeight: number };

export default function SlideModal({
                                     visible,
                                     onClose,
                                     children,

                                     minHeight = SCREEN_HEIGHT * 0.33,

                                     autoGrowToMax = false,
                                     maxHeight,

                                     showHeader = true,
                                     title,
                                     headerAlign = 'center',

                                     headerLeft,
                                     headerCenter,
                                     headerRight,

                                     scrollable = true,

                                     footer,
                                     footerHeight = DEFAULT_FOOTER_HEIGHT,

                                     keyboardAvoid = false,

                                     draggableDown = true,
                                     draggableUp = false,
                                     closeOnOverlayPress = true,
                                   }: SlideModalProps) {
  const insets = useSafeAreaInsets();

  // overlay
  const overlayOpacity = useSharedValue(0);

  // translateY: sheet 슬라이드 (0 = 붙어있음)
  const translateY = useSharedValue(SCREEN_HEIGHT);

  // 댓글형 autoGrow에서 사용할 sheetHeight
  const sheetHeight = useSharedValue(minHeight);

  // body content 높이 측정
  const [measuredBodyHeight, setMeasuredBodyHeight] = useState(0);

  const resolvedMaxHeight = useMemo(() => {
    // 기본: 화면 0.85 정도
    return maxHeight ?? SCREEN_HEIGHT * 0.85;
  }, [maxHeight]);

  const resolvedFooterHeight = footer ? footerHeight : 0;

  const headerHeight = showHeader ? 57 : 0;

  // handle bar 영역 대략값 (wrap + bar)
  const handleAreaHeight = 5 + 3 + 8; // padding-top 5 + bar 3 + 약간의 여유

  const bodyPaddingTop = 22;
  const bodyPaddingBottom = resolvedFooterHeight ? resolvedFooterHeight + 22 : 22;

  // ====== open / close ======
  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 150 });
      translateY.value = withTiming(0, {
        duration: OPEN_DURATION,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      overlayOpacity.value = withTiming(0, { duration: 150 });
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: CLOSE_DURATION });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // ====== autoGrowToMax: body 높이 측정값으로 sheetHeight 계산 ======
  useEffect(() => {
    if (!visible) return;
    if (!autoGrowToMax) {
      // 자연 증가 모드는 height 고정 안 걸고 minHeight만 걸어줌(Style로)
      sheetHeight.value = minHeight;
      return;
    }

    const desired =
      handleAreaHeight +
      headerHeight +
      bodyPaddingTop +
      measuredBodyHeight +
      bodyPaddingBottom +
      Math.max(insets.bottom, 0);

    const clamped = Math.max(minHeight, Math.min(resolvedMaxHeight, desired));

    sheetHeight.value = withTiming(clamped, { duration: 160 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    visible,
    autoGrowToMax,
    measuredBodyHeight,
    minHeight,
    resolvedMaxHeight,
    headerHeight,
    bodyPaddingTop,
    bodyPaddingBottom,
    insets.bottom,
  ]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const sheetTranslateStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // autoGrowToMax=true인 경우에만 height를 강제로 주고(max에서 멈추게)
  const sheetHeightStyle = useAnimatedStyle(() => {
    if (!autoGrowToMax) return {};
    return { height: sheetHeight.value };
  });

  // ====== Drag ======
  const panHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, Ctx>({
    onStart: (_, ctx) => {
      ctx.startTranslateY = translateY.value;
      ctx.startSheetHeight = sheetHeight.value;
    },
    onActive: (evt, ctx) => {
      // 기본: 아래로만 드래그(닫기)
      if (!draggableUp) {
        const next = ctx.startTranslateY + evt.translationY;
        translateY.value = Math.max(0, next);
        return;
      }

      // draggableUp=true:
      // - 위로 끌면 sheetHeight를 늘려서 확장(인스타 댓글 느낌)
      // - 아래로 끌면 translateY로 닫기 방향
      if (evt.translationY < 0) {
        // 위로 끄는 중: translateY는 0 유지, height를 늘림
        translateY.value = 0;

        if (autoGrowToMax) {
          const grow = -evt.translationY;
          const nextH = Math.min(resolvedMaxHeight, Math.max(minHeight, ctx.startSheetHeight + grow));
          sheetHeight.value = nextH;
        }
      } else {
        // 아래로 끄는 중: 닫기
        const next = ctx.startTranslateY + evt.translationY;
        translateY.value = Math.max(0, next);
      }
    },
    onEnd: (evt) => {
      if (!draggableDown && !draggableUp) return;

      const shouldClose =
        draggableDown && (evt.translationY > 120 || evt.velocityY > 900);

      if (shouldClose) {
        overlayOpacity.value = withTiming(0, { duration: 120 });
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: CLOSE_DURATION }, (finished) => {
          if (finished) runOnJS(onClose)();
        });
        return;
      }

      // 닫기 안 하면 원위치로 복귀
      translateY.value = withSpring(0, {
        damping: 22,
        stiffness: 260,
      });
    },
  });

  if (!visible) return null;

  const onMeasureBody = (e: LayoutChangeEvent) => {
    if (!autoGrowToMax) return;
    setMeasuredBodyHeight(e.nativeEvent.layout.height);
  };

  // body children을 한번 감싸서 높이 측정
  const MeasuredBodyContent = (
    <View onLayout={onMeasureBody}>
      {children}
    </View>
  );

  const SheetInner = (
    <SheetTouchable
      style={[
        { minHeight },
        autoGrowToMax ? ({} as StyleProp<ViewStyle>) : ({} as StyleProp<ViewStyle>),
      ]}
    >
      {/* Handle Bar */}
      <HandleBarWrap>
        <HandleBar />
      </HandleBarWrap>

      {/* Header */}
      {showHeader && (
        <Header>
          <HeaderRow>
            <HeaderSlot $pos="left">{headerLeft}</HeaderSlot>

            <HeaderSlot $pos="center">
              {headerCenter ? (
                headerCenter
              ) : (
                <HeaderTitle $align={headerAlign}>
                  <Typography fontSize={14} fontWeight="regular">
                    {title ?? ''}
                  </Typography>
                </HeaderTitle>
              )}
            </HeaderSlot>

            <HeaderSlot $pos="right">{headerRight}</HeaderSlot>
          </HeaderRow>
        </Header>
      )}

      {/* Body */}
      {scrollable ? (
        <BodyScroll
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          contentContainerStyle={{
            paddingHorizontal: 30,
            paddingTop: 22,
            paddingBottom: resolvedFooterHeight ? resolvedFooterHeight + 22 : 22,
          }}
        >
          {MeasuredBodyContent}
        </BodyScroll>
      ) : (
        <BodyFixed
          style={{
            flex: 1,
            paddingHorizontal: 30,
            paddingTop: 22,
            paddingBottom: resolvedFooterHeight ? resolvedFooterHeight + 22 : 22,
          }}
        >
          {MeasuredBodyContent}
        </BodyFixed>
      )}

      {/* Sticky Footer */}
      {!!footer && (
        <Footer style={{ height: footerHeight, paddingBottom: Math.max(insets.bottom, 8) }}>
          {footer}
        </Footer>
      )}
    </SheetTouchable>
  );

  return (
    <Root pointerEvents="box-none">
      {/* Overlay */}
      <AnimatedOverlay style={overlayStyle}>
        <Pressable
          style={{ flex: 1 }}
          onPress={closeOnOverlayPress ? onClose : undefined}
        />
      </AnimatedOverlay>

      {/* Sheet */}
      <AnimatedSheet style={[sheetTranslateStyle]} pointerEvents="box-none">
        <PanGestureHandler enabled={draggableDown || draggableUp} onGestureEvent={panHandler}>
          <Animated.View style={[sheetHeightStyle]}>
            {keyboardAvoid ? (
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                {SheetInner}
              </KeyboardAvoidingView>
            ) : (
              SheetInner
            )}
          </Animated.View>
        </PanGestureHandler>
      </AnimatedSheet>
    </Root>
  );
}

const Root = styled.View`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 9999;
`;

const AnimatedOverlay = styled(Animated.View)`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0,0,0,0.5);
`;

const AnimatedSheet = styled(Animated.View)`
  position: absolute;
  left: 0; right: 0; bottom: 0;
`;

const SheetTouchable = styled.View`
  width: 100%;
  background-color: #fff;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  overflow: hidden;
  ${Platform.OS === 'ios' ? 'padding-bottom: 10px;' : ''}
`;

const HandleBarWrap = styled.View`
  width: 100%;
  padding-top: 5px;
  align-items: center;
`;

const HandleBar = styled.View`
  width: 30px;
  height: 3px;
  border-radius: 100px;
  background-color: #aaa;
`;

const Header = styled.View`
  height: 57px;
  border-bottom-width: 1px;
  border-bottom-color: #c8c8c8;
  justify-content: center;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  height: 100%;
  padding: 0 12px;
`;

const HeaderSlot = styled.View<{ $pos: 'left' | 'center' | 'right' }>`
  ${({ $pos }) =>
    $pos === 'center'
      ? `flex: 1; align-items: center; justify-content: center;`
      : `width: 72px;`}

  ${({ $pos }) => ($pos === 'left' ? `align-items: flex-start;` : '')}
  ${({ $pos }) => ($pos === 'right' ? `align-items: flex-end;` : '')}
  justify-content: center;
`;

const HeaderTitle = styled.View<{ $align: 'left' | 'center' }>`
  ${({ $align }) =>
    $align === 'left'
      ? `width: 100%; padding-left: 30px; align-items: flex-start;`
      : `align-items: center;`}
`;

const BodyScroll = styled(ScrollView)`
  width: 100%;
`;

const BodyFixed = styled(View)`
  width: 100%;
`;

const Footer = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0 30px;

  justify-content: center;
  background-color: #fff;

  border-top-width: 1px;
  border-top-color: #eee;
`;