export const useSharedValue = (initial) => ({ value: initial });
export const useAnimatedStyle = (callback) => callback();
export const runOnJS = (fn) => fn;
export default {
  View: 'Animated.View',
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
};
