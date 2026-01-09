import { useState, useCallback } from 'react';
import { LayoutChangeEvent } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import styled from '@/utils/scale/CustomStyled';
import { theme } from '@/theme';
import Typography from '@/components/theme/Typography';
import { formatNumber } from '@/utils/format.ts';

interface RangeSliderProps {
  min: number;
  max: number;
  initialMinValue?: number;
  initialMaxValue?: number;
  unit?: string;
  onChange: (minValue: number, maxValue: number) => void;
}

const MIN_RANGE = 50000; // 최소 범위 간격 (1만원)
const TOUCH_AREA = 44; // 터치 영역 크기 (더 넓게)

export default function RangeSlider({
  min,
  max,
  initialMinValue,
  initialMaxValue,
  unit = '원',
  onChange,
}: RangeSliderProps) {
  const [minValue, setMinValue] = useState(initialMinValue ?? min);
  const [maxValue, setMaxValue] = useState(initialMaxValue ?? max);
  const [sliderWidth, setSliderWidth] = useState(0);

  const minPosition = useSharedValue(0);
  const maxPosition = useSharedValue(1);
  const startMinPosition = useSharedValue(0);
  const startMaxPosition = useSharedValue(0);

  const formatValue = (value: number): string => {
    if (value >= 10000) {
      return `${Math.floor(value / 10000)}만${unit}`;
    }
    return `${formatNumber(value)}${unit}`;
  };


  const updateMinValue = useCallback(
    (value: number) => {
      setMinValue(value);
    },
    []
  );

  const updateMaxValue = useCallback(
    (value: number) => {
      setMaxValue(value);
    },
    []
  );

  const notifyChange = useCallback(
    (newMin: number, newMax: number) => {
      onChange(newMin, newMax);
    },
    [onChange]
  );

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setSliderWidth(width);

    // Initialize positions
    if (width > 0) {
      minPosition.value = (minValue - min) / (max - min);
      maxPosition.value = (maxValue - min) / (max - min);
    }
  };

  // Min thumb gesture
  const minPanGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      startMinPosition.value = minPosition.value;
    })
    .onUpdate((event: any) => {
      'worklet';
      if (sliderWidth === 0) return;

      const newRatio = startMinPosition.value + event.translationX / sliderWidth;
      const clampedRatio = Math.max(0, Math.min(1, newRatio));
      const newValue = Math.round(min + (max - min) * clampedRatio);

      // Ensure min doesn't exceed max - MIN_RANGE
      const maxAllowed = Math.max(min, maxValue - MIN_RANGE);
      const clampedValue = Math.max(min, Math.min(newValue, maxAllowed));

      minPosition.value = (clampedValue - min) / (max - min);
      runOnJS(updateMinValue)(clampedValue);
    })
    .onEnd(() => {
      'worklet';
      runOnJS(notifyChange)(minValue, maxValue);
    });

  // Max thumb gesture
  const maxPanGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      startMaxPosition.value = maxPosition.value;
    })
    .onUpdate((event: any) => {
      'worklet';
      if (sliderWidth === 0) return;

      const newRatio = startMaxPosition.value + event.translationX / sliderWidth;
      const clampedRatio = Math.max(0, Math.min(1, newRatio));
      const newValue = Math.round(min + (max - min) * clampedRatio);

      // Ensure max doesn't go below min + MIN_RANGE
      const minAllowed = Math.min(max, minValue + MIN_RANGE);
      const clampedValue = Math.min(max, Math.max(newValue, minAllowed));

      maxPosition.value = (clampedValue - min) / (max - min);
      runOnJS(updateMaxValue)(clampedValue);
    })
    .onEnd(() => {
      'worklet';
      runOnJS(notifyChange)(minValue, maxValue);
    });

  // Animated styles
  const minThumbStyle = useAnimatedStyle(() => ({
    left: minPosition.value * sliderWidth - TOUCH_AREA / 2,
  }));

  const maxThumbStyle = useAnimatedStyle(() => ({
    left: maxPosition.value * sliderWidth - TOUCH_AREA / 2,
  }));

  const activeTrackStyle = useAnimatedStyle(() => ({
    left: minPosition.value * sliderWidth,
    width: (maxPosition.value - minPosition.value) * sliderWidth,
  }));

  const isMinAtLimit = minValue === min;
  const isMaxAtLimit = maxValue === max;

  return (
    <Container>
      <SliderContainer onLayout={handleLayout}>
        {/* Background Track */}
        <Track />

        {/* Active Track */}
        <ActiveTrack style={activeTrackStyle} />

        {/* Min Thumb */}
        <GestureDetector gesture={minPanGesture}>
          <ThumbTouchArea style={minThumbStyle}>
            {!isMinAtLimit && (
              <ValueLabel>
                <Typography fontSize={11} fontWeight="bold" color="#fff">
                  {formatValue(minValue)}
                </Typography>
              </ValueLabel>
            )}
            <Thumb />
          </ThumbTouchArea>
        </GestureDetector>

        {/* Max Thumb */}
        <GestureDetector gesture={maxPanGesture}>
          <ThumbTouchArea style={maxThumbStyle}>
            {!isMaxAtLimit && (
              <ValueLabel>
                <Typography fontSize={11} fontWeight="bold" color="#fff">
                  {formatValue(maxValue)}
                </Typography>
              </ValueLabel>
            )}
            <Thumb />
          </ThumbTouchArea>
        </GestureDetector>
      </SliderContainer>

      <RangeLabels>
        <Typography fontSize={12} color={isMinAtLimit ? theme.colors.textPrimary : theme.colors.disabled}>
          최소
        </Typography>
        <Typography
          fontSize={12}
          color={isMaxAtLimit ? theme.colors.textPrimary : theme.colors.disabled}
        >
          최대
        </Typography>
      </RangeLabels>
      <RangeValues>
        <Typography fontSize={12} color={isMinAtLimit ? theme.colors.textPrimary : theme.colors.disabled}>
          {formatValue(min)}
        </Typography>
        <Typography
          fontSize={12}
          color={isMaxAtLimit ? theme.colors.textPrimary : theme.colors.disabled}
        >
          {formatValue(max)}
        </Typography>
      </RangeValues>
    </Container>
  );
}

const Container = styled.View`
  width: 100%;
  padding-vertical: 10px;
`;

const SliderContainer = styled.View`
  height: 40px;
  width: 100%;
  justify-content: center;
  position: relative;
  margin-vertical: 20px;
`;

const Track = styled.View`
  height: 2px;
  width: 100%;
  background-color: ${theme.colors.disabled};
  position: absolute;
  top: 50%;
  margin-top: -1px;
`;

const ActiveTrack = styled(Animated.View)`
  height: 2px;
  background-color: ${theme.colors.primary};
  position: absolute;
  top: 50%;
  margin-top: -1px;
`;

const ThumbTouchArea = styled(Animated.View)`
  position: absolute;
  width: 44px;
  height: 40px;
  align-items: center;
  justify-content: center;
  top: 0;
`;

const ValueLabel = styled.View`
  position: absolute;
  top: -15px;
  padding-horizontal: 8px;
  padding-vertical: 4px;
  background-color: ${theme.colors.primary};
  border-radius: 8px;
  min-width: 60px;
  align-items: center;
`;

const Thumb = styled.View`
  width: 15px;
  height: 15px;
  border-radius: 7.5px;
  background-color: ${theme.colors.primary};
  position: absolute;
  top: 50%;
  margin-top: -7.5px;
`;

const RangeLabels = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 5px;
`;

const RangeValues = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 5px;
`;
