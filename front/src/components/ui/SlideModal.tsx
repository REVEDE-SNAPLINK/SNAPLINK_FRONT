import React, { useEffect } from 'react';
import {
  Dimensions,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  ScrollView,
  View,
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
import Typography from '@/components/ui/Typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const DEFAULT_FOOTER_HEIGHT = 72;
const OPEN_DURATION = 220;
const CLOSE_DURATION = 220;
const PADDING_HORIZONTAL = 20;
const SPRING_CONFIG = { damping: 22, stiffness: 260 };

type SlideModalProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;

  // 초기(고정) 높이. 미지정 시 SCREEN_HEIGHT * 0.5
  height?: number;
  // true면 HandleBar 위로 드래그 → 전체화면으로 확장 가능
  expandable?: boolean;

  // header
  showHeader?: boolean;
  title?: string;
  headerAlign?: 'left' | 'center';
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;

  // body layout
  scrollable?: boolean;

  // footer (sticky)
  footer?: React.ReactNode;
  footerHeight?: number;

  // keyboard
  keyboardAvoid?: boolean;

  closeOnOverlayPress?: boolean;

  // infinite scroll
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
};

type Ctx = { startTranslateY: number; startSheetHeight: number };

export default function SlideModal({
  visible,
  onClose,
  children,

  height: heightProp,
  expandable = false,

  showHeader = true,
  title,
  headerAlign = 'left',
  headerLeft,
  headerRight,

  scrollable = true,

  footer,
  footerHeight = DEFAULT_FOOTER_HEIGHT,

  keyboardAvoid = false,
  closeOnOverlayPress = true,
  onEndReached,
  onEndReachedThreshold = 0.1,
}: SlideModalProps) {
  const insets = useSafeAreaInsets();

  const initialHeight = heightProp ?? SCREEN_HEIGHT * 0.5;
  const snapFull = SCREEN_HEIGHT - insets.top;
  const resolvedFooterHeight = footer ? footerHeight : 0;

  const overlayOpacity = useSharedValue(0);
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const sheetHeight = useSharedValue(initialHeight);
  const keyboardOffset = useSharedValue(0);

  // ====== open / close ======
  useEffect(() => {
    if (visible) {
      sheetHeight.value = initialHeight;
      overlayOpacity.value = withTiming(1, { duration: 150 });
      translateY.value = withTiming(0, {
        duration: OPEN_DURATION,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      overlayOpacity.value = withTiming(0, { duration: 150 });
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: CLOSE_DURATION });
      sheetHeight.value = initialHeight;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // ====== Keyboard Avoiding — iOS ======
  useEffect(() => {
    if (!keyboardAvoid || Platform.OS !== 'ios') return;

    const showSub = Keyboard.addListener('keyboardWillShow', (e) => {
      const kbHeight = e.endCoordinates.height - Math.max(insets.bottom, 0);
      keyboardOffset.value = withTiming(Math.max(0, kbHeight), {
        duration: e.duration ?? 250,
        easing: Easing.out(Easing.cubic),
      });
    });
    const hideSub = Keyboard.addListener('keyboardWillHide', (e) => {
      keyboardOffset.value = withTiming(0, {
        duration: e.duration ?? 200,
        easing: Easing.out(Easing.cubic),
      });
    });

    return () => { showSub.remove(); hideSub.remove(); };
  }, [keyboardAvoid, insets.bottom, keyboardOffset]);

  // ====== Keyboard Avoiding — Android ======
  useEffect(() => {
    if (!keyboardAvoid || Platform.OS !== 'android') return;

    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      keyboardOffset.value = withTiming(Math.max(0, e.endCoordinates.height), {
        duration: 150,
        easing: Easing.out(Easing.cubic),
      });
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      keyboardOffset.value = withTiming(0, {
        duration: 150,
        easing: Easing.out(Easing.cubic),
      });
    });

    return () => { showSub.remove(); hideSub.remove(); };
  }, [keyboardAvoid, keyboardOffset]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const sheetTranslateStyle = useAnimatedStyle(() => {
    if (Platform.OS === 'ios') {
      return { transform: [{ translateY: translateY.value }] };
    }
    return {
      transform: [{ translateY: translateY.value - keyboardOffset.value }],
    };
  });

  const sheetBottomStyle = useAnimatedStyle(() => {
    if (Platform.OS !== 'ios') return {};
    return { bottom: keyboardOffset.value };
  });

  // scrollable 또는 expandable일 때만 height를 고정.
  // 그 외(non-scrollable, non-expandable)는 content 크기에 따라 자동으로 늘어남.
  const useFixedHeight = scrollable || expandable;

  const sheetHeightStyle = useAnimatedStyle(() => {
    if (!useFixedHeight) return {};
    return { height: sheetHeight.value };
  });

  // ====== Drag (2-snap-point) ======
  const panHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, Ctx>({
    onStart: (_, ctx) => {
      ctx.startTranslateY = translateY.value;
      ctx.startSheetHeight = sheetHeight.value;
    },
    onActive: (evt, ctx) => {
      const atExpanded = ctx.startSheetHeight >= snapFull - 10;

      if (atExpanded) {
        // 전체화면에서 아래로 드래그: 높이 줄이기
        if (evt.translationY > 0) {
          sheetHeight.value = Math.max(initialHeight, snapFull - evt.translationY);
        }
      } else {
        if (evt.translationY < 0 && expandable) {
          // 초기 높이에서 위로 드래그: 전체화면으로 확장
          sheetHeight.value = Math.min(snapFull, initialHeight + (-evt.translationY));
          translateY.value = 0;
        } else if (evt.translationY > 0) {
          // 초기 높이에서 아래로 드래그: 닫기 방향
          translateY.value = Math.max(0, evt.translationY);
        }
      }
    },
    onEnd: (evt) => {
      const aboveInitial = sheetHeight.value > initialHeight + 10;

      if (aboveInitial) {
        // 전체화면 ↔ 초기 높이 snap
        const distanceFromFull = snapFull - sheetHeight.value;
        const threshold = (snapFull - initialHeight) * 0.35;
        if (distanceFromFull > threshold || evt.velocityY > 500) {
          sheetHeight.value = withSpring(initialHeight, SPRING_CONFIG);
        } else {
          sheetHeight.value = withSpring(snapFull, SPRING_CONFIG);
        }
        translateY.value = withSpring(0, SPRING_CONFIG);
        return;
      }

      // 초기 높이에서 위로 드래그했다가 놓은 경우: 복귀
      if (expandable && evt.translationY < 0) {
        sheetHeight.value = withSpring(initialHeight, SPRING_CONFIG);
        translateY.value = withSpring(0, SPRING_CONFIG);
        return;
      }

      // 아래로 드래그: 닫기 또는 복귀
      const shouldClose = evt.translationY > 120 || evt.velocityY > 900;
      if (shouldClose) {
        overlayOpacity.value = withTiming(0, { duration: 120 });
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: CLOSE_DURATION }, (finished) => {
          if (finished) runOnJS(onClose)();
        });
      } else {
        translateY.value = withSpring(0, SPRING_CONFIG);
      }
    },
  });

  if (!visible) return null;

  const bodyPaddingBottom = resolvedFooterHeight
    ? resolvedFooterHeight + Math.max(insets.bottom, 0) + 22
    : Math.max(insets.bottom, 0) + 22;

  const bodyContent = scrollable ? (
    <BodyScroll
      style={{ flex: 1 }}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: PADDING_HORIZONTAL,
        paddingTop: 22,
        paddingBottom: bodyPaddingBottom,
      }}
      onScroll={
        onEndReached
          ? ({ nativeEvent }) => {
              const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
              const paddingToBottom = contentSize.height * onEndReachedThreshold;
              if (
                layoutMeasurement.height + contentOffset.y >=
                contentSize.height - paddingToBottom
              ) {
                onEndReached();
              }
            }
          : undefined
      }
      scrollEventThrottle={onEndReached ? 400 : undefined}
    >
      {children}
    </BodyScroll>
  ) : keyboardAvoid && Platform.OS === 'android' ? (
    <KeyboardAvoidingView
      style={useFixedHeight ? { flex: 1 } : undefined}
      behavior="height"
      keyboardVerticalOffset={resolvedFooterHeight}
    >
      <BodyFixed
        style={{
          ...(useFixedHeight ? { flex: 1 } : {}),
          paddingHorizontal: PADDING_HORIZONTAL,
          paddingTop: 22,
          paddingBottom: bodyPaddingBottom,
        }}
      >
        {children}
      </BodyFixed>
    </KeyboardAvoidingView>
  ) : (
    <BodyFixed
      style={{
        ...(useFixedHeight ? { flex: 1 } : {}),
        paddingHorizontal: PADDING_HORIZONTAL,
        paddingTop: 22,
        paddingBottom: bodyPaddingBottom,
      }}
    >
      {children}
    </BodyFixed>
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
      <AnimatedSheet
        style={[sheetTranslateStyle, sheetBottomStyle]}
        pointerEvents="box-none"
      >
        <PanGestureHandler onGestureEvent={panHandler}>
          <Animated.View style={sheetHeightStyle}>
            <SheetTouchable
              style={[
                useFixedHeight ? { flex: 1 } : { minHeight: heightProp },
              ]}
            >
              {/* Handle Bar */}
              <HandleBarWrap>
                <HandleBar />
              </HandleBarWrap>

              {/* Header */}
              {showHeader && (
                <Header>
                  {headerRight !== undefined ? (
                    <HeaderRowActions>
                      <HeaderActionSide style={{ alignItems: 'flex-start' }}>
                        {headerLeft ?? null}
                      </HeaderActionSide>
                      <Typography fontSize={14} fontWeight="bold">
                        {title ?? ''}
                      </Typography>
                      <HeaderActionSide style={{ alignItems: 'flex-end' }}>
                        {headerRight}
                      </HeaderActionSide>
                    </HeaderRowActions>
                  ) : (
                    <HeaderRow textAlign={headerAlign}>
                      {headerLeft !== undefined ? (
                        headerLeft
                      ) : (
                        <Typography fontSize={14} fontWeight="bold">
                          {title ?? ''}
                        </Typography>
                      )}
                    </HeaderRow>
                  )}
                </Header>
              )}

              {/* Body */}
              {bodyContent}

              {/* Sticky Footer */}
              {!!footer && (
                <Footer
                  style={{
                    height: footerHeight + Math.max(insets.bottom, 0),
                    paddingBottom: Math.max(insets.bottom, 8),
                  }}
                >
                  {footer}
                </Footer>
              )}
            </SheetTouchable>
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
  left: 0;
  right: 0;
  bottom: 0;
`;

const SheetTouchable = styled.View`
  width: 100%;
  background-color: #fff;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  overflow: hidden;
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

const HeaderRow = styled.View<{ textAlign: 'left' | 'center' }>`
  flex-direction: row;
  align-items: center;
  height: 100%;
  padding: 0 ${PADDING_HORIZONTAL}px;
  ${({ textAlign }) => textAlign === 'left' ? `justify-content: flex-start;` : `justify-content: center;`}
`;

const HeaderRowActions = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 ${PADDING_HORIZONTAL}px;
`;

const HeaderActionSide = styled.View`
  flex: 1;
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
  padding: 0 ${PADDING_HORIZONTAL}px;
  justify-content: center;
  background-color: #fff;
`;
