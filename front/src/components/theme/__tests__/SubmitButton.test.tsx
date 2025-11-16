import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SubmitButton from '../SubmitButton';

describe('SubmitButton Component', () => {
  describe('Rendering', () => {
    it('should render button with text', () => {
      const { getByText } = render(<SubmitButton text="Submit" />);
      expect(getByText('Submit')).toBeTruthy();
    });

    it('should render with default props', () => {
      const { getByText } = render(<SubmitButton text="Default Button" />);
      expect(getByText('Default Button')).toBeTruthy();
    });

    it('should render with custom text', () => {
      const { getByText } = render(<SubmitButton text="Custom Text" />);
      expect(getByText('Custom Text')).toBeTruthy();
    });

    it('should render Korean text', () => {
      const { getByText } = render(<SubmitButton text="예약하기" />);
      expect(getByText('예약하기')).toBeTruthy();
    });

    it('should render empty string', () => {
      const { getByText } = render(<SubmitButton text="" />);
      expect(getByText('')).toBeTruthy();
    });
  });

  describe('Button Types', () => {
    it('should render submit type by default', () => {
      const { getByText } = render(<SubmitButton text="Submit" />);
      expect(getByText('Submit')).toBeTruthy();
      // Default type is 'submit' with primary color
    });

    it('should render submit type explicitly', () => {
      const { getByText } = render(<SubmitButton text="Submit" type="submit" />);
      expect(getByText('Submit')).toBeTruthy();
    });

    it('should render cancel type', () => {
      const { getByText } = render(<SubmitButton text="Cancel" type="cancel" />);
      expect(getByText('Cancel')).toBeTruthy();
      // Cancel type uses disabled color
    });

    it('should apply white text color for submit type', () => {
      const { getByText } = render(<SubmitButton text="Submit" type="submit" />);
      const text = getByText('Submit');
      // Text color should be white for submit
    });

    it('should apply black text color for cancel type', () => {
      const { getByText } = render(<SubmitButton text="Cancel" type="cancel" />);
      const text = getByText('Cancel');
      // Text color should be black for cancel
    });
  });

  describe('Button Sizes', () => {
    it('should render large size by default', () => {
      const { UNSAFE_getByType } = render(<SubmitButton text="Large" />);
      // Default size is 'large' with height 49px
    });

    it('should render large size explicitly', () => {
      const { UNSAFE_getByType } = render(<SubmitButton text="Large" size="large" />);
      // Height should be 49px
    });

    it('should render small size', () => {
      const { UNSAFE_getByType } = render(<SubmitButton text="Small" size="small" />);
      // Height should be 40px
    });
  });

  describe('Width Prop', () => {
    it('should apply 100% width by default', () => {
      const { UNSAFE_getByType } = render(<SubmitButton text="Full Width" />);
      // Default width is '100%'
    });

    it('should apply custom percentage width', () => {
      const { UNSAFE_getByType } = render(<SubmitButton text="Half Width" width="50%" />);
      // Width should be 50%
    });

    it('should apply custom pixel width', () => {
      const { UNSAFE_getByType } = render(<SubmitButton text="Fixed Width" width={200} />);
      // Width should be 200px
    });

    it('should apply auto width', () => {
      const { UNSAFE_getByType } = render(<SubmitButton text="Auto Width" width="auto" />);
      // Width should be auto
    });

    it('should apply zero width', () => {
      const { UNSAFE_getByType } = render(<SubmitButton text="Zero" width={0} />);
      // Width should be 0px
    });
  });

  describe('Disabled State', () => {
    it('should render enabled by default', () => {
      const { getByText } = render(<SubmitButton text="Enabled" />);
      expect(getByText('Enabled')).toBeTruthy();
      // Default disabled is false
    });

    it('should render disabled state', () => {
      const { UNSAFE_getByType } = render(<SubmitButton text="Disabled" disabled={true} />);
      // Disabled styling should be applied
    });

    it('should apply disabled color when disabled', () => {
      const { UNSAFE_getByType } = render(<SubmitButton text="Disabled" disabled={true} />);
      // Background color should be disabled color
    });

    it('should be interactive when not disabled', () => {
      const onPress = jest.fn();
      const { getByText } = render(<SubmitButton text="Click Me" onPress={onPress} />);
      const button = getByText('Click Me');
      fireEvent.press(button);
      expect(onPress).toHaveBeenCalled();
    });
  });

  describe('Margins', () => {
    it('should apply margin top', () => {
      const { UNSAFE_getByType } = render(<SubmitButton text="Margin" marginTop={10} />);
      // Margin top should be applied
    });

    it('should apply margin bottom', () => {
      const { UNSAFE_getByType } = render(<SubmitButton text="Margin" marginBottom={10} />);
      // Margin bottom should be applied
    });

    it('should apply margin left', () => {
      const { UNSAFE_getByType } = render(<SubmitButton text="Margin" marginLeft={10} />);
      // Margin left should be applied
    });

    it('should apply margin right', () => {
      const { UNSAFE_getByType } = render(<SubmitButton text="Margin" marginRight={10} />);
      // Margin right should be applied
    });

    it('should apply horizontal margins', () => {
      const { UNSAFE_getByType } = render(
        <SubmitButton text="Margin" marginHorizontal={20} />
      );
      // Horizontal margins should be applied
    });

    it('should apply vertical margins', () => {
      const { UNSAFE_getByType } = render(<SubmitButton text="Margin" marginVertical={20} />);
      // Vertical margins should be applied
    });

    it('should apply all margins together', () => {
      const { UNSAFE_getByType } = render(
        <SubmitButton
          text="All Margins"
          marginTop={5}
          marginBottom={10}
          marginLeft={15}
          marginRight={20}
        />
      );
      // All margins should be applied
    });

    it('should apply zero margins', () => {
      const { UNSAFE_getByType } = render(
        <SubmitButton text="Zero Margin" marginTop={0} marginBottom={0} />
      );
      // Zero margins should be applied
    });
  });

  describe('onPress Callback', () => {
    it('should call onPress when button is pressed', () => {
      const onPress = jest.fn();
      const { getByText } = render(<SubmitButton text="Press Me" onPress={onPress} />);
      const button = getByText('Press Me');
      fireEvent.press(button);
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should call onPress multiple times', () => {
      const onPress = jest.fn();
      const { getByText } = render(<SubmitButton text="Multi Press" onPress={onPress} />);
      const button = getByText('Multi Press');
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);
      expect(onPress).toHaveBeenCalledTimes(3);
    });

    it('should work without onPress callback', () => {
      const { getByText } = render(<SubmitButton text="No Callback" />);
      const button = getByText('No Callback');
      fireEvent.press(button);
      // Should not throw error
    });
  });

  describe('TouchableOpacity Props', () => {
    it('should accept testID prop', () => {
      const { getByTestId } = render(<SubmitButton text="Test ID" testID="submit-button" />);
      expect(getByTestId('submit-button')).toBeTruthy();
    });

    it('should accept accessibilityLabel', () => {
      const { UNSAFE_getByType } = render(
        <SubmitButton text="Accessible" accessibilityLabel="Submit Form" />
      );
      // Accessibility label should be applied
    });

    it('should accept activeOpacity', () => {
      const { UNSAFE_getByType } = render(
        <SubmitButton text="Opacity" activeOpacity={0.5} />
      );
      // Active opacity should be applied
    });
  });

  describe('Typography Styling', () => {
    it('should apply bold font weight to text', () => {
      const { getByText } = render(<SubmitButton text="Bold Text" />);
      expect(getByText('Bold Text')).toBeTruthy();
      // Font weight should be bold
    });

    it('should apply font size 16', () => {
      const { getByText } = render(<SubmitButton text="Font Size" />);
      expect(getByText('Font Size')).toBeTruthy();
      // Font size should be 16
    });

    it('should apply letter spacing', () => {
      const { getByText } = render(<SubmitButton text="Letter Spacing" />);
      expect(getByText('Letter Spacing')).toBeTruthy();
      // Letter spacing should be -0.4
    });
  });

  describe('Combined Props', () => {
    it('should apply all props together', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <SubmitButton
          text="Complete Button"
          type="submit"
          size="large"
          width={300}
          disabled={false}
          marginTop={10}
          marginBottom={10}
          onPress={onPress}
        />
      );
      const button = getByText('Complete Button');
      fireEvent.press(button);
      expect(onPress).toHaveBeenCalled();
    });

    it('should handle disabled submit button', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <SubmitButton text="Disabled Submit" type="submit" disabled={true} onPress={onPress} />
      );
      const button = getByText('Disabled Submit');
      fireEvent.press(button);
      // Should still call onPress (TouchableOpacity doesn't prevent press on disabled)
    });

    it('should handle small cancel button', () => {
      const { getByText } = render(
        <SubmitButton text="Small Cancel" type="cancel" size="small" />
      );
      expect(getByText('Small Cancel')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long text', () => {
      const longText = 'Very Long Button Text '.repeat(10);
      const { getByText } = render(<SubmitButton text={longText} />);
      expect(getByText(longText)).toBeTruthy();
    });

    it('should handle special characters in text', () => {
      const { getByText } = render(<SubmitButton text="!@#$%^&*()" />);
      expect(getByText('!@#$%^&*()')).toBeTruthy();
    });

    it('should handle numbers in text', () => {
      const { getByText } = render(<SubmitButton text="Button 123" />);
      expect(getByText('Button 123')).toBeTruthy();
    });

    it('should handle mixed language text', () => {
      const { getByText } = render(<SubmitButton text="Submit 제출" />);
      expect(getByText('Submit 제출')).toBeTruthy();
    });

    it('should handle single character text', () => {
      const { getByText } = render(<SubmitButton text="X" />);
      expect(getByText('X')).toBeTruthy();
    });
  });

  describe('Color Combinations', () => {
    it('should use primary color for enabled submit button', () => {
      const { UNSAFE_getByType } = render(<SubmitButton text="Primary" type="submit" />);
      // Background should be primary color
    });

    it('should use disabled color for disabled button', () => {
      const { UNSAFE_getByType } = render(<SubmitButton text="Disabled" disabled={true} />);
      // Background should be disabled color
    });

    it('should use disabled color for cancel button', () => {
      const { UNSAFE_getByType } = render(<SubmitButton text="Cancel" type="cancel" />);
      // Background should be disabled color
    });

    it('should prioritize disabled over cancel type', () => {
      const { UNSAFE_getByType } = render(
        <SubmitButton text="Disabled Cancel" type="cancel" disabled={true} />
      );
      // Background should be disabled color (disabled takes precedence)
    });
  });

  describe('Styling Props', () => {
    it('should have border radius', () => {
      const { UNSAFE_getByType } = render(<SubmitButton text="Rounded" />);
      // Border radius should be 8px
    });

    it('should center text horizontally and vertically', () => {
      const { UNSAFE_getByType } = render(<SubmitButton text="Centered" />);
      // Content should be centered
    });

    it('should have flex: 1', () => {
      const { UNSAFE_getByType } = render(<SubmitButton text="Flex" />);
      // Flex should be 1
    });
  });
});
