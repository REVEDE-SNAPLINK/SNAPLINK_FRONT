import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ImageSourcePropType,
} from 'react-native';
import styled from '@/utils/scale/CustomStyled.ts';
import Typography from '@/components/theme/Typography.tsx';
import LinearGradient from 'react-native-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 요구사항 반영: 아이템 너비는 전체에서 40을 뺀 값
const ITEM_WIDTH = SCREEN_WIDTH - 40;
// 양옆에 20px씩 보여야 하므로, Content 패딩도 20px
const SIDE_SPACING = 20;

const AUTO_PLAY_INTERVAL = 3000;

export type BannerItem = {
  id: string;
  image: ImageSourcePropType;
  title?: string;
  description?: string;
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
  const [currentIndex, setCurrentIndex] = useState(1);
  const isManualScrolling = useRef(false);

  // 1. 무한 스크롤을 위한 데이터 복제
  const infiniteItems = items.length > 1
    ? [items[items.length - 1], ...items, items[0]]
    : items;

  // 2. 초기 위치 설정 (첫 번째 진짜 아이템으로)
  useEffect(() => {
    if (items.length > 1) {
      // ITEM_WIDTH만큼 이동하되, 왼쪽 패딩(SIDE_SPACING) 고려
      flatListRef.current?.scrollToOffset({
        offset: ITEM_WIDTH,
        animated: false,
      });
    }
  }, [items.length]);

  // 3. 자동 재생 로직
  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;

    const timer = setInterval(() => {
      if (!isManualScrolling.current) {
        const nextIndex = currentIndex + 1;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        setCurrentIndex(nextIndex);
      }
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, items.length, currentIndex]);

  const handleScrollBeginDrag = () => {
    isManualScrolling.current = true;
  };

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    isManualScrolling.current = false;
    const offsetX = event.nativeEvent.contentOffset.x;
    // 패딩을 제외한 순수 이동 거리로 인덱스 계산
    const index = Math.round(offsetX / ITEM_WIDTH);

    if (index === 0) {
      flatListRef.current?.scrollToIndex({ index: items.length, animated: false });
      setCurrentIndex(items.length);
    } else if (index === infiniteItems.length - 1) {
      flatListRef.current?.scrollToIndex({ index: 1, animated: false });
      setCurrentIndex(1);
    } else {
      setCurrentIndex(index);
    }
  };

  // Dot 인덱스 계산
  const actualDotIndex = items.length <= 1 ? 0 : (currentIndex - 1 + items.length) % items.length;

  const renderItem = ({ item, index }: { item: BannerItem; index: number }) => (
    <BannerSlide key={`${item.id}-${index}`}>
      <BannerImage source={item.image} />
      <BannerOverlay
        colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, .24)', 'rgba(0, 0, 0, .7)']}
        locations={[0, 0.29, 0.63]}
      />
      {(item.title || item.description) && (
        <TextOverlay>
          {item.description && (
            <Typography fontSize={12} fontWeight="regular" letterSpacing={-0.4} color="#fff">
              {item.description}
            </Typography>
          )}
          {item.title && (
            <Typography fontSize={17} fontWeight="bold" letterSpacing={-0.4} color="#fff">
              {item.title}
            </Typography>
          )}
        </TextOverlay>
      )}
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
        pagingEnabled={false} // snapToInterval을 위해 false
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={handleScrollBeginDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        // 핵심: 카드 너비만큼씩 딱딱 멈추게 함
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        // 양 옆 20px 노출을 위한 설정
        contentContainerStyle={{
          paddingHorizontal: SIDE_SPACING,
        }}
        scrollEventThrottle={16}
        // getItemLayout 추가로 스크롤 성능 및 정확도 향상
        getItemLayout={(_, index) => ({
          length: ITEM_WIDTH,
          offset: ITEM_WIDTH * index,
          index,
        })}
      />

      {items.length > 1 && (
        <DotContainer>
          {items.map((_, index) => (
            <AnimatedDot key={index} index={index} activeIndex={actualDotIndex} />
          ))}
        </DotContainer>
      )}
    </BannerContainer>
  );
}

// --- 아래는 스타일 및 AnimatedDot (기존 코드 유지) ---

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

const BannerSlide = styled.View`
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
  left: 26px; /* 카드 안쪽 여백에 맞게 조정 */
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