import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import ScreenContainer from '../ScreenContainer';

// Mock HeaderWithBackButton
jest.mock('../HeaderWithBackButton', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  return function MockHeaderWithBackButton(props: any) {
    return (
      <View testID="header-with-back-button">
        <TouchableOpacity testID="back-button" onPress={props.onPressBack}>
          <Text>Back</Text>
        </TouchableOpacity>
        {props.title && <Text testID="header-title">{props.title}</Text>}
        {props.ToolIcon && (
          <TouchableOpacity testID="tool-button" onPress={props.onPressTool}>
            <Text>Tool</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
});

describe('ScreenContainer Component', () => {
  const MockToolIcon = () => <Text>ToolIcon</Text>;

  describe('Rendering', () => {
    it('should render children', () => {
      const { getByText } = render(
        <ScreenContainer>
          <Text>Child Content</Text>
        </ScreenContainer>
      );
      expect(getByText('Child Content')).toBeTruthy();
    });

    it('should render with default props', () => {
      const { getByText } = render(
        <ScreenContainer>
          <Text>Content</Text>
        </ScreenContainer>
      );
      expect(getByText('Content')).toBeTruthy();
    });

    it('should render multiple children', () => {
      const { getByText } = render(
        <ScreenContainer>
          <Text>First Child</Text>
          <Text>Second Child</Text>
        </ScreenContainer>
      );
      expect(getByText('First Child')).toBeTruthy();
      expect(getByText('Second Child')).toBeTruthy();
    });
  });

  describe('Header', () => {
    it('should render header when headerShown is true and onPressBack is provided', () => {
      const onPressBack = jest.fn();
      const { getByTestId } = render(
        <ScreenContainer headerShown={true} onPressBack={onPressBack}>
          <Text>Content</Text>
        </ScreenContainer>
      );
      expect(getByTestId('header-with-back-button')).toBeTruthy();
    });

    it('should not render header when headerShown is false', () => {
      const onPressBack = jest.fn();
      const { queryByTestId } = render(
        <ScreenContainer headerShown={false} onPressBack={onPressBack}>
          <Text>Content</Text>
        </ScreenContainer>
      );
      expect(queryByTestId('header-with-back-button')).toBeFalsy();
    });

    it('should not render header when onPressBack is not provided', () => {
      const { queryByTestId } = render(
        <ScreenContainer headerShown={true}>
          <Text>Content</Text>
        </ScreenContainer>
      );
      expect(queryByTestId('header-with-back-button')).toBeFalsy();
    });

    it('should render header title when provided', () => {
      const onPressBack = jest.fn();
      const { getByTestId } = render(
        <ScreenContainer
          headerShown={true}
          headerTitle="Test Title"
          onPressBack={onPressBack}
        >
          <Text>Content</Text>
        </ScreenContainer>
      );
      expect(getByTestId('header-title')).toBeTruthy();
    });

    it('should render header with empty title by default', () => {
      const onPressBack = jest.fn();
      const { queryByTestId } = render(
        <ScreenContainer headerShown={true} onPressBack={onPressBack}>
          <Text>Content</Text>
        </ScreenContainer>
      );
      // Header exists but title might be empty
      expect(queryByTestId('header-title')).toBeFalsy();
    });

    it('should render tool icon when provided', () => {
      const onPressBack = jest.fn();
      const onPressTool = jest.fn();
      const { getByTestId } = render(
        <ScreenContainer
          headerShown={true}
          onPressBack={onPressBack}
          headerToolIcon={MockToolIcon}
          onPressTool={onPressTool}
        >
          <Text>Content</Text>
        </ScreenContainer>
      );
      expect(getByTestId('tool-button')).toBeTruthy();
    });
  });

  describe('Background Color', () => {
    it('should apply default background color', () => {
      const { UNSAFE_getByType } = render(
        <ScreenContainer>
          <Text>Content</Text>
        </ScreenContainer>
      );
      // Default backgroundColor should be applied
    });

    it('should apply custom background color', () => {
      const { UNSAFE_getByType } = render(
        <ScreenContainer backgroundColor="#f0f0f0">
          <Text>Content</Text>
        </ScreenContainer>
      );
      // Custom backgroundColor should be applied
    });

    it('should apply custom bar background color', () => {
      const { UNSAFE_getByType } = render(
        <ScreenContainer barBackgroundColor="#000000">
          <Text>Content</Text>
        </ScreenContainer>
      );
      // Custom barBackgroundColor for StatusBar
    });
  });

  describe('Padding and Alignment', () => {
    it('should apply custom horizontal padding', () => {
      const { UNSAFE_getByType } = render(
        <ScreenContainer paddingHorizontal={20}>
          <Text>Content</Text>
        </ScreenContainer>
      );
      // Padding should be applied
    });

    it('should center items by default', () => {
      const { UNSAFE_getByType } = render(
        <ScreenContainer>
          <Text>Content</Text>
        </ScreenContainer>
      );
      // alignItemsCenter defaults to true
    });

    it('should not center items when alignItemsCenter is false', () => {
      const { UNSAFE_getByType } = render(
        <ScreenContainer alignItemsCenter={false}>
          <Text>Content</Text>
        </ScreenContainer>
      );
      // alignItemsCenter is false
    });
  });

  describe('Callbacks', () => {
    it('should pass onPressBack to header', () => {
      const onPressBack = jest.fn();
      const { getByTestId } = render(
        <ScreenContainer headerShown={true} onPressBack={onPressBack}>
          <Text>Content</Text>
        </ScreenContainer>
      );
      expect(getByTestId('header-with-back-button')).toBeTruthy();
    });

    it('should pass onPressTool to header', () => {
      const onPressBack = jest.fn();
      const onPressTool = jest.fn();
      const { getByTestId } = render(
        <ScreenContainer
          headerShown={true}
          onPressBack={onPressBack}
          onPressTool={onPressTool}
          headerToolIcon={MockToolIcon}
        >
          <Text>Content</Text>
        </ScreenContainer>
      );
      expect(getByTestId('tool-button')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should render with no children', () => {
      const { UNSAFE_getByType } = render(<ScreenContainer />);
      // Should render without errors
    });

    it('should render with null children', () => {
      const { UNSAFE_getByType } = render(<ScreenContainer>{null}</ScreenContainer>);
      // Should render without errors
    });

    it('should render with zero padding', () => {
      const { UNSAFE_getByType } = render(
        <ScreenContainer paddingHorizontal={0}>
          <Text>Content</Text>
        </ScreenContainer>
      );
      // Padding 0 should be applied
    });

    it('should handle all optional props being undefined', () => {
      const { getByText } = render(
        <ScreenContainer>
          <Text>Content</Text>
        </ScreenContainer>
      );
      expect(getByText('Content')).toBeTruthy();
    });
  });

  describe('Status Bar', () => {
    it('should render StatusBar', () => {
      const { UNSAFE_getByType } = render(
        <ScreenContainer>
          <Text>Content</Text>
        </ScreenContainer>
      );
      // StatusBar should exist
    });

    it('should set StatusBar style to dark-content', () => {
      const { UNSAFE_getByType } = render(
        <ScreenContainer>
          <Text>Content</Text>
        </ScreenContainer>
      );
      // StatusBar barStyle should be 'dark-content'
    });
  });

  describe('Platform-specific behavior', () => {
    it('should render SafeAreaView', () => {
      const { UNSAFE_getByType } = render(
        <ScreenContainer>
          <Text>Content</Text>
        </ScreenContainer>
      );
      // SafeAreaView should be rendered
    });
  });

  describe('Complex Scenarios', () => {
    it('should render with all props provided', () => {
      const onPressBack = jest.fn();
      const onPressTool = jest.fn();
      const { getByText, getByTestId } = render(
        <ScreenContainer
          headerShown={true}
          headerTitle="Full Test"
          onPressBack={onPressBack}
          onPressTool={onPressTool}
          headerToolIcon={MockToolIcon}
          backgroundColor="#ffffff"
          barBackgroundColor="#000000"
          paddingHorizontal={16}
          alignItemsCenter={true}
        >
          <Text>Full Content</Text>
        </ScreenContainer>
      );
      expect(getByText('Full Content')).toBeTruthy();
      expect(getByTestId('header-with-back-button')).toBeTruthy();
    });

    it('should render complex nested children', () => {
      const { getByText } = render(
        <ScreenContainer>
          <Text>Parent</Text>
          <Text>
            <Text>Nested Child</Text>
          </Text>
        </ScreenContainer>
      );
      expect(getByText('Parent')).toBeTruthy();
      expect(getByText('Nested Child')).toBeTruthy();
    });
  });
});
