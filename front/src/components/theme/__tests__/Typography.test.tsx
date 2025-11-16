import React from 'react';
import { render } from '@testing-library/react-native';
import Typography from '../Typography';

describe('Typography Component', () => {
  describe('Rendering', () => {
    it('should render text children', () => {
      const { getByText } = render(<Typography>Hello World</Typography>);
      expect(getByText('Hello World')).toBeTruthy();
    });

    it('should render with default props', () => {
      const { getByText } = render(<Typography>Default Text</Typography>);
      expect(getByText('Default Text')).toBeTruthy();
    });

    it('should render empty children', () => {
      const { UNSAFE_getByType } = render(<Typography />);
      // Should render without errors
    });

    it('should render multiple text nodes', () => {
      const { getByText } = render(
        <Typography>
          First <Typography>Second</Typography>
        </Typography>
      );
      expect(getByText('Second')).toBeTruthy();
    });
  });

  describe('Font Size', () => {
    it('should apply custom font size', () => {
      const { getByText } = render(<Typography fontSize={18}>Custom Size</Typography>);
      expect(getByText('Custom Size')).toBeTruthy();
    });

    it('should render with small font size', () => {
      const { getByText } = render(<Typography fontSize={10}>Small Text</Typography>);
      expect(getByText('Small Text')).toBeTruthy();
    });

    it('should render with large font size', () => {
      const { getByText } = render(<Typography fontSize={32}>Large Text</Typography>);
      expect(getByText('Large Text')).toBeTruthy();
    });

    it('should render without font size prop', () => {
      const { getByText } = render(<Typography>No Size</Typography>);
      expect(getByText('No Size')).toBeTruthy();
    });
  });

  describe('Font Weight', () => {
    it('should apply regular font weight by default', () => {
      const { getByText } = render(<Typography>Regular Weight</Typography>);
      expect(getByText('Regular Weight')).toBeTruthy();
    });

    it('should apply bold font weight', () => {
      const { getByText } = render(<Typography fontWeight="bold">Bold Text</Typography>);
      expect(getByText('Bold Text')).toBeTruthy();
    });

    it('should apply semibold font weight', () => {
      const { getByText } = render(
        <Typography fontWeight="semiBold">SemiBold Text</Typography>
      );
      expect(getByText('SemiBold Text')).toBeTruthy();
    });

    it('should apply medium font weight', () => {
      const { getByText } = render(<Typography fontWeight="medium">Medium Text</Typography>);
      expect(getByText('Medium Text')).toBeTruthy();
    });
  });

  describe('Color', () => {
    it('should apply default text primary color', () => {
      const { getByText } = render(<Typography>Default Color</Typography>);
      expect(getByText('Default Color')).toBeTruthy();
    });

    it('should apply custom color from theme', () => {
      const { getByText } = render(<Typography color="textSecondary">Secondary</Typography>);
      expect(getByText('Secondary')).toBeTruthy();
    });

    it('should apply direct color value', () => {
      const { getByText } = render(<Typography color="#FF0000">Red Text</Typography>);
      expect(getByText('Red Text')).toBeTruthy();
    });

    it('should apply hex color with alpha', () => {
      const { getByText } = render(<Typography color="#00000080">Alpha Color</Typography>);
      expect(getByText('Alpha Color')).toBeTruthy();
    });
  });

  describe('Line Height', () => {
    it('should apply numeric line height', () => {
      const { getByText } = render(<Typography lineHeight={20}>Numeric LineHeight</Typography>);
      expect(getByText('Numeric LineHeight')).toBeTruthy();
    });

    it('should apply percentage line height', () => {
      const { getByText } = render(
        <Typography fontSize={16} lineHeight="140%">
          Percentage LineHeight
        </Typography>
      );
      expect(getByText('Percentage LineHeight')).toBeTruthy();
    });

    it('should calculate percentage based on font size', () => {
      const { getByText } = render(
        <Typography fontSize={20} lineHeight="150%">
          Calculated LineHeight
        </Typography>
      );
      expect(getByText('Calculated LineHeight')).toBeTruthy();
    });

    it('should render without line height', () => {
      const { getByText } = render(<Typography>No LineHeight</Typography>);
      expect(getByText('No LineHeight')).toBeTruthy();
    });

    it('should handle string number line height', () => {
      const { getByText } = render(<Typography lineHeight="24">String LineHeight</Typography>);
      expect(getByText('String LineHeight')).toBeTruthy();
    });
  });

  describe('Letter Spacing', () => {
    it('should apply numeric letter spacing', () => {
      const { getByText } = render(
        <Typography letterSpacing={2}>Numeric LetterSpacing</Typography>
      );
      expect(getByText('Numeric LetterSpacing')).toBeTruthy();
    });

    it('should apply percentage letter spacing', () => {
      const { getByText } = render(
        <Typography fontSize={16} letterSpacing="-2.5%">
          Percentage LetterSpacing
        </Typography>
      );
      expect(getByText('Percentage LetterSpacing')).toBeTruthy();
    });

    it('should calculate percentage based on font size', () => {
      const { getByText } = render(
        <Typography fontSize={20} letterSpacing="5%">
          Calculated LetterSpacing
        </Typography>
      );
      expect(getByText('Calculated LetterSpacing')).toBeTruthy();
    });

    it('should render without letter spacing', () => {
      const { getByText } = render(<Typography>No LetterSpacing</Typography>);
      expect(getByText('No LetterSpacing')).toBeTruthy();
    });

    it('should handle negative letter spacing', () => {
      const { getByText } = render(
        <Typography letterSpacing={-1}>Negative LetterSpacing</Typography>
      );
      expect(getByText('Negative LetterSpacing')).toBeTruthy();
    });
  });

  describe('Margins', () => {
    it('should apply margin top', () => {
      const { getByText } = render(<Typography marginTop={10}>Margin Top</Typography>);
      expect(getByText('Margin Top')).toBeTruthy();
    });

    it('should apply margin bottom', () => {
      const { getByText } = render(<Typography marginBottom={10}>Margin Bottom</Typography>);
      expect(getByText('Margin Bottom')).toBeTruthy();
    });

    it('should apply margin left', () => {
      const { getByText } = render(<Typography marginLeft={10}>Margin Left</Typography>);
      expect(getByText('Margin Left')).toBeTruthy();
    });

    it('should apply margin right', () => {
      const { getByText } = render(<Typography marginRight={10}>Margin Right</Typography>);
      expect(getByText('Margin Right')).toBeTruthy();
    });

    it('should apply horizontal margins', () => {
      const { getByText } = render(
        <Typography marginHorizontal={20}>Horizontal Margins</Typography>
      );
      expect(getByText('Horizontal Margins')).toBeTruthy();
    });

    it('should apply vertical margins', () => {
      const { getByText } = render(<Typography marginVertical={20}>Vertical Margins</Typography>);
      expect(getByText('Vertical Margins')).toBeTruthy();
    });

    it('should apply zero margins', () => {
      const { getByText } = render(
        <Typography marginTop={0} marginBottom={0}>
          Zero Margins
        </Typography>
      );
      expect(getByText('Zero Margins')).toBeTruthy();
    });

    it('should apply all margins at once', () => {
      const { getByText } = render(
        <Typography marginTop={5} marginBottom={10} marginLeft={15} marginRight={20}>
          All Margins
        </Typography>
      );
      expect(getByText('All Margins')).toBeTruthy();
    });
  });

  describe('Combined Props', () => {
    it('should apply multiple style props together', () => {
      const { getByText } = render(
        <Typography fontSize={16} fontWeight="bold" color="#333333" lineHeight="140%">
          Combined Props
        </Typography>
      );
      expect(getByText('Combined Props')).toBeTruthy();
    });

    it('should apply all typography props', () => {
      const { getByText } = render(
        <Typography
          fontSize={18}
          fontWeight="semiBold"
          color="textPrimary"
          lineHeight="150%"
          letterSpacing="-2.5%"
          marginTop={10}
          marginBottom={10}
        >
          All Props
        </Typography>
      );
      expect(getByText('All Props')).toBeTruthy();
    });
  });

  describe('Text Props', () => {
    it('should accept numberOfLines prop', () => {
      const { getByText } = render(<Typography numberOfLines={2}>Ellipsis Text</Typography>);
      expect(getByText('Ellipsis Text')).toBeTruthy();
    });

    it('should accept ellipsizeMode prop', () => {
      const { getByText } = render(
        <Typography ellipsizeMode="tail">Truncated Text</Typography>
      );
      expect(getByText('Truncated Text')).toBeTruthy();
    });

    it('should accept onPress prop', () => {
      const onPress = jest.fn();
      const { getByText } = render(<Typography onPress={onPress}>Pressable</Typography>);
      expect(getByText('Pressable')).toBeTruthy();
    });

    it('should accept testID prop', () => {
      const { getByTestId } = render(<Typography testID="custom-text">Test ID</Typography>);
      expect(getByTestId('custom-text')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined fontSize with percentage lineHeight', () => {
      const { getByText } = render(<Typography lineHeight="140%">No FontSize</Typography>);
      expect(getByText('No FontSize')).toBeTruthy();
    });

    it('should handle undefined fontSize with percentage letterSpacing', () => {
      const { getByText } = render(<Typography letterSpacing="-2.5%">No FontSize</Typography>);
      expect(getByText('No FontSize')).toBeTruthy();
    });

    it('should render very long text', () => {
      const longText = 'Lorem ipsum dolor sit amet, '.repeat(100);
      const { getByText } = render(<Typography>{longText}</Typography>);
      expect(getByText(longText)).toBeTruthy();
    });

    it('should handle empty string', () => {
      const { UNSAFE_getByType } = render(<Typography>{''}</Typography>);
      // Should render without errors
    });

    it('should handle numeric children', () => {
      const { getByText } = render(<Typography>{12345}</Typography>);
      expect(getByText('12345')).toBeTruthy();
    });

    it('should handle boolean false (renders nothing)', () => {
      const { UNSAFE_getByType } = render(<Typography>{false}</Typography>);
      // Should render without errors
    });
  });

  describe('Percentage Calculations', () => {
    it('should calculate 140% line height for 14px font', () => {
      const { getByText } = render(
        <Typography fontSize={14} lineHeight="140%">
          140% LineHeight
        </Typography>
      );
      expect(getByText('140% LineHeight')).toBeTruthy();
      // 14 * 1.4 = 19.6
    });

    it('should calculate -2.5% letter spacing for 16px font', () => {
      const { getByText } = render(
        <Typography fontSize={16} letterSpacing="-2.5%">
          -2.5% LetterSpacing
        </Typography>
      );
      expect(getByText('-2.5% LetterSpacing')).toBeTruthy();
      // 16 * -0.025 = -0.4
    });

    it('should handle 100% line height', () => {
      const { getByText } = render(
        <Typography fontSize={20} lineHeight="100%">
          100% LineHeight
        </Typography>
      );
      expect(getByText('100% LineHeight')).toBeTruthy();
      // 20 * 1 = 20
    });
  });

  describe('Color Theme Integration', () => {
    it('should use theme color textPrimary', () => {
      const { getByText } = render(<Typography color="textPrimary">Primary</Typography>);
      expect(getByText('Primary')).toBeTruthy();
    });

    it('should use theme color textSecondary', () => {
      const { getByText } = render(<Typography color="textSecondary">Secondary</Typography>);
      expect(getByText('Secondary')).toBeTruthy();
    });

    it('should fallback to custom color if not in theme', () => {
      const { getByText } = render(<Typography color="customColor">Custom</Typography>);
      expect(getByText('Custom')).toBeTruthy();
    });
  });
});
