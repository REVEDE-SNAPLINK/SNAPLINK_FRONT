import { useState, useEffect } from 'react';
import { TouchableOpacityProps, Animated } from 'react-native';
import styled from '@/utils/scale/CustomStyled';
import { theme } from '@/theme';

interface ToggleButtonProps extends Omit<TouchableOpacityProps, 'onPress'> {
  value: boolean;
  onToggle: (value: boolean) => void;
  disabled?: boolean;
}

const TOGGLE_WIDTH = 51;
const TOGGLE_HEIGHT = 31;
const CIRCLE_SIZE = 27;
const CIRCLE_PADDING = 2;
const BORDER_RADIUS = 15.5;

const ToggleContainer = styled.TouchableOpacity<{ $isActive: boolean; $disabled?: boolean }>`
  width: ${TOGGLE_WIDTH}px;
  height: ${TOGGLE_HEIGHT}px;
  border-radius: ${BORDER_RADIUS}px;
  background-color: ${({ $isActive, $disabled }) =>
    $disabled ? '#E0E0E1' : $isActive ? theme.colors.primary : '#E0E0E1'}; /* #2B9E1E -> theme.colors.primary (임시) */
  justify-content: center;
  padding: ${CIRCLE_PADDING}px;
  opacity: ${({ $disabled }) => $disabled ? 0.5 : 1};
`;

const ToggleCircleWrapper = styled(Animated.View)``;

const ToggleCircle = styled.View`
  width: ${CIRCLE_SIZE}px;
  height: ${CIRCLE_SIZE}px;
  border-radius: ${CIRCLE_SIZE / 2}px;
  background-color: #FFFFFF;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.15;
  shadow-radius: 3px;
  elevation: 3;
`;

export default function ToggleButton({
  value,
  onToggle,
  disabled = false,
  ...rest
}: ToggleButtonProps) {
  const [animation] = useState(new Animated.Value(value ? 1 : 0));

  useEffect(() => {
    Animated.spring(animation, {
      toValue: value ? 1 : 0,
      useNativeDriver: true,
      friction: 7,
      tension: 40,
    }).start();
  }, [value, animation]);

  const handlePress = () => {
    if (!disabled) {
      onToggle(!value);
    }
  };

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TOGGLE_WIDTH - CIRCLE_SIZE - CIRCLE_PADDING * 2],
  });

  return (
    <ToggleContainer
      $isActive={value}
      $disabled={disabled}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={disabled}
      {...rest}
    >
      <ToggleCircleWrapper style={{ transform: [{ translateX }] }}>
        <ToggleCircle />
      </ToggleCircleWrapper>
    </ToggleContainer>
  );
}
