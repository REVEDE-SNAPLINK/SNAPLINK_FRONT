import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ImageSourcePropType,
} from 'react-native';
import styled from '@/utils/scale/CustomStyled.ts';
import LinearGradient from 'react-native-linear-gradient';
import { openUrl } from '@/utils/link.ts';
import { navigateByDeepLink } from '@/navigation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ITEM_WIDTH = SCREEN_WIDTH - 40;
const SIDE_SPACING = 20;
const AUTO_PLAY_INTERVAL = 3000;

export type BannerItem = {
  image: ImageSourcePropType;
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
  const flatListRef = useRef<FlatList>(null);
  const currentIndexRef = useRef(1); // ref로 관리하여 타이머 deps에서 제거
  const [dotIndex, setDotIndex] = useState(0); // Dot 인디케이터용 state만 별도
  const isManualScrolling = useRef(false);
  const isAutoScrolling = useRef(false);

  // 무한 스크롤을 위한 데이터 복제
  const infiniteItems = items.length > 1
    ? [items[items.length - 1], ...items, items[0]]
    : items;

  // snap 위치 배열 (paddingHorizontal 고려)
  const snapOffsets = infiniteItems.map((_, index) => index * ITEM_WIDTH);

  // 실제 인덱스 → Dot 인덱스 변환
  const toDotIndex = useCallback((index: number) => {
    if (items.length <= 1) return 0;
    return (index - 1 + items.length) % items.length;
  }, [items.length]);

  // 초기 위치 설정 (첫 번째 진짜 아이템으로)
  useEffect(() => {
    if (items.length > 1) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: ITEM_WIDTH,
          animated: false,
        });
      }, 50);
    }
  }, [items.length]);

  // 끝단 보정 (가짜 아이템 → 진짜 아이템으로 이동)
  const correctBoundary = useCallback((index: number) => {
    if (items.length <= 1) return;

    if (index <= 0) {
      // 첫 번째 가짜(마지막 복제) → 마지막 진짜
      const targetIndex = items.length;
      currentIndexRef.current = targetIndex;
      setDotIndex(toDotIndex(targetIndex));
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: targetIndex * ITEM_WIDTH,
          animated: false,
        });
      }, 300); // 애니메이션 완료 후 점프
    } else if (index >= infiniteItems.length - 1) {
      // 마지막 가짜(첫 번째 복제) → 첫 번째 진짜
      const targetIndex = 1;
      currentIndexRef.current = targetIndex;
      setDotIndex(toDotIndex(targetIndex));
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: targetIndex * ITEM_WIDTH,
          animated: false,
        });
      }, 300);
    }
  }, [items.length, infiniteItems.length, toDotIndex]);

  // 자동 재생 (currentIndex를 deps에서 제거하여 타이머 한 번만 생성)
  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;

    const timer = setInterval(() => {
      if (isManualScrolling.current) return;

      isAutoScrolling.current = true;
      const nextIndex = currentIndexRef.current + 1;

      // 마지막 가짜 아이템까지 animated로 이동 (부드러운 전환)
      flatListRef.current?.scrollToOffset({
        offset: nextIndex * ITEM_WIDTH,
        animated: true,
      });

      currentIndexRef.current = nextIndex;
      setDotIndex(toDotIndex(nextIndex));

      // 마지막 가짜에 도착하면 보정
      if (nextIndex >= infiniteItems.length - 1) {
        correctBoundary(nextIndex);
      }

      // auto scroll 플래그 해제
      setTimeout(() => {
        isAutoScrolling.current = false;
      }, 400);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, items.length, infiniteItems.length, toDotIndex, correctBoundary]);

  // 수동 스크롤 시작
  const handleScrollBeginDrag = useCallback(() => {
    isManualScrolling.current = true;
  }, []);

  // 수동 스크롤 끝 (손을 뗄 때)
  const handleScrollEndDrag = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / ITEM_WIDTH);
    currentIndexRef.current = index;
    setDotIndex(toDotIndex(index));
  }, [toDotIndex]);

  // 모멘텀 끝 (관성 스크롤 완료 시)
  const handleMomentumScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    isManualScrolling.current = false;
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / ITEM_WIDTH);
    currentIndexRef.current = index;
    setDotIndex(toDotIndex(index));

    // 끝단 보정
    correctBoundary(index);
  }, [toDotIndex, correctBoundary]);

  // 스크롤 중 Dot 업데이트 (ref만 업데이트, state는 드래그 끝에서만)
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!isManualScrolling.current) return; // 수동 스크롤 중에만
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / ITEM_WIDTH);
    if (index >= 0 && index < infiniteItems.length && index !== currentIndexRef.current) {
      currentIndexRef.current = index;
      setDotIndex(toDotIndex(index));
    }
  }, [infiniteItems.length, toDotIndex]);

  const handleBannerPress = useCallback((linkUri?: string) => {
    if (!linkUri) return;
    if (linkUri.startsWith('snaplink://') || linkUri.startsWith('https://link.snaplink.run')) {
      navigateByDeepLink(linkUri);
    } else {
      openUrl(linkUri);
    }
  }, []);

  const renderItem = ({ item, index }: { item: BannerItem; index: number }) => (
    <BannerSlide
      key={`${index}`}
      {...(item.linkUri ? { onPress: () => handleBannerPress(item.linkUri) } : {})}
    >
      <BannerImage source={item.image} />
    </BannerSlide>
  );

  return (
    <BannerContainer>
      <FlatList
        ref={flatListRef}
        data={infiniteItems}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        snapToOffsets={snapOffsets}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: SIDE_SPACING,
        }}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: ITEM_WIDTH,
          offset: ITEM_WIDTH * index,
          index,
        })}
      />

      {items.length > 1 && (
        <DotContainer>
          {items.map((_, index) => (
            <AnimatedDot key={index} index={index} activeIndex={dotIndex} />
          ))}
        </DotContainer>
      )}
    </BannerContainer>
  );
}

// --- AnimatedDot ---

function AnimatedDot({ index, activeIndex }: { index: number; activeIndex: number }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const distance = Math.abs(index - activeIndex);
    let targetScale = distance === 0 ? 1.5 : distance === 1 ? 1.2 : 1;

    Animated.spring(scaleAnim, {
      toValue: targetScale,
      useNativeDriver: true,
      friction: 7,
      tension: 40,
    }).start();
  }, [activeIndex, index, scaleAnim]);

  const isActive = index === activeIndex;

  return (
    <AnimatedDotView
      style={{
        transform: [{ scale: scaleAnim }],
        backgroundColor: isActive ? '#fff' : 'rgba(255, 255, 255, 0.5)',
      }}
    />
  );
}

const BannerContainer = styled.View`
  height: ${ITEM_WIDTH}px;
  width: ${SCREEN_WIDTH}px;
  position: relative;
`;

const BannerSlide = styled.Pressable`
  width: ${ITEM_WIDTH}px;
  height: ${ITEM_WIDTH}px;
  position: relative;
  overflow: hidden;
`;

const BannerImage = styled.Image`
  width: 100%;
  height: 100%;
  resize-mode: cover;
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