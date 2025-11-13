import { useEffect, useRef, useState } from 'react';
import styled from '@/utils/scale/CustomStyled.ts';
import { Animated, Dimensions, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { ImageSourcePropType } from 'react-native';
import Typography from '@/components/theme/Typography.tsx';
import LinearGradient from 'react-native-linear-gradient';

const SCREEN_WIDTH = Dimensions.get('window').width;
const AUTO_PLAY_INTERVAL = 3000; // 3초

export type BannerItem = {
  id: string;
  image: ImageSourcePropType;
  title?: string;
  description?: string;
};

type BannerProps = {
  items: BannerItem[];
  height?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
};

export default function Banner({
  items,
  height = 264,
  autoPlay = true,
  autoPlayInterval = AUTO_PLAY_INTERVAL,
}: BannerProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(1); // 무한 스크롤을 위해 1부터 시작
  const autoPlayTimer = useRef<NodeJS.Timeout | null>(null);
  const isManualScrolling = useRef(false);

  // 무한 스크롤을 위해 앞뒤에 아이템 추가
  const infiniteItems = items.length > 1
    ? [items[items.length - 1], ...items, items[0]]
    : items;

  // 초기 스크롤 위치 설정
  useEffect(() => {
    if (items.length > 1) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: SCREEN_WIDTH,
          animated: false,
        });
      }, 0);
    }
  }, [items.length]);

  // 자동 재생
  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;

    autoPlayTimer.current = setInterval(() => {
      if (!isManualScrolling.current) {
        setCurrentIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          scrollViewRef.current?.scrollTo({
            x: nextIndex * SCREEN_WIDTH,
            animated: true,
          });
          return nextIndex;
        });
      }
    }, autoPlayInterval);

    return () => {
      if (autoPlayTimer.current) {
        clearInterval(autoPlayTimer.current);
      }
    };
  }, [autoPlay, autoPlayInterval, items.length]);

  // 스크롤 시작
  const handleScrollBeginDrag = () => {
    isManualScrolling.current = true;
  };

  // 스크롤 종료
  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    isManualScrolling.current = false;

    if (items.length <= 1) return;

    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);

    setCurrentIndex(index);

    // 무한 스크롤 처리
    if (index === 0) {
      // 첫 번째 복사본 -> 마지막 실제 아이템으로 점프
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: items.length * SCREEN_WIDTH,
          animated: false,
        });
        setCurrentIndex(items.length);
      }, 50);
    } else if (index === infiniteItems.length - 1) {
      // 마지막 복사본 -> 첫 번째 실제 아이템으로 점프
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: SCREEN_WIDTH,
          animated: false,
        });
        setCurrentIndex(1);
      }, 50);
    }
  };

  // 실제 dot index 계산
  const getActualDotIndex = (index: number) => {
    if (items.length <= 1) return 0;
    if (index === 0) return items.length - 1;
    if (index === infiniteItems.length - 1) return 0;
    return index - 1;
  };

  const actualDotIndex = getActualDotIndex(currentIndex);

  return (
    <BannerContainer height={height}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={handleScrollBeginDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
        snapToAlignment="start"
      >
        {infiniteItems.map((item, index) => (
          <BannerSlide key={`${item.id}-${index}`}>
            <BannerImage source={item.image} />
            <BannerOverlay
              colors={[
                'rgba(0, 0, 0, 0)',
                'rgba(0, 0, 0, .24)',
                'rgba(0, 0, 0, .7)',
              ]}
              locations={[0, 0.29, 0.63]}
            />
            {(item.title || item.description) && (
              <TextOverlay>
                {item.description && <Typography fontSize={12} fontWeight="regular" letterSpacing={-0.4} color="#fff">{item.description}</Typography>}
                {item.title && <Typography fontSize={17} fontWeight="bold" letterSpacing={-0.4} color="#fff">{item.title}</Typography>}
              </TextOverlay>
            )}
          </BannerSlide>
        ))}
      </ScrollView>

      {items.length > 1 && (
        <DotContainer>
          {items.map((_, index) => (
            <AnimatedDot
              key={index}
              index={index}
              activeIndex={actualDotIndex}
            />
          ))}
        </DotContainer>
      )}
    </BannerContainer>
  );
}

// Animated Dot Component
function AnimatedDot({ index, activeIndex }: { index: number; activeIndex: number }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const distance = Math.abs(index - activeIndex);
    let targetScale = 1;

    if (distance === 0) targetScale = 1.5; // 현재 선택된 dot
    else if (distance === 1) targetScale = 1.2; // 양옆
    else targetScale = 1; // 나머지

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

const BannerContainer = styled.View<{ height: number }>`
  height: 264px;
  width: ${SCREEN_WIDTH}px;
  position: relative;
  margin-left: -26px;
  margin-right: -26px;
`;

const BannerSlide = styled.View`
  width: ${SCREEN_WIDTH}px;
  height: 264px;
  position: relative;
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
`

const TextOverlay = styled.View`
  position: absolute;
  bottom: 33px;
  left: 46px;
  z-index: 10;
`;

const DotContainer = styled.View`
  position: absolute;
  bottom: 12px;
  left: 46px;
  flex-direction: row;
  align-items: center;
`;

const AnimatedDotView = styled(Animated.View)`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  margin-right: 6px;
`;
