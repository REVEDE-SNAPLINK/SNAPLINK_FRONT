import React, { useState, useCallback, useRef } from 'react';
import { Dimensions, GestureResponderEvent, TouchableWithoutFeedback } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import styled from '@/utils/scale/CustomStyled.ts';
import LinearGradient from 'react-native-linear-gradient';
import { openUrl } from '@/utils/link.ts';
import { navigateByDeepLink } from '@/navigation';
import Carousel from 'react-native-reanimated-carousel';
import Animated, { useAnimatedStyle, useSharedValue, interpolate, Extrapolate, withSpring } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ITEM_WIDTH = SCREEN_WIDTH - 40;
const SIDE_SPACING = 20;
const AUTO_PLAY_INTERVAL = 3000;

export type BannerItem = {
  image: number | { uri: string };
  linkUri?: string;
};

type BannerProps = {
  items: BannerItem[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
};

export default function Banner({
  items,
  autoPlay = true,
  autoPlayInterval = AUTO_PLAY_INTERVAL,
}: BannerProps) {
  const progressValue = useSharedValue<number>(0);

  // 스와이프 방지 클릭 판별용 state
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleTouchStart = useCallback((e: GestureResponderEvent) => {
    touchStartX.current = e.nativeEvent.pageX;
    touchStartY.current = e.nativeEvent.pageY;
  }, []);

  const handleBannerPress = useCallback((e: GestureResponderEvent, linkUri?: string) => {
    if (!linkUri) return;

    // 터치 시작 지점과 끝 지점의 거리 계산 (스와이프 vs 클릭 판별)
    const distanceX = Math.abs(e.nativeEvent.pageX - touchStartX.current);
    const distanceY = Math.abs(e.nativeEvent.pageY - touchStartY.current);

    // 10px 이상 이동했으면 스와이프로 간주하고 클릭 무시
    if (distanceX > 10 || distanceY > 10) return;

    if (linkUri.startsWith('snaplink://') || linkUri.startsWith('https://link.snaplink.run')) {
      navigateByDeepLink(linkUri);
    } else {
      openUrl(linkUri);
    }
  }, []);

  const renderItem = useCallback(({ item, index }: { item: BannerItem; index: number }) => (
    <TouchableWithoutFeedback
      onPressIn={item.linkUri ? handleTouchStart : undefined}
      onPress={(e) => item.linkUri && handleBannerPress(e, item.linkUri)}
    >
      <BannerSlide key={`${index}`}>
        <BannerImage
          source={item.image}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
          priority="high"
        />
      </BannerSlide>
    </TouchableWithoutFeedback>
  ), [handleTouchStart, handleBannerPress]);

  return (
    <BannerContainer>
      <Carousel
        loop={items.length > 1}
        width={ITEM_WIDTH}
        height={ITEM_WIDTH}
        autoPlay={items.length > 1 && autoPlay}
        autoPlayInterval={autoPlayInterval}
        data={items}
        scrollAnimationDuration={500}
        onProgressChange={(_, absoluteProgress) => {
          progressValue.value = absoluteProgress;
        }}
        renderItem={renderItem}
        style={{ width: SCREEN_WIDTH, justifyContent: 'center', alignItems: 'center' }}
      />

      {items.length > 1 && (
        <DotContainer>
          {items.map((_, index) => (
            <AnimatedDot
              key={index}
              index={index}
              animValue={progressValue}
              length={items.length}
            />
          ))}
        </DotContainer>
      )}
    </BannerContainer>
  );
}

// --- AnimatedDot ---

function AnimatedDot({ index, animValue, length }: { index: number; animValue: Animated.SharedValue<number>; length: number }) {
  const rStyle = useAnimatedStyle(() => {
    // 무한 루프 환경에서의 인덱스 거리 계산 (양방향 연결)
    let distance = Math.abs(animValue.value - index);
    if (distance > length / 2) {
      distance = length - distance;
    }

    const targetScale = interpolate(
      distance,
      [0, 1, 2],
      [1.5, 1.2, 1],
      Extrapolate.CLAMP
    );

    const targetOpacity = interpolate(
      distance,
      [0, 1, 2],
      [1, 0.5, 0.5],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        {
          scale: targetScale, // 실시간 보간값을 스프링 없이 즉각 반영
        },
      ],
      backgroundColor: `rgba(255, 255, 255, ${targetOpacity})`,
    };
  }, [index, length]);

  return <AnimatedDotView style={rStyle} />;
}

const BannerContainer = styled.View`
  height: ${ITEM_WIDTH}px;
  width: ${SCREEN_WIDTH}px;
  position: relative;
  align-items: center;
`;

const BannerSlide = styled.View`
  width: ${ITEM_WIDTH}px;
  height: ${ITEM_WIDTH}px;
  position: relative;
  overflow: hidden;
`;

const BannerImage = styled(ExpoImage)`
  width: 100%;
  height: 100%;
`;

const BannerOverlay = styled(LinearGradient)`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 65%;
  z-index: 5;
`;

const TextOverlay = styled.View`
  position: absolute;
  bottom: 33px;
  left: 26px;
  z-index: 10;
`;

const DotContainer = styled.View`
  position: absolute;
  bottom: 12px;
  left: 46px;
  flex-direction: row;
  align-items: center;
  z-index: 20;
`;

const AnimatedDotView = styled(Animated.View)`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  margin-right: 6px;
`;