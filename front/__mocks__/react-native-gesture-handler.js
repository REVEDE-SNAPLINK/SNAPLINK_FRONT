export const GestureDetector = ({ children }) => children;

const createGestureMock = () => {
  const gesture = {
    onStart: jest.fn(() => gesture),
    onUpdate: jest.fn(() => gesture),
    onEnd: jest.fn(() => gesture),
    onTouchesDown: jest.fn(() => gesture),
    enabled: jest.fn(() => gesture),
  };
  return gesture;
};

export const Gesture = {
  Pan: jest.fn(() => createGestureMock()),
  Tap: jest.fn(() => createGestureMock()),
  LongPress: jest.fn(() => createGestureMock()),
};

export const GestureHandlerRootView = ({ children }) => children;
