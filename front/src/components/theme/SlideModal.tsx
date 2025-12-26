import React, { useEffect, useMemo } from 'react';
import {
  Dimensions,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  View,
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
  Easing
} from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import styled from '@/utils/scale/CustomStyled';
import Typography from '@/components/theme/Typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DEFAULT_FOOTER_HEIGHT = 72;

type SlideModalProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;

  // sizing
  minHeight?: number;

  // header
  showHeader?: boolean;
  title?: string;
  headerAlign?: 'left' | 'center'; // left: padding-left 30px

  headerLeft?: React.ReactNode;
  headerCenter?: React.ReactNode; // 없으면 title 표시
  headerRight?: React.ReactNode;

  // body layout
  scrollable?: boolean;

  // footer (sticky actions/input)
  footer?: React.ReactNode;
  footerHeight?: number;

  // keyboard
  keyboardAvoid?: boolean; // input 있는 모달만 true 권장

  // drag behavior
  draggableDown?: boolean; // 기본 true
  draggableUp?: boolean; // 기본 false (댓글형만 true로)
  closeOnOverlayPress?: boolean; // 기본 true
};

export default function SlideModal({
  visible,
  onClose,
  children,
  minHeight,

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

  const overlayOpacity = useSharedValue(0);
  const translateY = useSharedValue(SCREEN_HEIGHT);

  const resolvedFooterHeight = footer ? footerHeight : 0;

  // 드래그 확장(댓글형): 기본은 content 기반 자연 높이.
  // draggableUp=true 일 때만 "max expanded" 개념을 적용.
  const expandedTranslateY = useMemo(() => {
    // 상단 여백 조금 남기고 꽉차는 느낌 (인스타 댓글 느낌)
    const topGap = 12 + insets.top;
    return Math.max(0, topGap);
  }, [insets.top]);

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 150 });
      translateY.value = withTiming(0, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      overlayOpacity.value = withTiming(0, { duration: 150 });
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 220 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // ----- Drag (Pan) -----
  type Ctx = { startY: number };

  const panHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, Ctx>({
    onStart: (_, ctx) => {
      ctx.startY = translateY.value;
    },
    onActive: (evt, ctx) => {
      // 기본은 "아래로만 드래그" (닫기)
      // draggableUp=true면 위로도 허용(확장)
      const next = ctx.startY + evt.translationY;

      if (!draggableUp) {
        // 위로 끌어올리는 건 무시(0보다 작게 안 감)
        translateY.value = Math.max(0, next);
        return;
      }

      // 위/아래 모두 허용: expandedTranslateY(위쪽) ~ SCREEN_HEIGHT(아래쪽)
      // expandedTranslateY는 "0이 아닌 topGap"이라 translateY를 음수로 안 쓰고,
      // 대신 "sheet 전체를 위로 더 올리는" 느낌을 translateY를 음수로 주는 방식은 복잡해짐.
      // 여기서는 간단히: translateY를 [- (SCREEN_HEIGHT - expandedTranslateY)] 같은 방식이 아니라
      // 0에서 위로 더 못 올라가게 하면 확장이 안 되므로,
      // 확장 모드는 "sheet 자체 높이"를 크게 잡는 방식이 더 정석이지만(아래에서 설명),
      // 지금 요청 범위에서는 '확장 시 topGap까지 올라간 것처럼' translateY를 음수로 허용한다.
      // (주의: overflow/레이아웃에 따라 테스트 필요)
      const minY = -(SCREEN_HEIGHT - expandedTranslateY);
      const maxY = SCREEN_HEIGHT;

      translateY.value = Math.min(maxY, Math.max(minY, next));
    },
    onEnd: (evt) => {
      if (!draggableDown && !draggableUp) return;

      // 닫기 기준: 아래로 충분히 내리거나 속도가 빠르면 닫기
      const shouldClose = draggableDown && (evt.translationY > 120 || evt.velocityY > 900);

      if (shouldClose) {
        overlayOpacity.value = withTiming(0, { duration: 120 });
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 220 }, (finished) => {
          if (finished) runOnJS(onClose)();
        });
        return;
      }

      // 확장 모드가 켜져 있을 때: 위로 플릭하면 "확장 위치"로 스냅
      if (draggableUp) {
        const shouldExpand = evt.translationY < -80 || evt.velocityY < -900;
        if (shouldExpand) {
          translateY.value = withSpring(-(SCREEN_HEIGHT - expandedTranslateY), {
            damping: 18,
            stiffness: 180,
          });
          return;
        }
      }

      // 기본: 원위치 스냅(0)
      translateY.value = withSpring(0, { damping: 18, stiffness: 180 });
    },
  });

  if (!visible) return null;

  const SheetInner = (
    <SheetTouchable style={minHeight ? ({ minHeight } as StyleProp<ViewStyle>) : undefined}>
      {/* Handle Bar */}
      <HandleBarWrap>
        <HandleBar />
      </HandleBarWrap>

      {/* Optional Header */}
      {/* Optional Header */}
      {showHeader && (
        <Header>
          <HeaderRow>
            <HeaderSlot $pos="left">
              {headerLeft}
            </HeaderSlot>

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

            <HeaderSlot $pos="right">
              {headerRight}
            </HeaderSlot>
          </HeaderRow>
        </Header>
      )}

      {/* Body */}
      {scrollable ? (
        <BodyScroll
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          contentContainerStyle={{
            paddingHorizontal: 30,
            paddingTop: 22,
            paddingBottom: resolvedFooterHeight ? resolvedFooterHeight + 22 : 22,
          }}
        >
          {children}
        </BodyScroll>
      ) : (
        <BodyFixed
          style={{
            paddingHorizontal: 30,
            paddingTop: 22,
            paddingBottom: resolvedFooterHeight ? resolvedFooterHeight + 22 : 22,
          }}
        >
          {children}
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
      <AnimatedSheet style={sheetStyle} pointerEvents="box-none">
        <PanGestureHandler enabled={draggableDown || draggableUp} onGestureEvent={panHandler}>
          <Animated.View>
            {keyboardAvoid ? (
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              >
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
  ${Platform.OS === 'ios' ? 'padding-bottom: 10px;' : null}
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

const HeaderTitle = styled.View<{ $align: 'left' | 'center' }>`
  ${({ $align }) =>
    $align === 'left'
      ? `padding-left: 30px; align-items: flex-start;`
      : `align-items: center;`}
`;

const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  height: 100%;
  padding: 0 12px; /* 좌우 기본 패딩 (필요하면 0으로) */
`;

const HeaderSlot = styled.View<{ $pos: 'left' | 'center' | 'right' }>`
  ${({ $pos }) =>
  $pos === 'center'
    ? `flex: 1; align-items: center; justify-content: center;`
    : `width: 72px;`} /* 좌/우 고정폭: 아이콘/버튼 들어가기 좋음 */
  
  ${({ $pos }) => ($pos === 'left' ? `align-items: flex-start;` : '')}
  ${({ $pos }) => ($pos === 'right' ? `align-items: flex-end;` : '')}
  justify-content: center;
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