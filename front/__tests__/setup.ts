import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  return {
    Svg: ({ children, ...props }: any) => React.createElement('Svg', props, children),
    Circle: (props: any) => React.createElement('Circle', props),
    Ellipse: (props: any) => React.createElement('Ellipse', props),
    G: ({ children, ...props }: any) => React.createElement('G', props, children),
    Text: ({ children, ...props }: any) => React.createElement('Text', props, children),
    TSpan: ({ children, ...props }: any) => React.createElement('TSpan', props, children),
    Path: (props: any) => React.createElement('Path', props),
    Polygon: (props: any) => React.createElement('Polygon', props),
    Polyline: (props: any) => React.createElement('Polyline', props),
    Line: (props: any) => React.createElement('Line', props),
    Rect: (props: any) => React.createElement('Rect', props),
    Use: (props: any) => React.createElement('Use', props),
    Image: (props: any) => React.createElement('Image', props),
    Symbol: ({ children, ...props }: any) => React.createElement('Symbol', props, children),
    Defs: ({ children, ...props }: any) => React.createElement('Defs', props, children),
    LinearGradient: ({ children, ...props }: any) => React.createElement('LinearGradient', props, children),
    RadialGradient: ({ children, ...props }: any) => React.createElement('RadialGradient', props, children),
    Stop: (props: any) => React.createElement('Stop', props),
    ClipPath: ({ children, ...props }: any) => React.createElement('ClipPath', props, children),
    Pattern: ({ children, ...props }: any) => React.createElement('Pattern', props, children),
    Mask: ({ children, ...props }: any) => React.createElement('Mask', props, children),
  };
});

// Mock SVG imports
jest.mock('@/assets/imgs/profile.svg', () => 'ProfileIcon');
jest.mock('@/assets/icons/consent.svg', () => 'ConsentIcon');
jest.mock('@/assets/imgs/type1.svg', () => 'Type1Icon');
jest.mock('@/assets/icons/arrow-left.svg', () => 'ArrowLeftIcon');

// Mock image assets
jest.mock('@/assets/icons/calendar.png', () => 'CalendarIcon');
jest.mock('@/assets/icons/location.png', () => 'LocationIcon');

// Silence the warning: Animated: `useNativeDriver` is not supported
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
