import { ActivityIndicator } from 'react-native';
import styled from '@/utils/scale/CustomStyled';
import { theme } from '@/theme';

interface LoadingProps {
  /**
   * Size of the spinner
   * - 'large': Full-screen loading (initial page load)
   * - 'small': Inline loading (pagination, footer)
   */
  size?: 'small' | 'large';
  /**
   * Color of the spinner
   * Defaults to theme.colors.primary
   */
  color?: string;
  /**
   * Layout variant
   * - 'fullscreen': Centered in full screen (default for large)
   * - 'inline': Inline with padding (default for small)
   */
  variant?: 'fullscreen' | 'inline';
}

/**
 * Unified Loading Spinner Component
 *
 * Provides consistent loading UI across the entire app.
 *
 * @example
 * ```tsx
 * // Full-screen loading
 * <Loading size="large" />
 *
 * // Pagination footer loading
 * <Loading size="small" variant="inline" />
 * ```
 */
export default function Loading({
  size = 'large',
  color = theme.colors.primary,
  variant,
}: LoadingProps) {
  // Auto-determine variant based on size if not specified
  const finalVariant = variant || (size === 'large' ? 'fullscreen' : 'inline');

  if (finalVariant === 'fullscreen') {
    return (
      <FullScreenContainer>
        <ActivityIndicator size={size} color={color} />
      </FullScreenContainer>
    );
  }

  return (
    <InlineContainer>
      <ActivityIndicator size={size} color={color} />
    </InlineContainer>
  );
}

/**
 * Full-screen centered container
 */
const FullScreenContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: transparent;
`;

/**
 * Inline container with padding
 */
const InlineContainer = styled.View`
  padding-vertical: 20px;
  align-items: center;
  justify-content: center;
`;
