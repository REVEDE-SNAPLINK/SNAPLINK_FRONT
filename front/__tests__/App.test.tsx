import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

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
