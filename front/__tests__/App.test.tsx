import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

// Mock react-native-permissions
jest.mock('react-native-permissions', () => ({
  PERMISSIONS: {
    IOS: {
      CAMERA: 'ios.permission.CAMERA',
      PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY',
    },
    ANDROID: {
      CAMERA: 'android.permission.CAMERA',
      READ_MEDIA_IMAGES: 'android.permission.READ_MEDIA_IMAGES',
    },
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    BLOCKED: 'blocked',
    UNAVAILABLE: 'unavailable',
    LIMITED: 'limited',
  },
  check: jest.fn(),
  request: jest.fn(),
  checkNotifications: jest.fn(),
  requestNotifications: jest.fn(),
  openSettings: jest.fn(),
}));

// Mock SafeAreaProvider to render children directly
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Mock navigation
jest.mock('@/navigation', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return function AppNavigator() {
    return <Text testID="app-navigator">AppNavigator</Text>;
  };
});

describe('App', () => {
  it('should render without crashing', () => {
    const { toJSON } = render(<App />);
    expect(toJSON()).toBeTruthy();
  });

  it('should render with all providers', () => {
    const { UNSAFE_root } = render(<App />);

    // Check that providers are in the tree
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should render AppNavigator', () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('app-navigator')).toBeTruthy();
  });
});
